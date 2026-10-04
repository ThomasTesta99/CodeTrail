"use server";

import { db } from "@/database/drizzle";
import { attempts, question } from "@/database/schema";
import { GetUserActivityResult } from "@/types/types";
import { and, eq, sql } from "drizzle-orm";
import {
  getPublicError,
  handleActionError,
} from "../utils/actionError";
import { getUserSession } from "./authHelpers";

export const getUserActivity = async (
  year: number,
  timeZone: string
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

    try {
      new Intl.DateTimeFormat("en-US", {
        timeZone,
      }).format();
    } catch {
      return {
        ...getPublicError("VALIDATION_ERROR"),
        activity: [],
      };
    }

    const userId = session.user.id;

    const localDate = sql<string>`
      TO_CHAR(
        ${attempts.createdAt} AT TIME ZONE ${timeZone},
        'YYYY-MM-DD'
      )
    `;

    const localYear = sql<number>`
      EXTRACT(
        YEAR FROM ${attempts.createdAt} AT TIME ZONE ${timeZone}
      )
    `;

    const activity = await db
      .select({
        date: localDate,

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
          sql`${localYear} = ${year}`
        )
      )
      .groupBy(sql`1`)
      .orderBy(sql`1`);

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