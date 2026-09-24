'use server'

import { db } from "@/database/drizzle";
import { attempts, question } from "@/database/schema";
import {  and, asc, desc, eq, ilike, inArray, isNotNull, isNull, sql } from "drizzle-orm";
import { getUserSession } from "./authActions";
import { DatabaseQuestion, Question} from "@/types/types";
import { EditFormData } from "@/components/EditQuestion";
import { SortKey } from "@/app/(root)/all-questions/page";
import { attemptSchema, questionSchema } from "../validations/question";
import { z } from "zod";
import { getPublicError, handleActionError } from "../utils/actionError";
import { normalizeQuestionLabel } from "../utils/normalizeLabel";

export const addQuestion = async ({q} : {q : DatabaseQuestion}) => {
    try {
        const session = await getUserSession();
        if(!session?.user){
            return {
                ...getPublicError("UNAUTHORIZED"),
                question: null, 
            }
        }
        const userId = session.user.id;
        const parsed = questionSchema.safeParse(q)

        if (!parsed.success) {
            return {
                ...getPublicError("VALIDATION_ERROR"),
                question: null,
            }
        }

        const data = parsed.data

        const [insertedQuestion] = await db
            .insert(question)
            .values({
                id: crypto.randomUUID(),
                userId: userId,
                title: data.title,
                description: data.description,
                difficulty: data.difficulty,
                label: normalizeQuestionLabel(data.label),
                link: data.link || null,
                createdAt: new Date(),
            })
            .returning()

        return {
            success: true,
            message: 'Question added successfully',
            question: insertedQuestion,
        }
    } catch (error) {
        return {
            ...handleActionError(error, "addQuestion"),
            question: null,
        };
    }
}

export const getAllUserQuestions = async ({
    limit = 6,
    offset = 0,
    label, 
    sort = "newest", 
    q, 
}: {
    limit?: number;
    offset?: number;
    label: string, 
    sort: SortKey,
    q: string,
}) => {
    try {
        const session = await getUserSession();
        if(!session?.user){
            return {
                ...getPublicError("UNAUTHORIZED"),
                questions: [],
            }
        }

        const userId = session.user.id;

        let whereClause = eq(question.userId, userId);

        if (label === "__unlabeled__") {
            whereClause = and(
                whereClause,
                isNull(question.label)
            )!;
            } else if (label && label !== "all") {
            whereClause = and(
                whereClause,
                eq(question.label, label)
            )!;
        }

        if(q && q.trim().length > 0){
            whereClause = and(
                whereClause, 
                ilike(question.title, `%${q.trim()}%`)
            )!;
        }

        const difficultyRank = sql<number>`
            CASE
                WHEN ${question.difficulty} = 'Easy' THEN 1
                WHEN ${question.difficulty} = 'Medium' THEN 2
                WHEN ${question.difficulty} = 'Hard' THEN 3
                ELSE 999
            END
            `;

        const orderByClause = 
            sort === "oldest" 
                ? asc(question.createdAt)
                : sort === "difficultyAsc" 
                    ? [asc(difficultyRank), desc(question.createdAt)]
                    : sort === "difficultyDesc" ?
                        [desc(difficultyRank), desc(question.createdAt)]
                        : [desc(question.createdAt)];


        const questionResult = await db.select()
            .from(question)
            .where(whereClause)
            .orderBy(...(Array.isArray(orderByClause) ? orderByClause : [orderByClause]))
            .limit(limit)
            .offset(offset);
        
        const questionIds = questionResult.map(q=>q.id);

        const allAttempts = await db.select()
            .from(attempts)
            .where(inArray(attempts.questionId, questionIds));

        const attemptsByQuestionId = allAttempts.reduce((acc, attempt) => {
            if(!acc[attempt.questionId]){
                acc[attempt.questionId] = [];
            }
            acc[attempt.questionId].push(attempt);
            return acc;
        },{} as Record<string, typeof allAttempts>);

        const combined = questionResult.map(q => ({
            ...q,
            attempts: attemptsByQuestionId[q.id] || []
        }))

        return{
            success: true, 
            message: "Successfully got questions from database",
            questions: combined
        }

    } catch (error) {
        return {
            ...handleActionError(error, "getAllUserQuestions"),
            questions: [],
        };
    }
}

