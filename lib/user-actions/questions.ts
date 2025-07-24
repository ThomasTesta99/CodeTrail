'use server'

import { db } from "@/database/drizzle";
import { attempts, question } from "@/database/schema";
import {  eq, inArray } from "drizzle-orm";
import { getUserSession, validUser } from "./authActions";
import { Attempt, DatabaseQuestion } from "@/types/types";

export const addQuestion = async ({q} : {q : DatabaseQuestion}) => {
    try {
        const [insertedQuestion] = await db.insert(question).values(q).returning();
        return {
            success: true,
            message: 'Question added successfully',
            question: insertedQuestion,
        }
    } catch (error) {
        console.log(error, 'Error uploading to database');
        return {
            success: false,
            message: 'Failed to add question',
            error: error instanceof Error ? error.message : String(error),
        }
    }
}

export const getAllUserQuestions = async ({
    userId,
    limit = 6,
    offset = 0,
}: {
    userId: string;
    limit?: number;
    offset?: number;
}) => {
    try {
        if(!validUser(userId)){
            return {
                success: false,
                message: "Cannot access user questions",
                questions: []
            }
        }

        const questionResult = await db.select()
            .from(question)
            .where(eq(question.userId, userId))
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
       console.log(error, "Error getting questions");
        return{
            success: false, 
            message: "Error getting questions from database",
            questions: []
        }
    }
}

export const getMostRecentUserQuestions = async ({ userId, limit }: { userId: string, limit: number }) => {
  try {
    if(!validUser(userId)){
            return {
                success: false,
                message: "Cannot access user questions",
                questions: []
            }
        }

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
    console.error(error, 'Error getting recent questions');
    return { success: false, message: 'Failed to get recent questions', questions: [] };
  }
};

export const getQuestionById = async ({questionId} : {questionId:string}) => {
    try {
        const q = await db.select().from(question).where(eq(question.id, questionId)).limit(1);
        if(!q.length){
            return{
                success: false,
                message: "Question not found",
                question: null
            }
        }

        const atts = await db.select().from(attempts).where(eq(attempts.questionId, questionId));

        const fullQuestion = {
            ...q[0],
            attempts: atts.map(a=> ({
                ...a,
            }))
        }

        return {
            success: true,
            message: "Found question",
            question: fullQuestion,
        }

    } catch (error) {
        console.log(error);
        return{
            success: false,
            message: error instanceof Error ? error.message : String(error),
            question: null
        }
    }
}

export const deleteQuestion = async ({deleteItemId}: {deleteItemId: string}) => {
    try {
       const session = await getUserSession();
        if (!session?.user?.id) {
            return { success: false, message: 'Unauthorized' };
        }

        await db.delete(attempts).where(eq(attempts.questionId, deleteItemId));
        await db.delete(question).where(eq(question.id, deleteItemId));
        return { success: true, message: 'Question deleted' };
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: error instanceof Error ? error.message : String(error) 
            }
    }
}

export const addAttempt = async ({questionId, attempt}: {questionId: string, attempt: Attempt}) => {
    try {
        await db.insert(attempts).values({
            id: attempt.id,
            questionId: questionId,
            solutionCode: attempt.solutionCode,
            language: attempt.language,
            neededHelp: attempt.neededHelp,
            durationMinutes: attempt.durationMinutes,
            notes: attempt.notes,
            createdAt: attempt.createdAt,
        });

        return {
            success: true, 
            message: "Attempt added successfully"
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : String(error)
        }
    }
}

export const deleteAttempt = async ({deleteItemId} : {deleteItemId : string}) => {
    try {
        const session = await getUserSession();
        if (!session?.user?.id) {
            return { success: false, message: 'Unauthorized' };
        }

        await db.delete(attempts).where(eq(attempts.id, deleteItemId));
        return {
            success: true,
            message: "Attempt successfully deleted",
        }
    } catch (error) {
        return{
            success: false,
            message: error instanceof Error ? error.message : String(error),
        }
    }
}