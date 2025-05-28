import { authClient } from "../auth-client";

export const logoutUser = async () => {
    try {
        await authClient.signOut();
    } catch (error) {
        console.log(error);
    }
}