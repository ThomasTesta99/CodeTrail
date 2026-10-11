
"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { signOutOtherSessions } from "@/lib/user-actions/authActions";

const SignOutOtherSessions = () => {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if(isSigningOut) return;

    const confirmed = window.confirm("Sign out of CodeTrail on all other devices and browsers? You will remain signed in here.");
    if(!confirmed) return;

    setIsSigningOut(true);

    try {
      const result = await signOutOtherSessions();

      if(!result.success){
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
    } catch(error) {
      console.error("Failed to sign out other sessions:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <button type="button" onClick={handleSignOut} disabled={isSigningOut} className="settings-button disabled:cursor-not-allowed disabled:opacity-50">
      {isSigningOut ? "Signing out..." : "Sign out other sessions"}
    </button>
  );
};

export default SignOutOtherSessions;
