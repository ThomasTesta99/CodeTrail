'use server'

import { db } from "@/database/drizzle";
import { question } from "@/database/schema";

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