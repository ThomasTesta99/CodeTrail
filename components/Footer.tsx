
'use client'

import { logoutUser } from '@/lib/user-actions/authActions'
import { UserProps } from '@/types/types'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import React from 'react'

const Footer = ({ user }: UserProps) => {
    const router = useRouter();

    const signOut = async () => {
        await logoutUser();
        router.push('/sign-in');
        router.refresh();
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
                        user?.image ? 'bg-transparent' : 'bg-gray-600'
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
                            {user?.name?.[0] ?? 'U'}
                        </p>
                    )}
                </div>

                <div className="footer-email">
                    <h1 className="text-sm truncate font-semibold text-white">
                        {user?.name ?? ''}
                    </h1>

                    <p className="text-sm truncate font-normal text-gray-300">
                        {user?.email ?? ''}
                    </p>
                </div>
            </Link>

            <button
                type="button"
                onClick={signOut}
                className="footer-image"
                aria-label="Log out"
                title="Log out"
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