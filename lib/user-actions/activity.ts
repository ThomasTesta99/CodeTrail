"use server";

import { db } from "@/database/drizzle";
import { attempts, question } from "@/database/schema";
import { GetUserActivityResult } from "@/types/types";
import { and, eq, gte, lt, sql } from "drizzle-orm";
import {
  getPublicError,
  handleActionError,
} from "../utils/actionError";
import { getUserSession } from "./authHelpers";

export const getUserActivity = async (
  year: number
): Promise<GetUserActivityResult> => {
  try {
    const session = await getUserSession();

    if (!session?.user) {
      return {
        ...getPublicError("UNAUTHORIZED"),
        activity: [],
      };
    }

    if (
      !Number.isInteger(year) ||
      year < 1970 ||
      year > 9998
    ) {
      return {
        ...getPublicError("VALIDATION_ERROR"),
        activity: [],
      };
    }

    const userId = session.user.id;

    const startDate = new Date(
      Date.UTC(year, 0, 1)
    );

    const endDate = new Date(
      Date.UTC(year + 1, 0, 1)
    );

    const activity = await db
      .select({
        date: sql<string>`
          TO_CHAR(${attempts.createdAt} AT TIME ZONE 'UTC', 'YYYY-MM-DD')
        `,
        attempts: sql<number>`
          COUNT(*)::int
        `,
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
      )
      .groupBy(
        sql`
          TO_CHAR(${attempts.createdAt} AT TIME ZONE 'UTC', 'YYYY-MM-DD')
        `
      )
      .orderBy(
        sql`
          TO_CHAR(${attempts.createdAt} AT TIME ZONE 'UTC', 'YYYY-MM-DD')
        `
      );

    return {
      success: true,
      activity,
      message: "Successfully retrieved user activity",
    };

  } catch (error) {
    return {
      ...handleActionError(
        error,
        "getUserActivity"
      ),
      activity: [],
    };
  }
};