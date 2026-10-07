"use server";

import { headers } from "next/headers";
import { auth } from "../auth";
import {
  CreateUserInfo,
  SignInUserInfo,
} from "@/types/types";
import {
  getPublicError,
  handleActionError,
} from "../utils/actionError";
import { canChangePasswordInternal } from "./canChangePassword";
import { getUserSession } from "./authHelpers";
import { changeEmailSchema, changeNameSchema } from "../validations/settings";


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
    const result = await auth.api.signOut({
      headers: await headers(),
    });

    if (!result.success) {
      console.error(
        "[logoutUser] Sign-out did not succeed."
      );

      return getPublicError("INTERNAL_ERROR");
    }

    return {
      success: true as const,
      message: "Signed out successfully.",
    };
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

    const newUser = await auth.api.signUpEmail({
      body: {
        name,
        email: normalizedEmail,
        password,
      },
      headers: await headers(),
    });

    return {
      success: true as const,
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

    const signedInUser = await auth.api.signInEmail({
      body: {
        email: normalizedEmail,
        password,
      },
      headers: await headers(),
    });

    return {
      success: true as const,
      message: "User successfully logged in.",
      user: signedInUser,
    };
  } catch (error) {
    if (isInvalidCredentialsError(error)) {
      return {
        success: false as const,
        code: "INVALID_CREDENTIALS" as const,
        message: "Invalid email or password.",
      };
    }

    return handleActionError(error, "signInUser");
  }
};

export const sendResetPasswordEmail = async ({
  email,
}: {
  email: string;
}) => {
  try {
    const normalizedEmail = email.trim().toLowerCase();

    const publicMessage =
      "If an eligible account exists for this email, a reset link has been sent.";

    const eligible = await canChangePasswordInternal(
      normalizedEmail
    );

    if (!eligible) {
      return {
        success: true as const,
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
      success: true as const,
      message: publicMessage,
    };
  } catch (error) {
    return handleActionError(
      error,
      "sendResetPasswordEmail"
    );
  }
};

export const sendVerificationEmail = async () => {
  try {
    const session = await getUserSession();

    if (!session?.user) {
      return getPublicError("UNAUTHORIZED");
    }

    if (session.user.emailVerified) {
      return {
        success: false as const,
        code: "ALREADY_VERIFIED" as const,
        message: "Email is already verified.",
      };
    }

    const normalizedEmail = session.user.email.trim().toLowerCase();

    const result = await auth.api.sendVerificationEmail({
      body: {
        email: normalizedEmail,
        callbackURL: "/email-verified",
      },
      headers: await headers(),
    });

    if (!result.status) {
      console.error("[sendVerificationEmail] Verification email was not sent.");
      return getPublicError("INTERNAL_ERROR");
    }

    return {
      success: true as const,
      message: "Verification email sent.",
    };
  } catch (error) {
    return handleActionError(error, "sendVerificationEmail");
  }
};

export const updateUserName = async ({name} : {name: string}) => {
  try {
    const session = await getUserSession();
    if(!session?.user){
      return getPublicError("UNAUTHORIZED");
    }

    const parsed = changeNameSchema.safeParse({name});
    if(!parsed.success){
      return {
        success: false as const,
        code: "VALIDATION_ERROR" as const, 
        message: parsed.error.issues[0]?.message ?? "Invalid name."
      }
    }

    const newName = parsed.data.name;

    if(newName === session.user.name){
      return {
        success: true, 
        message: "Your name is already up to date.", 
      }
    }

    await auth.api.updateUser({
      body: {
        name: newName, 
      },
      headers: await headers(),
    })

    return {
      success: true as const, 
      message: "Name updated successfully."
    }
  } catch (error) {
    return handleActionError(error, "updateUserName");
  }
}

export const changeUserEmail = async ({email}: {email: string}) => {
  try {
    const session = await getUserSession();
    if(!session?.user){
      return getPublicError("UNAUTHORIZED");
    }
    if (!session.user.emailVerified) {
      return {
        success: false as const,
        code: "EMAIL_NOT_VERIFIED" as const,
        message: "Verify your current email before changing it.",
      };
    }

    const parsed = changeEmailSchema.safeParse({ email });
    if (!parsed.success) {
      return {
        success: false as const,
        code: "VALIDATION_ERROR" as const,
        message: parsed.error.issues[0]?.message || "Invalid email address.",
      };
    }

    const normalizedEmail = parsed.data.email.toLowerCase();
    if (normalizedEmail === session.user.email.toLowerCase()) {
      return {
        success: false as const,
        code: "SAME_EMAIL" as const,
        message: "Enter a different email address.",
      };
    }

    await auth.api.changeEmail({
      body:{
        newEmail: normalizedEmail,
        callbackURL: "/email-change-approved", 
      },
      headers: await headers(), 
    })

    return {
      success: true as const, 
      message: `A request for an email change has been sent to your current email`
    }
  } catch (error) {
    return handleActionError(error, "changeUserEmail");
  }
}