import { MAX_ATTEMPTS, MAX_CODE_LENGTH, MAX_DESCRIPTION_LENGTH, MAX_LANGUAGE_LENGTH, MAX_NOTES_LENGTH, MAX_PROMPT_LENGTH, MAX_REQUEST_BYTES, MAX_TITLE_LENGTH, UUID_REGEX } from "@/constants";
import { AIFeedbackAttempt, AIFeedbackQuestion } from "@/types/types";
import { NextRequest } from "next/server";

export async function readLimitedBody(
  req: NextRequest
): Promise<string | null> {
  if (!req.body) {
    return '';
  }

  const reader = req.body.getReader();
  const decoder = new TextDecoder();

  let totalBytes = 0;
  let body = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      totalBytes += value.byteLength;

      if (totalBytes > MAX_REQUEST_BYTES) {
        await reader.cancel();
        return null;
      }

      body += decoder.decode(value, { stream: true });
    }

    body += decoder.decode();

    return body;
  } finally {
    reader.releaseLock();
  }
}

export function validateText(
  value: unknown,
  fieldName: string,
  maxLength: number,
  required = true
): string | null {
  if (
    typeof value !== 'string' ||
    (required && value.trim().length === 0)
  ) {
    return `${fieldName} is invalid`;
  }

  if (value.length > maxLength) {
    return `${fieldName} exceeds the maximum of ${maxLength} characters`;
  }

  return null;
}

export function validateAIRequestBody(
  body: unknown
): body is { attemptId: string } {
  return (
    body !== null &&
    typeof body === 'object' &&
    !Array.isArray(body) &&
    Object.keys(body).length === 1 &&
    'attemptId' in body &&
    typeof body.attemptId === 'string' &&
    UUID_REGEX.test(body.attemptId)
  );
}

export function validateAIFeedbackInput(
  code: string,
  title: string,
  description: string,
  notes: string | null,
  language: string
): string | null {
  const validationErrors = [
    validateText(code, 'Solution code', MAX_CODE_LENGTH),
    validateText(title, 'Question title', MAX_TITLE_LENGTH),
    validateText(
      description,
      'Question description',
      MAX_DESCRIPTION_LENGTH
    ),
    validateText(
      notes ?? '',
      'Attempt notes',
      MAX_NOTES_LENGTH,
      false
    ),
    validateText(
      language,
      'Programming language',
      MAX_LANGUAGE_LENGTH
    ),
  ];

  return validationErrors.find(
    (error) => error !== null
  ) ?? null;
}

export function buildAIFeedbackPrompt(
  firstName: string,
  selectedAttempt: AIFeedbackAttempt,
  selectedQuestion: AIFeedbackQuestion,
  previousAttempts: AIFeedbackAttempt[]
): string | null {
  const {
    solutionCode: code,
    notes,
    language,
    neededHelp,
    durationMinutes,
  } = selectedAttempt;

  const {
    title: questionTitle,
    description: questionDescription,
  } = selectedQuestion;

  let prompt = `You are an expert coding assistant. ${firstName || 'A user'} attempted the following leetcode/technical question:
            Title: ${questionTitle}
            Description: ${questionDescription || 'N/A'}

            They submitted the following code (in ${language}):
            ${code}

            Notes from user: ${notes || 'None'}
            Time spent: ${durationMinutes || 'unknown'} minutes
            Marked as needing help: ${neededHelp ? 'Yes' : 'No'}
            Take into account the notes from ${firstName || 'the user'}
            `;

  const feedbackInstructions = `\nPlease provide constructive feedback on this attempt. Focus on where ${firstName || 'the user'} may be going wrong, how they could improve, and what they could try differently. Be supportive and specific.`;

  if (
    (prompt + feedbackInstructions).length >
    MAX_PROMPT_LENGTH
  ) {
    return null;
  }

  const allAttempts: AIFeedbackAttempt[] = [
    selectedAttempt,
  ];

  const historyHeading =
    `\n${firstName || 'The user'} also had multiple attempts:\n`;

  for (const attempt of previousAttempts.slice(
    0,
    MAX_ATTEMPTS - 1
  )) {
    const validHistory =
      validateText(
        attempt.solutionCode,
        'Solution code',
        MAX_CODE_LENGTH
      ) === null &&
      validateText(
        attempt.notes ?? '',
        'Attempt notes',
        MAX_NOTES_LENGTH,
        false
      ) === null &&
      validateText(
        attempt.language,
        'Programming language',
        MAX_LANGUAGE_LENGTH
      ) === null;

    if (!validHistory) {
      continue;
    }

    const candidateAttempts = [
      ...allAttempts,
      attempt,
    ];

    const candidatePrompt =
      prompt +
      historyHeading +
      JSON.stringify(candidateAttempts, null, 2) +
      '\n' +
      feedbackInstructions;

    if (candidatePrompt.length > MAX_PROMPT_LENGTH) {
      continue;
    }

    allAttempts.push(attempt);
  }

  if (allAttempts.length > 1) {
    prompt +=
      historyHeading +
      JSON.stringify(allAttempts, null, 2) +
      '\n';
  }

  prompt += feedbackInstructions;

  return prompt.length <= MAX_PROMPT_LENGTH
    ? prompt
    : null;
}