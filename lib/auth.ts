import { db } from '@/database/drizzle'
import {betterAuth} from 'better-auth'
import {drizzleAdapter} from "better-auth/adapters/drizzle"
import {schema} from "@/database/schema"
import {nextCookies} from 'better-auth/next-js'
import { sendEmail, sendVerifiation } from './email'
import { MIN_PASSWORD_LENGTH } from '@/constants'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { validateAuthRate } from './arcjet'
import { isAccountDeletionBlocked } from './security/protectedAccount'




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
                await sendEmail({
                    to: user.email, 
                    resetLink: url
                })
            },
        },
        emailVerification:{
            autoSignInAfterVerification: true,
            sendVerificationEmail: async ({user, url}) => {
                await sendVerifiation({
                    to: user.email, 
                    subject: "Verify your email",
                    templateParams: {
                        user_name: user.name ?? "their", 
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
                            user_name: user.name ?? "their", 
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