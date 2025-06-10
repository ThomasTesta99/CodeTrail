'use client';

import { sidebarLinks } from '@/constants';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import React from 'react';
import { logoutUser } from '@/lib/user-actions/authActions';

const Topbar = ({ user }: UserProps) => {
  const pathName = usePathname();
  const router = useRouter();

  const signOut = () => {
    logoutUser();
    router.push('/sign-in')
}

  return (
    <div className="md:hidden w-full p-4 bg-[#1E1E2F] text-white flex flex-row gap-4 justify-between ">

      <div className="flex justify-between items-center">
        <h1 className="text-lg font-bold">&lt;CodeTrail /&gt;</h1>
      </div>

      <nav className="flex flex-wrap items-center justify-start gap-4 mt-2">
        {sidebarLinks.map((item) => {
          const isActive =
            pathName === item.route || pathName.startsWith(`${item.route}/`);

          return (
            <Link
              href={item.route}
              key={item.label}
              className={cn(
                'px-3 py-1 rounded-md text-sm font-medium transition',
                isActive
                  ? 'bg-white text-black'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {user?.image ? (
          <Image
            src={user.image}
            alt="User image"
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white text-sm font-semibold">
            {user?.name?.[0] ?? 'U'}
          </div>
        )}
        <button onClick={signOut} className="w-8 h-8 relative cursor-pointer">
            <Image
                src="/assets/icons/logout.svg"
                alt="logout"
                width={24}
                height={24}
                className="brightness-0 invert"
            />
            </button>
    </div>
  );
};

export default Topbar;
