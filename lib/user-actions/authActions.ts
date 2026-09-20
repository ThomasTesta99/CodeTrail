'use server'
import { headers } from "next/headers";
import { auth } from "../auth";
import { db } from "@/database/drizzle";
import { account, user } from "@/database/schema";
import { eq } from "drizzle-orm";
import { validateAuthRate, validateWithArcjet } from "../arcjet";
import { Action, CreateUserInfo, SignInUserInfo} from "@/types/types";


export const logoutUser = async () => {
    auth.api.signOut({headers: await headers()});
}

export const signUpUser = async({name, email, password}: CreateUserInfo) => {
    try {
        const normalizedEmail = email.trim().toLowerCase();
        const rateLimit = await validateAuthRate(
            normalizedEmail, 
            "sign-up",
        );

        if(!rateLimit.valid){
            return {
                success: false, 
                message: rateLimit.message, 
            }
        }

        const newUser = await auth.api.signUpEmail({
            body: {
                name, 
                email, 
                password,
            },
            headers: await headers(),
        })

        return {
            success: true, 
            message: "Signed Up sucessfully. ", 
            newUser,
        }
    } catch (error) {
        return {
            success: false,
            message: "There was an error signing up: " + error as string,
        }
    }
}

export const signInUser = async({email, password}: SignInUserInfo) => {
    try {
        const normalizedEmail = email.trim().toLowerCase();
        const rateLimit = await validateAuthRate(
            normalizedEmail, 
            "sign-in",
        );
    

        if(!rateLimit.valid){
            console.log("Rate limit exceeded");
            return {
                success: false, 
                message: rateLimit.message, 
            }
        }

        const user = await auth.api.signInEmail({
            body: {
                email, 
                password
            },
            headers: await headers(),
        })

        return {
            success: true, 
            message: "User successfuly logged in.",
            user,
        }
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: "Invalid email or password",
        }
    }
}

export const getUserSession = async () => {
    const session = await auth.api.getSession({headers: await headers()});
    return session;
}

export const getUserByEmail = async ({email}: {email: string}) => {
    try {
        const result = await db.select().from(user).where(eq(user.email, email));

        const foundUser = result[0]; 

        if (!foundUser) {
            return { success: false, message: 'User not found' };
        }

        return {
            success: true,
            user: foundUser,
        };
    } catch (error) {
        console.error('Error in getUserByEmail:', error);
        return {
        success: false,
        message: 'Server error while fetching user',
        };
    }
};

export const canChangePassword = async (email: string) => {
    try {
        const users = await db.select().from(user).where(eq(user.email, email)).limit(1);

        if(users.length === 0){
            return {
                canChange: false,
                message: 'User not found'
            }
        }

        const foundUser = users[0];

        const accounts = await db.select().from(account).where(eq(account.userId, foundUser.id)).limit(1);

        if(accounts.length > 0){
            const acc = accounts[0];
            const provider = acc.providerId;

            if(provider !== 'credential'){
                return {
                    canChange: false,
                    message: `You signed up with ${provider} and cannot reset your password`,
                }
            }
        }

        return {
            canChange: true,
            message: "Can change password"
        }
    } catch (error) {
        console.log(error);
        return {
            canChange: false,
            message: "An error occured" + error,
        }
    }
}

export const validUser = async (userId: string) => {
    const session = await getUserSession();

    if(!session){
        return {
            valid: false,
            message: 'No valid session.'
        }
    }
    const user = session?.user

    if(!user){
        return {
            valid: false,
            message: "Unautherized"
        }
    }

    if(user.id == userId){
        return {
            valid: true,
            message: "Autherized"
        }
    }else{
        return {
            valid: false,
            message: "Unautherized"
        }
    }
}

export const checkRate = async(fingerprint:string, scope: Action) => {
    const rateCheck = await validateWithArcjet(fingerprint, scope);
    return rateCheck;
}

export const sendResetPasswordEmail = async ({
    email,
}: {
    email: string;
}) => {
    try {
        const rateLimit = await checkRate(
            email,
            'password-reset'
        );

        if (!rateLimit.valid) {
            return {
                success: false,
                message: rateLimit.message,
            };
        }

        const canChangePasswordResult =
            await canChangePassword(email);

        if (!canChangePasswordResult.canChange) {
            return {
                success: true,
                message:
                    "If an eligible account exists for this email, a reset link has been sent.",
            };
        }

        const redirectTo =
            `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`;

        await auth.api.requestPasswordReset({
            body: {
                email,
                redirectTo,
            },
        });

        return {
            success: true,
            message:
                "If an eligible account exists for this email, a reset link has been sent.",
        };

    } catch (error) {
        console.error(
            "Password reset request failed:",
            error
        );

        return {
            success: false,
            message:
                "Unable to process the password reset request.",
        };
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
            return {
                success: false,
                message: "You must be logged in to verify your email.",
            };
        }

        if (session.user.emailVerified) {
            return {
                success: false,
                message: "Email is already verified.",
            };
        }

        const email = session.user.email;

        const rateLimit = await checkRate(
            email,
            "verify-email"
        );

        if (!rateLimit.valid) {
            return {
                success: false,
                message: rateLimit.message,
            };
        }

        const result = await auth.api.sendVerificationEmail({
            body: {
                email,
                callbackURL: url,
            },
            headers: await headers(),
        });

        if (!result.status) {
            return {
                success: false,
                message: "Failure to send verification email",
            };
        }

        return {
            success: true,
            message: "Verification email sent",
        };

    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "There was an error sending the verification email.",
        };
    }
};