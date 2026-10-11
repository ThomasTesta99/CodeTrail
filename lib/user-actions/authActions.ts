"use server";

import { headers } from "next/headers";
import { auth } from "../auth";
import {CreateUserInfo,SignInUserInfo} from "@/types/types";
import {getPublicError,handleActionError} from "../utils/actionError";
import { canChangePasswordInternal } from "./canChangePassword";
import { getUserSession } from "./authHelpers";
import { changeEmailSchema, changeNameSchema } from "../validations/settings";
import { isSocialProviderId } from "../socialProviders";
import { changePasswordSchema, setPasswordSchema } from "../validations/password";
import { APIError } from "better-auth/api";


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

export const getUserAccounts = async () => {
  try {
    const session = await getUserSession();
    if(!session?.user){
      return getPublicError("UNAUTHORIZED");
    }

    const accounts = await auth.api.listUserAccounts({headers: await headers()});

    return {
      success: true as const,
      accounts: accounts.map(account => ({
        id: account.id,
        providerId: account.providerId,
      }))
    }
  } catch (error) {
    return handleActionError(error, "getUserAccounts");
  }
}

export const connectSocialAccount = async ({provider}: {provider: unknown}) => {
  try {
    const session = await getUserSession();
    if(!session?.user){
      return getPublicError("UNAUTHORIZED");
    }

    if(!isSocialProviderId(provider)){
      return getPublicError("VALIDATION_ERROR");
    }

    const result = await auth.api.linkSocialAccount({
      body: {
        provider,
        callbackURL: "/settings",
        errorCallbackURL: "/auth/link-error",
      },
      headers: await headers(),
    });

    if(!result.url){
      return getPublicError("INTERNAL_ERROR");
    }

    return {
      success: true as const,
      message: "Account authorization initiated successfully.",
      url: result.url,
    };
  } catch(error) {
    return handleActionError(error, "connectSocialAccount");
  }
};

export const unlinkSocialAccount = async ({provider}: {provider: unknown}) => {
  try {
    const session = await getUserSession();
    if(!session?.user){
      return getPublicError("UNAUTHORIZED");
    }

    if(!isSocialProviderId(provider)){
      return getPublicError("VALIDATION_ERROR");
    }

    const requestHeaders = await headers();
    const accounts = await auth.api.listUserAccounts({headers: requestHeaders});
    const linkedAccount = accounts.find(account => account.providerId === provider);

    if(!linkedAccount){
      return getPublicError("NOT_FOUND");
    }

    if(accounts.length <= 1){
      return getPublicError("LAST_SIGN_IN_METHOD");
    }

    const result = await auth.api.unlinkAccount({
      body: {
        accountId: linkedAccount.id,
      },
      headers: requestHeaders,
    });

    if(!result.status){
      return getPublicError("INTERNAL_ERROR");
    }

    return {
      success: true as const,
      message: "Sign-in method unlinked successfully.",
    };
  } catch(error) {
    return handleActionError(error, "unlinkSocialAccount");
  }
};

export const setUserPassword = async ({newPassword, confirmPassword}: {newPassword: string, confirmPassword: string}) => {
  try {
    const session = await getUserSession();
    if(!session?.user){
      return getPublicError("UNAUTHORIZED");
    }

    if(!session.user.emailVerified){
      return {
        success: false as const,
        code: "EMAIL_NOT_VERIFIED" as const,
        message: "Verify your email before setting a password.",
      };
    }

    const sessionCreatedAt = new Date(session.session.createdAt).getTime();
    if(!Number.isFinite(sessionCreatedAt) || Date.now() - sessionCreatedAt > 5 * 60 * 1000){
      return {
        success: false as const,
        code: "REAUTH_REQUIRED" as const,
        message: "For security, please sign out and sign back in before setting a password.",
      };
    }

    const parsed = setPasswordSchema.safeParse({newPassword, confirmPassword});
    if(!parsed.success){
      return {
        success: false as const,
        code: "VALIDATION_ERROR" as const,
        message: parsed.error.issues[0]?.message ?? "Invalid password.",
      };
    }

    const accounts = await auth.api.listUserAccounts({headers: await headers()});
    if(accounts.some(account => account.providerId === "credential")){
      return {
        success: false as const,
        code: "PASSWORD_ALREADY_SET" as const,
        message: "A password is already configured for this account.",
      };
    }

    await auth.api.setPassword({
      body: {newPassword: parsed.data.newPassword},
      headers: await headers(),
    });

    return {
      success: true as const,
      message: "Password set successfully. You can now sign in using your email and password.",
    };
  } catch(error) {
    return handleActionError(error, "setUserPassword");
  }
};

export const changeUserPassword = async ({currentPassword, newPassword, confirmPassword}: {
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
}) => {
  try {
    const session = await getUserSession();
    if(!session?.user){
      return getPublicError("UNAUTHORIZED");
    }

    const parsed = changePasswordSchema.safeParse({currentPassword, newPassword, confirmPassword});
    if(!parsed.success){
      return {
        success: false as const,
        code: "VALIDATION_ERROR" as const,
        message: parsed.error.issues[0]?.message ?? "Invalid password.",
      };
    }

    await auth.api.changePassword({
      body: {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
        revokeOtherSessions: true,
      },
      headers: await headers(),
    });

    return {
      success: true as const,
      message: "Password changed successfully.",
    };
  } catch(error) {
    if(error instanceof APIError && error.body?.code === "INVALID_PASSWORD"){
      return {
        success: false as const,
        code: "INVALID_PASSWORD" as const,
        message: "Your current password is incorrect.",
      };
    }

    return handleActionError(error, "changeUserPassword");
  }
};

export const signOutOtherSessions = async () => {
  try {
    const session = await getUserSession();
    if(!session?.user){
      return getPublicError("UNAUTHORIZED");
    }

    const result = await auth.api.revokeOtherSessions({
      headers: await headers(),
    });

    if(!result.status){
      return getPublicError("INTERNAL_ERROR");
    }

    return {
      success: true as const,
      message: "Signed out of all other sessions successfully.",
    };
  } catch(error) {
    return handleActionError(error, "signOutOtherSessions");
  }
};