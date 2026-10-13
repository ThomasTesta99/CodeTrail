import { ActionErrorCode } from "@/types/types";

export const AUTH_ERROR_CODES: Record<string, ActionErrorCode> = {
  INVALID_EMAIL_OR_PASSWORD: "INVALID_PASSWORD",
  INVALID_CREDENTIALS: "INVALID_PASSWORD",
  INVALID_PASSWORD: "INVALID_PASSWORD",
  EMAIL_NOT_VERIFIED: "VALIDATION_ERROR",
  USER_ALREADY_EXISTS: "VALIDATION_ERROR",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "VALIDATION_ERROR",
  PASSWORD_TOO_SHORT: "VALIDATION_ERROR",
  PASSWORD_TOO_LONG: "VALIDATION_ERROR",
  TOO_MANY_REQUESTS: "RATE_LIMITED",
  RATE_LIMITED: "RATE_LIMITED",
  RATE_LIMIT_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  SESSION_NOT_FRESH: "REAUTH_REQUIRED",
  SESSION_EXPIRED: "REAUTH_REQUIRED",
  FAILED_TO_UNLINK_LAST_ACCOUNT: "LAST_SIGN_IN_METHOD",
  ACCOUNT_DELETION_BLOCKED: "ACCOUNT_DELETION_BLOCKED"
};

export const getAuthErrorMessage = (
  code?: string | null,
  fallback = "Authentication failed. Please try again."
): string => {
  switch (code) {
    case "INVALID_EMAIL_OR_PASSWORD":
    case "INVALID_CREDENTIALS":
      return "Invalid email or password.";

    case "INVALID_PASSWORD":
      return "Your current password is incorrect.";

    case "EMAIL_NOT_VERIFIED":
      return "Please verify your email before signing in.";

    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "An account with this email already exists.";

    case "PASSWORD_TOO_SHORT":
      return "Your password does not meet the minimum length requirement.";

    case "PASSWORD_TOO_LONG":
      return "Your password exceeds the maximum length requirement.";

    case "TOO_MANY_REQUESTS":
    case "RATE_LIMITED":
      return "Too many attempts. Please try again later.";

    case "RATE_LIMIT_UNAVAILABLE":
    case "SERVICE_UNAVAILABLE":
      return "Authentication is temporarily unavailable. Please try again later.";

    case "SESSION_NOT_FRESH":
    case "SESSION_EXPIRED":
      return "For security, please sign out and sign back in before trying again.";

    case "FAILED_TO_UNLINK_LAST_ACCOUNT":
      return "Connect another sign-in method before unlinking this one.";

    case "ACCOUNT_DELETION_BLOCKED":
      return "Account deletion is disabled for this account.";

    case "INVALID_TOKEN":
    case "TOKEN_EXPIRED":
      return "Your password reset link is invalid or expired.";

    default:
      return fallback;
  }
};