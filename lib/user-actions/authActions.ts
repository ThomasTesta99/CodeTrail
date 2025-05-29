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
        const result = await authClient.signUp.email({
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

// findUserByEmail: async (email : string) => {
//             try {
//                 return await db.select().from(user).where(eq(user.email, email)).then(users => users[0]);
//             } catch (error) {
//                 console.log(error)
//             }
//         },
//         verifyPassword: async (inputPassword: string, user : User) => {
//             try {
//                 return await bcrypt.compare(inputPassword, user.password!);
//             } catch (error) {
//                 console.log(error);
//             }
//         },
//         createUser: async ({email, password, name} : CreateUserInfo) => {
//             try {
//                 const hashedPassword = await bcrypt.hash(password, 10);
//                 const newUser : User = {
//                     email, 
//                     password: hashedPassword, 
//                     name, 
//                     createdAt: new Date(),
//                     updatedAt: new Date(),
//                 };
    
//                 await db.insert(user).values(newUser);
//             } catch (error) {
//                 console.log(error);
//             }