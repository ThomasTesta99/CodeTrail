import { ActionErrorCode } from "@/types/types";

const PUBLIC_ERROR_MESSAGES: Record<ActionErrorCode, string> = {
  UNAUTHORIZED: "You must be signed in to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION_ERROR: "Invalid input provided.",
  DATABASE_ERROR: "Something went wrong. Please try again.",
  RATE_LIMITED: "Too many requests. Please try again later.",
  SERVICE_UNAVAILABLE: "This feature is temporarily unavailable. Please try again later.",
  INTERNAL_ERROR: "An unexpected error occurred. Please try again.",
  LAST_SIGN_IN_METHOD: "Connect another sign-in method before unlinking this one.",
  INVALID_PASSWORD: "Your current password is incorrect.",
  REAUTH_REQUIRED: "For security, please sign out and sign back in before trying again.",
  ACCOUNT_DELETION_BLOCKED: "Account deletion is disabled for this account."
};

export const getPublicError = (code: ActionErrorCode) => {
  return {
    success: false as const,
    code,
    message: PUBLIC_ERROR_MESSAGES[code],
  };
};

export const logSafeActionError = (actionName: string, code: ActionErrorCode) => {
  console.error("[CodeTrail]", { operation: actionName, code });
};

export const handleActionError = (error: unknown, actionName: string) => {
  let publicCode: ActionErrorCode = "INTERNAL_ERROR";

  if (typeof error === "object" && error !== null && "body" in error && typeof error.body === "object" && error.body !== null && "code" in error.body) {
    if (error.body.code === "RATE_LIMITED") publicCode = "RATE_LIMITED";
    else if (error.body.code === "SERVICE_UNAVAILABLE") publicCode = "SERVICE_UNAVAILABLE";
  }

  const logCode: ActionErrorCode = publicCode === "INTERNAL_ERROR" && error instanceof Error && error.name === "DrizzleQueryError" ? "DATABASE_ERROR" : publicCode;

  logSafeActionError(actionName, logCode);
  return getPublicError(publicCode);
};