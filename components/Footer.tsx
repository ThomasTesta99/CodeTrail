"use client";

import { UserProps } from "@/types/types";
import Image from "next/image";
import Link from "next/link";
import { useLogout } from "@/app/hooks/useLogout";
import UserAvatar from "./UserAvatar";

const Footer = ({ user }: UserProps) => {

  const {
    signOut, 
    isLoggingOut, 
  } = useLogout();

  return (
    <footer className="footer mt-auto">
      <Link
        href="/profile"
        aria-label="View your profile"
        title="View your profile"
        className="flex min-w-0 items-center gap-2 max-xl:justify-center"
      >
        <UserAvatar
          image={user?.image}
          name={user?.name}
          size={40}
          className="footer-name bg-gray-600"
          fallbackClassName="text-xl font-bold text-white"
        />

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