import "server-only";

import { db } from "@/database/drizzle";
import { account, user } from "@/database/schema";
import { and, eq } from "drizzle-orm";

export const canChangePasswordInternal = async (
  email: string
): Promise<boolean> => {
  const normalizedEmail = email.trim().toLowerCase();

  const [foundUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, normalizedEmail))
    .limit(1);

  if (!foundUser) {
    return false;
  }

  const [credentialAccount] = await db
    .select({ id: account.id })
    .from(account)
    .where(
      and(
        eq(account.userId, foundUser.id),
        eq(account.providerId, "credential")
      )
    )
    .limit(1);

  return credentialAccount !== undefined;
};