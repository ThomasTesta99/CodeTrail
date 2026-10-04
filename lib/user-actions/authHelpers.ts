import "server-only";

import { headers } from "next/headers";
import { auth } from "../auth";
import { validateWithArcjet } from "../arcjet";
import { Action } from "@/types/types";
import {
  getPublicError,
  handleActionError,
} from "../utils/actionError";

export const getUserSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
};

export const checkRate = async (
  fingerprint: string,
  scope: Action
) => {
  try {
    const rateCheck = await validateWithArcjet(
      fingerprint,
      scope
    );

    if (rateCheck.status === "denied") {
      return {
        valid: false as const,
        code: "RATE_LIMITED" as const,
        message: getPublicError("RATE_LIMITED").message,
      };
    }

    if (rateCheck.status === "unavailable") {
      return {
        valid: false as const,
        code: "SERVICE_UNAVAILABLE" as const,
        message: getPublicError("SERVICE_UNAVAILABLE").message,
      };
    }

    return rateCheck;
  } catch (error) {
    handleActionError(error, "checkRate");

    return {
      valid: false as const,
      code: "SERVICE_UNAVAILABLE" as const,
      message: getPublicError("SERVICE_UNAVAILABLE").message,
    };
  }
};