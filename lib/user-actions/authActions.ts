'use server'
import { headers } from "next/headers";
import { auth } from "../auth";
import { authClient } from "../auth-client";

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
        
        console.log(result)
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
