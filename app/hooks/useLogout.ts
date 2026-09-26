import { logoutUser } from "@/lib/user-actions/authActions";
import { useRouter } from "next/navigation"
import { useState } from "react";
import toast from "react-hot-toast";

export const useLogout = (
    onSuccess?: () => void, 
) => {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const signOut = async () => {
        if(isLoggingOut) return;

        setIsLoggingOut(true);

        try {
            const result = await logoutUser();
            if(!result.success){
                toast.error(result.message || "Unable to sign out. Please try again");
                return;
            }
            onSuccess?.();

            router.push("/sign-in");
            router.refresh();
        } catch (error) {
            console.error("Sign out faild: ", error);
            toast.error("Unable to sign out. Please try again");
        }finally{
            setIsLoggingOut(false);
        }

    }
    return {
        signOut, 
        isLoggingOut, 
    };
}