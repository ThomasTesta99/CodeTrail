'use server'

import { db } from "@/database/drizzle";
import { attempts, question } from "@/database/schema";
import {  and, asc, desc, eq, ilike, inArray, isNotNull, isNull, sql } from "drizzle-orm";
import { Question, SortKey} from "@/types/types";
import { attemptSchema, questionSchema, editQuestionSchema, EditFormData, QuestionFormData, difficultySchema} from "../validations/question";
import { z } from "zod";
import { getPublicError, handleActionError } from "../utils/actionError";
import { normalizeQuestionLabel } from "../utils/normalizeLabel";
import { revalidatePath } from "next/cache";
import { getUserSession } from "./authHelpers";

const escapeLikePattern = (value: string) => {
    return value
        .replace(/\\/g, "\\\\")
        .replace(/%/g, "\\%")
        .replace(/_/g, "\\_");
};

export const addQuestion = async ({q} : {q : QuestionFormData}) => {
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
            .returning();

        revalidatePath("/");
        revalidatePath("/all-questions");

        return {
            success: true as const,
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
    label: string;
    sort: SortKey;
    q: string;
}) => {
    try {
        const session = await getUserSession();

        if (!session?.user) {
            return {
                ...getPublicError("UNAUTHORIZED"),
                questions: [],
            };
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

        if (q && q.trim().length > 0) {
            const escapedQuery = escapeLikePattern(q.trim());
            whereClause = and(
                whereClause,
                ilike(question.title, `%${escapedQuery}%`)
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
                ? [asc(question.createdAt), asc(question.id)]
                : sort === "difficultyAsc"
                    ? [
                        asc(difficultyRank),
                        desc(question.createdAt),
                        asc(question.id),
                    ]
                    : sort === "difficultyDesc"
                        ? [
                            desc(difficultyRank),
                            desc(question.createdAt),
                            asc(question.id),
                        ]
                        : [desc(question.createdAt), asc(question.id)];

        const questionResult = await db
            .select({
                id: question.id,
                userId: question.userId,
                title: question.title,
                description: question.description,
                difficulty: question.difficulty,
                link: question.link,
                label: question.label,
                createdAt: question.createdAt,

                attemptCount: sql<number>`
                    COUNT(${attempts.id})::int
                `,

                latestAttemptAt: sql<Date | null>`
                    MAX(${attempts.createdAt})
                `,
            })
            .from(question)
            .leftJoin(
                attempts,
                eq(attempts.questionId, question.id)
            )
            .where(whereClause)
            .groupBy(
                question.id,
                question.userId,
                question.title,
                question.description,
                question.difficulty,
                question.link,
                question.label,
                question.createdAt
            )
            .orderBy(...orderByClause)
            .limit(limit)
            .offset(offset);

        const validatedQuestions = questionResult.map((q) => ({
            ...q,
            difficulty: difficultySchema.parse(q.difficulty),
        }));

        return {
            success: true as const,
            message: "Successfully got questions from database",
            questions: validatedQuestions,
        };

    } catch (error) {
        return {
            ...handleActionError(error, "getAllUserQuestions"),
            questions: [],
        };
    }
};

export const getMostRecentUserQuestions = async ({ limit }: { limit: number }) => {
    try {
        const session = await getUserSession();

        if (!session?.user) {
        return {
            ...getPublicError("UNAUTHORIZED"),
            questions: [],
        };
        }

        const userId = session.user.id;

        const latestActivity = sql<Date>`
            COALESCE(MAX(${attempts.createdAt}), ${question.createdAt})
            `;

        const questionResult = await db
            .select({
                id: question.id,
                title: question.title,
                description: question.description,
                difficulty: question.difficulty,
                link: question.link,
                createdAt: question.createdAt,

                attemptCount: sql<number>`
                COUNT(${attempts.id})::int
                `,

                latestAttemptAt: sql<Date | null>`
                MAX(${attempts.createdAt})
                `,
            })
            .from(question)
            .leftJoin(
                attempts,
                eq(attempts.questionId, question.id)
            )
            .where(eq(question.userId, userId))
            .groupBy(
                question.id,
                question.title,
                question.description,
                question.difficulty,
                question.link,
                question.createdAt
            )
            .orderBy(desc(latestActivity))
            .limit(limit);

        const validatedQuestions = questionResult.map((q) => ({
            ...q,
            difficulty: difficultySchema.parse(q.difficulty),
        }));

        return {
            success: true as const,
            message: "Got recent questions",
            questions: validatedQuestions,
        };
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

        const validatedDifficulty = difficultySchema.parse(q.difficulty);

        const atts = await db
            .select()
            .from(attempts)
            .where(
                eq(attempts.questionId, questionId)
            ).orderBy(
                asc(attempts.createdAt),
                asc(attempts.id)
            );

        const fullQuestion = {
            ...q,
            difficulty: validatedDifficulty,
            attempts: atts,
        }

        return {
            success: true as const,
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
            return getPublicError("NOT_FOUND");
        }

        revalidatePath("/");
        revalidatePath("/all-questions");
        revalidatePath(`/question/${deleteItemId}`);

        return {
            success: true as const, 
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

    revalidatePath("/");
    revalidatePath("/all-questions");
    revalidatePath(`/question/${questionId}`);

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
            .select({id: attempts.id, questionId: question.id})
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

        revalidatePath("/");
        revalidatePath("/all-questions");
        revalidatePath(`/question/${ownedAttempt.questionId}`);

        return {
            success: true as const,
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

        const parsed = editQuestionSchema.safeParse(newQuestion);
        if(!parsed.success){
            return {
                ...getPublicError("VALIDATION_ERROR"), 
            }
        }

        const data = parsed.data;

        const [existing] = await db.select().from(question)
            .where(and(eq(question.id, oldQuestion.id), eq(question.userId, session.user.id)))
            .limit(1);

        if(!existing){
            return {
                ...getPublicError("NOT_FOUND"),
            }
        }

        const submittedAttemptIds = data.attempts.map((a) => a.id);

        const existingAttempts = submittedAttemptIds.length > 0
            ? await db
                .select({ id: attempts.id })
                .from(attempts)
                .where(
                    and(
                        eq(attempts.questionId, existing.id),
                        inArray(attempts.id, submittedAttemptIds)
                    )
                )
            : [];

        if(existingAttempts.length !== submittedAttemptIds.length){
            return {
                ...getPublicError("VALIDATION_ERROR"),
            }
        }

        const questionUpdate = db
            .update(question)
            .set({
                title: data.title,
                description: data.description,
                difficulty: data.difficulty,
                label: normalizeQuestionLabel(data.label),
                link: data.link || null,
            })
            .where(
                and(
                    eq(question.id, existing.id),
                    eq(question.userId, session.user.id)
                )
            );
            
            const attemptUpdates = data.attempts.map((a) =>
                db
                    .update(attempts)
                    .set({
                        solutionCode: a.solutionCode,
                        language: a.language,
                        neededHelp: a.neededHelp,
                        durationMinutes: a.durationMinutes,
                        notes: a.notes,
                    })
                    .where(
                        and(
                            eq(attempts.id, a.id),
                            eq(attempts.questionId, existing.id)
                        )
                    )
            );

            

        await db.batch([
            questionUpdate, 
            ...attemptUpdates, 
        ] as [typeof questionUpdate, ...typeof attemptUpdates]);

        revalidatePath("/");
        revalidatePath("/all-questions");
        revalidatePath(`/question/${existing.id}`);

        return {
            success: true as const,
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
      success: true as const,
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