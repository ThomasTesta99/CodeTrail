import { ActionErrorCode } from "@/types/types";

const PUBLIC_ERROR_MESSAGES: Record<ActionErrorCode, string> = {
  UNAUTHORIZED: "You must be signed in to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION_ERROR: "Invalid input provided.",
  DATABASE_ERROR: "Something went wrong. Please try again.",
  RATE_LIMITED: "Too many requests. Please try again later.",
  SERVICE_UNAVAILABLE: "This feature is temporarily unavailable. Please try again later.",
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

  if (
    typeof error === "object" &&
    error !== null &&
    "body" in error &&
    typeof error.body === "object" &&
    error.body !== null &&
    "code" in error.body
  ) {
    if (error.body.code === "RATE_LIMITED") {
      return getPublicError("RATE_LIMITED");
    }

    if (error.body.code === "SERVICE_UNAVAILABLE") {
      return getPublicError("SERVICE_UNAVAILABLE");
    }
  }

  return getPublicError("INTERNAL_ERROR");
};