'use server'

import { db } from "@/database/drizzle";
import { attempts, question } from "@/database/schema";
import { GetUserActivityResult } from "@/types/types";
import { and, eq, gte, lt } from "drizzle-orm";
import { getUserSession } from "./authActions";

export const getUserActivity = async (

    year: number
): Promise<GetUserActivityResult> => {
    try {
        const session = await getUserSession();
        if(!session?.user){
            return {
                success: false, 
                activity: [],
                message: "Not logged in"
            }
        }

        const userId = session.user.id;
        const startDate = new Date(Date.UTC(year, 0, 1));
        const endDate = new Date(Date.UTC(year + 1, 0, 1));

        const userAttempts = await db
            .select({
                createdAt: attempts.createdAt,
            })
            .from(attempts)
            .innerJoin(
                question,
                eq(attempts.questionId, question.id)
            )
            .where(
                and(
                    eq(question.userId, userId),
                    gte(attempts.createdAt, startDate),
                    lt(attempts.createdAt, endDate)
                )
            );

        const activityMap: Record<string, number> = {};

        for (const attempt of userAttempts) {
            const date = attempt.createdAt
                .toISOString()
                .split('T')[0];

            activityMap[date] = (activityMap[date] ?? 0) + 1;
        }

        const activity = Object.entries(activityMap).map(
            ([date, attempts]) => ({
                date,
                attempts,
            })
        );

        return {
            success: true,
            activity,
            message: "Successfully retrieved user activity",
        };

    } catch (error) {
        return {
            success: false,
            activity: [],
            message: error instanceof Error
                ? error.message
                : "Unknown error",
        };
    }
};