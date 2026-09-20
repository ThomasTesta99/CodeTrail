"use server";

import { headers } from "next/headers";
import { auth } from "../auth";
import { db } from "@/database/drizzle";
import { user } from "@/database/schema";
import { eq } from "drizzle-orm";
import {
  validateAuthRate,
  validateWithArcjet,
} from "../arcjet";
import {
  Action,
  CreateUserInfo,
  SignInUserInfo,
} from "@/types/types";
import {
  getPublicError,
  handleActionError,
} from "../utils/actionError";
import { canChangePasswordInternal } from "./canChangePassword";


const isInvalidCredentialsError = (
  error: unknown
): boolean => {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  if (!("code" in error)) {
    return false;
  }

  const code = error.code;

  return (
    code === "INVALID_EMAIL_OR_PASSWORD" ||
    code === "INVALID_PASSWORD" ||
    code === "INVALID_CREDENTIALS"
  );
};

export const logoutUser = async () => {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
  } catch (error) {
    return handleActionError(error, "logoutUser");
  }
};

export const signUpUser = async ({
  name,
  email,
  password,
}: CreateUserInfo) => {
  try {
    const normalizedEmail = email.trim().toLowerCase();

    const rateLimit = await validateAuthRate(
      normalizedEmail,
      "sign-up"
    );

    if (!rateLimit.valid) {
      return getPublicError("RATE_LIMITED");
    }

    const newUser = await auth.api.signUpEmail({
      body: {
        name,
        email: normalizedEmail,
        password,
      },
      headers: await headers(),
    });

    return {
      success: true,
      message: "Signed up successfully.",
      newUser,
    };
  } catch (error) {
    return handleActionError(error, "signUpUser");
  }
};


export const signInUser = async ({
  email,
  password,
}: SignInUserInfo) => {
  try {
    const normalizedEmail = email.trim().toLowerCase();

    const rateLimit = await validateAuthRate(
      normalizedEmail,
      "sign-in"
    );

    if (!rateLimit.valid) {
      return getPublicError("RATE_LIMITED");
    }

    const signedInUser = await auth.api.signInEmail({
      body: {
        email: normalizedEmail,
        password,
      },
      headers: await headers(),
    });

    return {
      success: true,
      message: "User successfully logged in.",
      user: signedInUser,
    };
  } catch (error) {
    if (isInvalidCredentialsError(error)) {
      return {
        success: false,
        code: "INVALID_CREDENTIALS" as const,
        message: "Invalid email or password.",
      };
    }

    return handleActionError(error, "signInUser");
  }
};


export const getUserSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
};

export const getUserByEmail = async ({
  email,
}: {
  email: string;
}) => {
  try {
    const session = await getUserSession();
    if(!session?.user){
        return getPublicError("UNAUTHORIZED");
    }

    const normalizedEmail = email.trim().toLowerCase();

    if(session.user.email.trim().toLowerCase() !== normalizedEmail){
        return getPublicError("NOT_FOUND");
    }

    const [foundUser] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        emailVerified: user.emailVerified,
      })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!foundUser) {
      return getPublicError("NOT_FOUND");
    }

    return {
      success: true,
      user: foundUser,
    };
  } catch (error) {
    return handleActionError(error, "getUserByEmail");
  }
};

export const validUser = async (
  userId: string
) => {
  try {
    const session = await getUserSession();

    if (!session?.user) {
      return {
        valid: false,
        code: "UNAUTHORIZED" as const,
        message: "Unauthorized",
      };
    }

    if (session.user.id !== userId) {
      return {
        valid: false,
        code: "UNAUTHORIZED" as const,
        message: "Unauthorized",
      };
    }

    return {
      valid: true,
      message: "Authorized",
    };
  } catch (error) {
    const publicError = handleActionError(
      error,
      "validUser"
    );

    return {
      valid: false,
      code: publicError.code,
      message: publicError.message,
    };
  }
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


export const sendResetPasswordEmail = async ({
  email,
}: {
  email: string;
}) => {
  try {
    const normalizedEmail = email.trim().toLowerCase();

    const rateLimit = await checkRate(
      normalizedEmail,
      "password-reset"
    );

    if (!rateLimit.valid) {
      if ("code" in rateLimit) {
        return getPublicError("INTERNAL_ERROR");
      }

      return getPublicError("RATE_LIMITED");
    }

    const publicMessage =
      "If an eligible account exists for this email, a reset link has been sent.";

    const eligible = await canChangePasswordInternal(
      normalizedEmail
    );

    if (!eligible) {
      return {
        success: true,
        message: publicMessage,
      };
    }

    const redirectTo =
      `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`;

    await auth.api.requestPasswordReset({
      body: {
        email: normalizedEmail,
        redirectTo,
      },
    });

    return {
      success: true,
      message: publicMessage,
    };
  } catch (error) {
    return handleActionError(
      error,
      "sendResetPasswordEmail"
    );
  }
};

export const sendVerificationEmail = async ({
  url,
}: {
  url: string;
}) => {
  try {
    const session = await getUserSession();

    if (!session?.user) {
      return getPublicError("UNAUTHORIZED");
    }

    if (session.user.emailVerified) {
      return {
        success: false,
        code: "ALREADY_VERIFIED" as const,
        message: "Email is already verified.",
      };
    }

    const normalizedEmail =
      session.user.email.trim().toLowerCase();

    const rateLimit = await checkRate(
      normalizedEmail,
      "verify-email"
    );

    if (!rateLimit.valid) {
      if ("code" in rateLimit) {
        return getPublicError("INTERNAL_ERROR");
      }

      return getPublicError("RATE_LIMITED");
    }

    const result =
      await auth.api.sendVerificationEmail({
        body: {
          email: normalizedEmail,
          callbackURL: url,
        },
        headers: await headers(),
      });

    if (!result.status) {
      console.error(
        "[sendVerificationEmail] Verification email was not sent."
      );

      return getPublicError("INTERNAL_ERROR");
    }

    return {
      success: true,
      message: "Verification email sent",
    };
  } catch (error) {
    return handleActionError(
      error,
      "sendVerificationEmail"
    );
  }
};