"use client";

import { unlinkSocialAccount } from "@/lib/user-actions/authActions";
import { SocialProviderId } from "@/lib/socialProviders";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

const UnlinkSocialButton = ({provider, providerName, disabled}: {
  provider: SocialProviderId;
  providerName: string;
  disabled: boolean;
}) => {
  const router = useRouter();
  const [isUnlinking, setIsUnlinking] = useState(false);

  const handleUnlink = async () => {
    if(disabled || isUnlinking) return;

    if(!window.confirm(`Are you sure you want to unlink ${providerName}? You will no longer be able to sign in using this method.`)) return;

    setIsUnlinking(true);

    try {
      const result = await unlinkSocialAccount({provider});

      if(!result.success){
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    } catch(error) {
      console.error("[UnlinkSocialButton]", error);
      toast.error("Unable to unlink account. Please try again.");
    } finally {
      setIsUnlinking(false);
    }
  };

  return (
    <button type="button" onClick={handleUnlink} disabled={disabled || isUnlinking} className="settings-connected-method-action">
      {isUnlinking ? "Unlinking..." : "Unlink"}
    </button>
  );
};

export default UnlinkSocialButton;