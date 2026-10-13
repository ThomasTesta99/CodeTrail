import { ActionErrorCode } from "@/types/types";
import { AUTH_ERROR_CODES, getAuthErrorMessage } from "./authErrors";
import { APIError } from "better-auth";

const PUBLIC_ERROR_MESSAGES: Record<ActionErrorCode, string> = {
  UNAUTHORIZED: "You must be signed in to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION_ERROR: "Invalid input provided.",
  DATABASE_ERROR: "Something went wrong. Please try again.",
  RATE_LIMITED: "Too many requests. Please try again later.",
  SERVICE_UNAVAILABLE: "This feature is temporarily unavailable. Please try again later.",
  INTERNAL_ERROR: "An unexpected error occurred. Please try again.",
  LAST_SIGN_IN_METHOD: "Connect another sign-in method before unlinking this one.",
  INVALID_CREDENTIALS: "Invalid email or password.",
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
  const authCode = error instanceof APIError && typeof error.body?.code === "string" ? error.body.code : undefined;
  const publicCode: ActionErrorCode = authCode ? (AUTH_ERROR_CODES[authCode] ?? "INTERNAL_ERROR") : "INTERNAL_ERROR";

  const logCode: ActionErrorCode = publicCode === "INTERNAL_ERROR" && error instanceof Error && error.name === "DrizzleQueryError" ? "DATABASE_ERROR" : publicCode;
  logSafeActionError(actionName, logCode);

  if(actionName === "signInUser" && publicCode === "INVALID_PASSWORD"){
    return {
      success: false as const,
      code: "INVALID_CREDENTIALS" as const,
      message: getAuthErrorMessage("INVALID_CREDENTIALS"),
    };
  }

  const result = getPublicError(publicCode);
  const message = publicCode === "INTERNAL_ERROR" ? result.message : getAuthErrorMessage(authCode, result.message);

  return {...result, message};
};