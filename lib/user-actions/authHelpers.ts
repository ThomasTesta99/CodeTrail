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

    if (!rateCheck.valid) {
      return {
        valid: false,
        message: getPublicError("RATE_LIMITED").message,
      };
    }

    return rateCheck;
  } catch (error) {
    const publicError = handleActionError(
      error,
      "checkRate"
    );

    return {
      valid: false,
      code: publicError.code,
      message: publicError.message,
    };
  }
};