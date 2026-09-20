import { ActionErrorCode } from "@/types/types";

const PUBLIC_ERROR_MESSAGES: Record<ActionErrorCode, string> = {
  UNAUTHORIZED: "You must be signed in to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION_ERROR: "Invalid input provided.",
  DATABASE_ERROR: "Something went wrong. Please try again.",
  RATE_LIMITED: "Too many requests. Please try again later.",
  INTERNAL_ERROR: "An unexpected error occurred. Please try again.",
};

export const getPublicError = (code: ActionErrorCode) => {
  return {
    success: false as const,
    code,
    message: PUBLIC_ERROR_MESSAGES[code],
  };
};

export const handleActionError = (
  error: unknown,
  actionName: string
) => {
  console.error(`[${actionName}]`, error);
  return getPublicError("INTERNAL_ERROR");
};