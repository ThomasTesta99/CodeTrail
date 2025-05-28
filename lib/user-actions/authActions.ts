import { authClient } from "../auth-client";
export const logoutUser = async () => {
    try {
        await authClient.signOut();
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