export const getMostRecentUserQuestions = async ({ limit }: { limit: number }) => {
  try {
    const session = await getUserSession();
    if(!session?.user){
        return {
            ...getPublicError("UNAUTHORIZED"),
            questions: [],
        }
    }

    const userId = session.user.id;

    const questionResult = await db.select()
      .from(question)
      .where(eq(question.userId, userId));

    const questionIds = questionResult.map(q => q.id);

    const allAttempts = await db.select()
      .from(attempts)
      .where(inArray(attempts.questionId, questionIds));

    const attemptsByQuestionId = allAttempts.reduce((acc, attempt) => {
      if (!acc[attempt.questionId]) {
        acc[attempt.questionId] = [];
      }
      acc[attempt.questionId].push(attempt);
      return acc;
    }, {} as Record<string, typeof allAttempts>);

    const combined = questionResult.map(q => {
        const attempts = attemptsByQuestionId[q.id] || [];

        let updatedAt: Date = q.createdAt ?? new Date(0); // fallback if somehow null

        if (attempts.length > 0) {
            const latestAttempt = attempts.reduce((latest, current) => {
            const latestDate = latest.createdAt ?? new Date(0);
            const currentDate = current.createdAt ?? new Date(0);
            return currentDate > latestDate ? current : latest;
            });

            updatedAt = latestAttempt.createdAt ?? updatedAt;
        }

        return {
            ...q,
            attempts,
            updatedAt,
        };
    });

    const sorted = combined
    .sort((a, b) => (b.updatedAt?.getTime?.() ?? 0) - (a.updatedAt?.getTime?.() ?? 0))
    .slice(0, limit);

        

    return { success: true, message: 'Got recent questions', questions: sorted };
  } catch (error) {
    return {
      ...handleActionError(error, "getMostRecentUserQuestions"),
      questions: [],
    };
  }
};

export const getQuestionById = async ({questionId} : {questionId:string}) => {
    try {
        const session = await getUserSession();
        if(!session?.user){
            return {
                ...getPublicError("UNAUTHORIZED"),
                question: null,
            }
        }

        const userId = session.user.id;
        const [q] = await db
            .select()
            .from(question)
            .where(
                and(
                    eq(question.id, questionId),
                    eq(question.userId, userId)
                )
            )
            .limit(1);

        if(!q){
            return{
                ...getPublicError("NOT_FOUND"),
                question: null
            }
        }

        const atts = await db
            .select()
            .from(attempts)
            .where(
                eq(attempts.questionId, questionId)
            );

        const fullQuestion = {
            ...q, 
            attempts: atts, 
        }

        return {
            success: true,
            message: "Found question",
            question: fullQuestion,
        }

    } catch (error) {
        return {
            ...handleActionError(
                error, 
                "getQuestionById"
            ),
            question: null,
        };
    }
}

export const deleteQuestion = async ({deleteItemId}: {deleteItemId: string}) => {
    try {
        const session = await getUserSession();
        if(!session?.user){
            return {
                ...getPublicError("UNAUTHORIZED"),
            }
        }
        const userId = session.user.id;

        const [ownedQuestion] = await db
            .select({id: question.id})
            .from(question)
            .where(
                and(
                    eq(question.id, deleteItemId),
                    eq(question.userId, userId),
                )
            )
            .limit(1);

        if(!ownedQuestion){
            return {
                ...getPublicError("NOT_FOUND"),
            }
        }

        await db.delete(attempts).where(eq(attempts.questionId, deleteItemId));
        const deletedQuestions = await db
            .delete(question)
            .where(
                and(
                    eq(question.id, deleteItemId),
                    eq(question.userId, userId), 
                )
            )
            .returning({id: question.id});

        if(deletedQuestions.length === 0){
            return {
                success: false, 
                message: "Question not found.",
            }
        }

        return {
            success: true, 
            message: "Question deleted."
        }
    } catch (error) {
        return handleActionError(error, "deleteQuestion");
    }
}


