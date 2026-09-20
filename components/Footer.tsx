"use client";

import { logoutUser } from "@/lib/user-actions/authActions";
import { UserProps } from "@/types/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

const Footer = ({ user }: UserProps) => {
  const router = useRouter();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const signOut = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      const result = await logoutUser();

      if (!result.success) {
        toast.error(
          result.message ||
            "Unable to sign out. Please try again."
        );
        return;
      }

      router.push("/sign-in");
      router.refresh();
    } catch (error) {
      console.error("[Footer] Sign-out failed:", error);

      toast.error(
        "Unable to sign out. Please try again."
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <footer className="footer mt-auto">
      <Link
        href="/profile"
        aria-label="View your profile"
        title="View your profile"
        className="flex min-w-0 items-center gap-2 max-xl:justify-center"
      >
        <div
          className={`footer-name ${
            user?.image
              ? "bg-transparent"
              : "bg-gray-600"
          }`}
        >
          {user?.image ? (
            <Image
              src={user.image}
              alt="User profile"
              width={40}
              height={40}
              className="size-10 rounded-full object-cover"
            />
          ) : (
            <p className="text-xl font-bold text-white">
              {user?.name?.[0] ?? "U"}
            </p>
          )}
        </div>

        <div className="footer-email">
          <h1 className="text-sm truncate font-semibold text-white">
            {user?.name ?? ""}
          </h1>

          <p className="text-sm truncate font-normal text-gray-300">
            {user?.email ?? ""}
          </p>
        </div>
      </Link>

      <button
        type="button"
        onClick={signOut}
        disabled={isLoggingOut}
        className="footer-image disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={
          isLoggingOut ? "Signing out" : "Log out"
        }
        title={
          isLoggingOut ? "Signing out" : "Log out"
        }
      >
        <Image
          src="/assets/icons/logout.svg"
          fill
          alt=""
          className="brightness-0 invert"
        />
      </button>
    </footer>
  );
};

export default Footer;