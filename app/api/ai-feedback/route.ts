import { MAX_AI_OUTPUT_TOKENS, MAX_ATTEMPTS, MAX_REQUEST_BYTES } from '@/constants';
import { db } from '@/database/drizzle';
import { attempts, question } from '@/database/schema';
import { checkRate, getUserSession } from '@/lib/user-actions/authActions';
import { aiError, buildAIFeedbackPrompt, readLimitedBody, validateAIFeedbackInput, validateAIRequestBody } from '@/lib/utils/aiFeedbackUtils';
import { and, desc, eq, ne } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import {OpenAI} from 'openai'


const openAi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getUserSession();

    if (!session?.user) {
      return aiError('Unauthorized', 401);
    }
    const user = session.user;

    if (!user.emailVerified) {
      return aiError(
        'Please verify your email before requesting AI feedback.',
        403
      );
    }

    const firstName = user.name.split(' ')[0].slice(0, 80);

    const rateCheck = await checkRate(
      user.id,
      'ai-feedback'
    );

    if (!rateCheck.valid) {
      if ('code' in rateCheck) {
        return aiError(
          'AI feedback is temporarily unavailable. Please try again later.',
          503
        );
      }

      return aiError(
        rateCheck.message || 'Rate limit exceeded.',
        429
      );
    }

    const contentLength = req.headers.get('content-length');

    if (
      contentLength !== null &&
      Number(contentLength) > MAX_REQUEST_BYTES
    ) {
      return aiError('Request body is too large', 413);
    }

    const rawBody = await readLimitedBody(req);

    if (rawBody === null) {
      return aiError('Request body is too large', 413);
    }

    let body: unknown;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return aiError('Invalid JSON request body', 400);
    }

    if (!validateAIRequestBody(body)) {
      return aiError('Invalid attempt ID', 400)
    }

    const attemptId = body.attemptId;

    const [result] = await db
      .select({
        attempt: attempts,
        question: question,
      })
      .from(attempts)
      .innerJoin(
        question,
        eq(attempts.questionId, question.id)
      )
      .where(
        and(
          eq(attempts.id, attemptId),
          eq(question.userId, user.id)
        )
      )
      .limit(1);

    if (!result) {
      return aiError('Attempt not found', 404);
    }

    const selectedAttempt = result.attempt;
    const selectedQuestion = result.question;

    const validationError = validateAIFeedbackInput(
      selectedAttempt.solutionCode,
      selectedQuestion.title,
      selectedQuestion.description,
      selectedAttempt.notes,
      selectedAttempt.language
    );

    if (validationError) {
      return aiError(validationError, 413);
    }

    const previousAttempts = await db
      .select({
        solutionCode: attempts.solutionCode,
        language: attempts.language,
        neededHelp: attempts.neededHelp,
        durationMinutes: attempts.durationMinutes,
        notes: attempts.notes,
      })
      .from(attempts)
      .where(
        and(
          eq(attempts.questionId, selectedQuestion.id),
          ne(attempts.id, selectedAttempt.id)
        )
      )
      .orderBy(
        desc(attempts.createdAt),
        desc(attempts.id)
      )
      .limit(MAX_ATTEMPTS - 1);

    const prompt = buildAIFeedbackPrompt(
      firstName,
      selectedAttempt,
      selectedQuestion,
      previousAttempts
    );

    if (!prompt) {
      return aiError(
        'AI feedback input exceeds the maximum size',
        413
      );
    }

    const completion = await openAi.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful and friendly coding assistant',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_completion_tokens: MAX_AI_OUTPUT_TOKENS
    });

    const choice = completion.choices[0];

    if (choice?.finish_reason === 'length') {
      return aiError(
        'AI feedback exceeded the maximum response length. Please try again.',
        502
      );
    }

    const response = completion.choices[0]?.message.content;

    if (!response) {
      return aiError('Failed to generate feedback', 502);
    }

    return NextResponse.json({
      success: true, 
      feedback: response,
    });
  
  } catch (error) {
    console.error('AI feedback error:', error);

    if (
      error instanceof OpenAI.APIError &&
      error.code === 'credit_balance_exhausted'
    ) {
      return aiError(
        'AI feedback is temporarily unavailable. Please try again later.',
        503
      );
    }

    if (error instanceof OpenAI.APIError) {
      return aiError(
        'AI feedback is temporarily unavailable. Please try again later.',
        502
      );
    }

    return aiError(
      'Failed to generate feedback',
      500
    );
  }
}