export const addAttempt = async ({
  questionId,
  attempt,
}: {
  questionId: string;
  attempt: z.infer<typeof attemptSchema>;
}) => {
  try {
    const session = await getUserSession();

    if (!session?.user) {
      return {
        ...getPublicError("UNAUTHORIZED"),
        attempt: null,
      };
    }

    const parsed = attemptSchema.safeParse(attempt);

    if (!parsed.success) {
      return {
        ...getPublicError("VALIDATION_ERROR"),
        attempt: null,
      };
    }

    const data = parsed.data;

    const [ownedQuestion] = await db
      .select({
        id: question.id,
      })
      .from(question)
      .where(
        and(
          eq(question.id, questionId),
          eq(question.userId, session.user.id)
        )
      )
      .limit(1);

    if (!ownedQuestion) {
      return {
        ...getPublicError("NOT_FOUND"),
        attempt: null,
      };
    }

    const [newAttempt] = await db
      .insert(attempts)
      .values({
        id: crypto.randomUUID(),
        questionId: ownedQuestion.id,
        solutionCode: data.solutionCode,
        language: data.language,
        neededHelp: data.neededHelp,
        durationMinutes: data.durationMinutes,
        notes: data.notes,
        createdAt: new Date(),
      })
      .returning();

    return {
      success: true as const,
      message: "Attempt added successfully",
      attempt: newAttempt,
    };
  } catch (error) {
    return {
      ...handleActionError(error, "addAttempt"),
      attempt: null,
    };
  }
};

export const deleteAttempt = async ({deleteItemId} : {deleteItemId : string}) => {
    try {
        const session = await getUserSession();
        if (!session?.user) {
            return { 
                ...getPublicError("UNAUTHORIZED"),
            };
        }
        const userId = session.user.id;

        const [ownedAttempt] = await db
            .select({id: attempts.id})
            .from(attempts)
            .innerJoin(
                question, 
                eq(attempts.questionId, question.id), 
            )
            .where(
                and(
                    eq(attempts.id, deleteItemId), 
                    eq(question.userId, userId)
                )
            )
            .limit(1);

        if(!ownedAttempt){
            return {
                ...getPublicError("NOT_FOUND"),
            }
        }

        const deletedAttempts = await db
            .delete(attempts)
            .where(eq(attempts.id, ownedAttempt.id))
            .returning({ id: attempts.id });

        if(deletedAttempts.length === 0){
            return {
                ...getPublicError("NOT_FOUND"),
            }
        }

        return {
            success: true,
            message: "Attempt successfully deleted",
        }
    } catch (error) {
        return handleActionError(error, "deleteAttempt");
    }
}

export const updateQuestion = async ({oldQuestion, newQuestion} : {oldQuestion: Question, newQuestion: EditFormData}) => {
    try {
        const session = await getUserSession();
        if(!session?.user?.id){
            return {
                ...getPublicError("UNAUTHORIZED"),
            }
        }

        const [existing] = await db.select().from(question)
            .where(and(eq(question.id, oldQuestion.id), eq(question.userId, session.user.id)))
            .limit(1);

        if(!existing){
            return {
                ...getPublicError("NOT_FOUND"),
            }
        }

        await db
            .update(question)
            .set({
                title: newQuestion.title,
                description: newQuestion.description,
                difficulty: newQuestion.difficulty,
                label: normalizeQuestionLabel(newQuestion.label),
                link: newQuestion.link ?? null,
            })
            .where(and(eq(question.id, oldQuestion.id), eq(question.userId, session.user.id)));

        if(oldQuestion.attempts?.length === newQuestion.attempts?.length && newQuestion.attempts?.length){
            for(const a of newQuestion.attempts){
                await db
                    .update(attempts)
                    .set({
                        solutionCode: a.solutionCode,
                        language: a.language,
                        neededHelp: a.neededHelp,
                        durationMinutes: a.durationMinutes,
                        notes: a.notes,
                    })
                    .where(and(eq(attempts.id, a.id), eq(attempts.questionId, oldQuestion.id)));
            }
        }

        return {
            success: true,
            message: "Question sucessfully updated"
        };
    } catch (error) {
        return handleActionError(error, "updateQuestion");
    }
}

export const getQuestionLabels = async () => {
  try {
    const session = await getUserSession();

    if (!session?.user) {
      return {
        ...getPublicError("UNAUTHORIZED"),
        labels: [],
      };
    }

    const userId = session.user.id;

    const labelRows = await db
      .selectDistinct({
        label: question.label,
      })
      .from(question)
      .where(
        and(
          eq(question.userId, userId),
          isNotNull(question.label)
        )
      );

    const labels = [
      ...new Set(
        labelRows
          .map((row) =>
            normalizeQuestionLabel(row.label)
          )
          .filter(
            (label): label is string =>
              label !== null
          )
      ),
    ].sort((a, b) => a.localeCompare(b));

    return {
      success: true,
      message: "Successfully got labels.",
      labels,
    };
  } catch (error) {
    return {
      ...handleActionError(
        error,
        "getQuestionLabels"
      ),
      labels: [],
    };
  }
};