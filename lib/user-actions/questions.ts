'use server'

import { db } from "@/database/drizzle";
import { attempts, question } from "@/database/schema";
import { eq, inArray } from "drizzle-orm";

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

export const getAllUserQuestions = async ({userId}: {userId: string}) => {
    try {
        const questionResult = await db.select()
            .from(question)
            .where(eq(question.userId, userId));
        
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

export const getQuestionById = async ({questionId} : {questionId:string}) => {
    try {
        const q = await db.select().from(question).where(eq(question.id, questionId)).limit(1);
        if(!q.length){
            return{
                success: false,
                message: "Qeustion not found",
                question: null
            }
        }

        const atts = await db.select().from(attempts).where(eq(attempts.questionId, questionId));

        const fulLQuestion = {
            ...q[0],
            attempts: atts.map(a=> ({
                ...a,
            }))
        }

        return {
            success: true,
            message: "Found question",
            question: fulLQuestion,
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