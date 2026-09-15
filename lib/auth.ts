import { db } from '@/database/drizzle'
import {betterAuth} from 'better-auth'
import {drizzleAdapter} from "better-auth/adapters/drizzle"
import {schema} from "@/database/schema"
import {nextCookies} from 'better-auth/next-js'
import { sendEmail, sendVerifiation } from './email'




export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema,
    }),
    socialProviders:{
        google:{
            prompt: "select_account",
            clientId: process.env.GOOGLE_CLIENT_ID!, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
        // github: { 
        //     clientId: process.env.GITHUB_CLIENT_ID!, 
        //     clientSecret: process.env.GITHUB_CLIENT_SECRET!, 
        // }, 
    },
    emailAndPassword:{
        enabled: true,
        autoSignIn: true, 
        sendResetPassword: async ({user, url}) => {
            await sendEmail({
                to: user.email, 
                resetLink: url
            })
        },
    },
    emailVerification:{
        sendVerificationEmail: async ({user, url}) => {
            await sendVerifiation({
                to: user.email, 
                subject: "Verify your email",
                templateParams: {
                    user_name: user.name ?? "there", 
                    action_url: url, 
                    type: "Verify your email",
                }
            })
        }
    },
    plugins: [nextCookies()],
    baseURL: process.env.NEXT_PUBLIC_BASE_URL!,

})