import { db } from '@/database/drizzle'
import {betterAuth} from 'better-auth'
import {drizzleAdapter} from "better-auth/adapters/drizzle"
import {schema} from "@/database/schema"
import {nextCookies} from 'better-auth/next-js'
import { sendEmail, sendVerifiation } from './email'
import { MIN_PASSWORD_LENGTH } from '@/constants'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { validateAuthRate, validateSensitiveAuthRate } from './arcjet'
import { isAccountDeletionBlocked } from './security/protectedAccount'
import { and, eq } from "drizzle-orm";
import { canChangePasswordInternal } from './user-actions/canChangePassword'



export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema,
    }),
    session: {
        freshAge: 60 * 5, 
    },
    socialProviders:{
        google:{
            prompt: "select_account",
            clientId: process.env.GOOGLE_CLIENT_ID!, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
        github: { 
            clientId: process.env.GITHUB_CLIENT_ID!, 
            clientSecret: process.env.GITHUB_CLIENT_SECRET!, 
        }, 
        },
        emailAndPassword:{
            enabled: true,
            autoSignIn: true,
            minPasswordLength: MIN_PASSWORD_LENGTH, 
            revokeSessionsOnPasswordReset: true, 
            sendResetPassword: async ({user, url}) => {
                 try {
                    if (!(await canChangePasswordInternal(user.email))) return;
                    await sendEmail({to: user.email, resetLink: url});
                } catch {
                    console.error("[password-reset] Reset email delivery failed.");
                }
            },
        },
        emailVerification:{
            autoSignInAfterVerification: true,
            sendVerificationEmail: async ({user, url}) => {
                await sendVerifiation({
                    to: user.email, 
                    subject: "Verify your email",
                    templateParams: {
                        user_name: user.name ?? "there", 
                        action_url: url, 
                        type_header: "Verify your email",
                        type_body: "verfiy your email"
                    }
                })
            }
        },
        account: {
            accountLinking: {
                enabled: true, 
                disableImplicitLinking: true, 
            }
        },
        user: {
            changeEmail: {
                enabled: true, 
                sendChangeEmailConfirmation: async ({user, url}) => {
                    await sendVerifiation({
                        to: user.email, 
                        subject: "Approve Email Change", 
                        templateParams: {
                            user_name: user.name ?? "there", 
                            action_url: url, 
                            type_header: "Change your email",
                            type_body: "change your email",
                        }
                    })
                }
            },
            deleteUser: {
                enabled: true, 
                beforeDelete: async (user) => {
                    if(isAccountDeletionBlocked(user.id)){
                        throw new APIError("FORBIDDEN", {
                            code: "ACCOUNT_DELETION_BLOCKED",
                            message: "Account deletion is disabled for this account.",
                        });
                    }
                }
            }
        },
        hooks: {
            before: createAuthMiddleware(async (ctx) => {
                const isDeletionPath = ctx.path === "/delete-user" || ctx.path === "/delete-user/callback";
                const isSensitiveAuthPath = isDeletionPath || ctx.path === "/change-password" || ctx.path === "/verify-password";

                if(isSensitiveAuthPath){
                    if(!ctx.headers){
                        throw new APIError("UNAUTHORIZED", {
                            code: "UNAUTHORIZED",
                            message: "Authentication is required.",
                        });
                    }

                    const session = await auth.api.getSession({headers: ctx.headers});

                    if(!session?.user){
                        throw new APIError("UNAUTHORIZED", {
                            code: "UNAUTHORIZED",
                            message: "Authentication is required.",
                        });
                    }

                    const rateLimit = await validateSensitiveAuthRate(session.user.id);

                    if(rateLimit.status === "denied"){
                        throw new APIError("TOO_MANY_REQUESTS", {
                            code: "RATE_LIMITED",
                            message: "Too many attempts. Please try again later.",
                        });
                    }

                    if(rateLimit.status === "unavailable"){
                        throw new APIError("SERVICE_UNAVAILABLE", {
                            code: "RATE_LIMIT_UNAVAILABLE",
                            message: "Authentication is temporarily unavailable. Please try again later.",
                        });
                    }

                    if(isDeletionPath){
                        const credentialAccounts = await db.select({id: schema.account.id})
                            .from(schema.account)
                            .where(and(eq(schema.account.userId, session.user.id), eq(schema.account.providerId, "credential")))
                            .limit(1);

                        const hasPassword = credentialAccounts.length > 0;

                        if(hasPassword && (ctx.path !== "/delete-user" || typeof ctx.body?.password !== "string" || ctx.body.password.length === 0)){
                            throw new APIError("BAD_REQUEST", {
                                code: "PASSWORD_REQUIRED",
                                message: "Enter your current password to delete your account.",
                            });
                        }
                    }
                }

                const protectedAuthPaths = {
                    "/sign-in/email": "sign-in",
                    "/sign-up/email": "sign-up",
                    "/request-password-reset": "password-reset",
                    "/send-verification-email": "verify-email",
                    "/change-email": "change-email",
                } as const;
    
                const action = 
                    protectedAuthPaths[
                        ctx.path as keyof typeof protectedAuthPaths
                    ];
                
                if(!action) return;
    
                const email = ctx.path === "/change-email"
                    ? typeof ctx.body?.newEmail === "string" ? ctx.body.newEmail : null
                    : typeof ctx.body?.email === "string" ? ctx.body.email : null;
    
                if(!email?.trim()) return;
    
                const rateLimit = await validateAuthRate(email, action);
    
                if (rateLimit.status === "denied") {
                    throw new APIError("TOO_MANY_REQUESTS", {
                        message: "Too many attempts. Please try again later.",
                        code: "RATE_LIMITED",
                    });
                }

                if (rateLimit.status === "unavailable") {
                    throw new APIError("SERVICE_UNAVAILABLE", {
                        message:
                        "Authentication is temporarily unavailable. Please try again later.",
                        code: "SERVICE_UNAVAILABLE",
                    });
                }
            }),
        },
        plugins: [nextCookies()],
        baseURL: process.env.NEXT_PUBLIC_BASE_URL!,
        
    })