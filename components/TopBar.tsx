"use client";

import { sidebarLinks } from "@/constants";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils/utils";
import React, { useState } from "react";
import { logoutUser } from "@/lib/user-actions/authActions";
import { UserProps } from "@/types/types";
import { toast } from "react-hot-toast";

const Topbar = ({ user }: UserProps) => {
  const pathName = usePathname();
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

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

      setIsMenuOpen(false);

      router.push("/sign-in");
      router.refresh();
    } catch (error) {
      console.error("[Topbar] Sign-out failed:", error);

      toast.error(
        "Unable to sign out. Please try again."
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="md:hidden w-full bg-[#1E1E2F] text-white">
      <div className="p-4 flex justify-between items-center">
        <Link href="/">
          <h1 className="text-lg font-bold">
            &lt;CodeTrail /&gt;
          </h1>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMenu}
            aria-label={
              isMenuOpen ? "Close menu" : "Open menu"
            }
            aria-expanded={isMenuOpen}
            className="focus:outline-none cursor-pointer brightness-0 invert"
          >
            <Image
              src={
                isMenuOpen
                  ? "/assets/icons/close.svg"
                  : "/assets/icons/menu.svg"
              }
              alt=""
              width={24}
              height={24}
            />
          </button>

          <Link
            href="/profile"
            aria-label="View your profile"
            title="View your profile"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-500"
          >
            {user?.image ? (
              <Image
                src={user.image}
                alt="User profile"
                width={32}
                height={32}
                className="size-8 rounded-full object-cover"
              />
            ) : (
              <span className="text-sm font-semibold text-white">
                {user?.name?.[0] ?? "U"}
              </span>
            )}
          </Link>
        </div>
      </div>

      {isMenuOpen && (
        <div className="px-4 pb-4">
          <nav className="flex flex-col gap-2 mt-2">
            {sidebarLinks.map((item) => {
              const isActive =
                pathName === item.route ||
                pathName.startsWith(
                  `${item.route}/`
                );

              return (
                <Link
                  href={item.route}
                  key={item.label}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition",
                    isActive
                      ? "bg-white text-black"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-400">
              © CodeTrail
            </span>

            <button
              type="button"
              onClick={signOut}
              disabled={isLoggingOut}
              className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={
                isLoggingOut
                  ? "Signing out"
                  : "Log out"
              }
              title={
                isLoggingOut
                  ? "Signing out"
                  : "Log out"
              }
            >
              <Image
                src="/assets/icons/logout.svg"
                alt=""
                width={24}
                height={24}
                className="brightness-0 invert"
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Topbar;