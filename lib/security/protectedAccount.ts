import "server-only";

export const isAccountDeletionBlocked = (userId: string) => {
  const protectedUserId = process.env.PROTECTED_CODETRAIL_USER_ID?.trim();

  return !protectedUserId || userId === protectedUserId;
};