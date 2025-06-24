'use client';

import { sidebarLinks } from '@/constants';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import { logoutUser } from '@/lib/user-actions/authActions';
import { UserProps } from '@/types/types';

const Topbar = ({ user }: UserProps) => {
  const pathName = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const signOut = () => {
    logoutUser();
    router.push('/sign-in');
  };

  return (
    <div className="md:hidden w-full bg-[#1E1E2F] text-white">
 
      <div className="p-4 flex justify-between items-center">
        <h1 className="text-lg font-bold">&lt;CodeTrail /&gt;</h1>

        <div className="flex items-center gap-2">
          <button onClick={toggleMenu} className="focus:outline-none cursor-pointer brightness-0 invert">
            <Image
              src={isMenuOpen ? "/assets/icons/close.svg" : "/assets/icons/menu.svg"}
              alt="Menu"
              width={24}
              height={24}
            />
          </button>

          {user?.image ? (
            <Image
              src={user.image}
              alt="User"
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white text-sm font-semibold">
              {user?.name?.[0] ?? 'U'}
            </div>
          )}
        </div>
      </div>


      {isMenuOpen && (
        <div className="px-4 pb-4">
          <nav className="flex flex-col gap-2 mt-2">
            {sidebarLinks.map((item) => {
              const isActive =
                pathName === item.route || pathName.startsWith(`${item.route}/`);
              return (
                <Link
                  href={item.route}
                  key={item.label}
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition',
                    isActive
                      ? 'bg-white text-black'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  )}
                  onClick={() => setIsMenuOpen(false)} // close on nav
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-400">© CodeTrail</span>
            <button onClick={signOut} className="cursor-pointer">
              <Image
                src="/assets/icons/logout.svg"
                alt="Logout"
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
