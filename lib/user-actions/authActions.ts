'use server'
import { headers } from "next/headers";
import { auth } from "../auth";
import { authClient } from "../auth-client";
import { db } from "@/database/drizzle";
import { account, user } from "@/database/schema";
import { eq } from "drizzle-orm";


export const logoutUser = async () => {
    try {
        await authClient.signOut();
        auth.api.signOut({headers: await headers()});
    } catch (error) {
        console.log(error);
    }
}

export const signUpUser = async({name, email, password}: CreateUserInfo) => {
    try {
        const result =  await authClient.signUp.email({
            email, 
            name, 
            password
        })
        
        return result;
    } catch (error) {
        console.log(error);
    }
}

export const signInUser = async({email, password}: SignInUserInfo) => {
    try {
        const result = await auth.api.signInEmail({
            body: {
                email: email, 
                password: password,
            }
        })
        console.log("User result: ", result);
        return result;
    } catch (error) {
        console.log(error);
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