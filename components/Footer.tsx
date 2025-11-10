'use client'
import { logoutUser } from '@/lib/user-actions/authActions'
import { UserProps } from '@/types/types'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'

const Footer = ({user}: UserProps) => {
    const router = useRouter();

    const signOut = () => {
        logoutUser();
        router.push('/sign-in')
    }
    
    return (
        <footer className="footer mt-auto">
            <div className={`footer-name ${user?.image ? 'bg-transparent' : 'bg-gray-600'}`}>
                {user?.image ? (
                    <Image src={user.image} alt="User image" width={100} height={100} className="rounded-full" />
                ) : (
                    <p className="text-xl font-bold text-white">
                        {user?.name?.[0] ?? ' '}
                    </p>
                )}
            </div>

            <div className="footer-email">
                <h1 className="text-sm truncate font-semibold text-white">
                    {user?.name ?? ' '}
                </h1>
                <p className="text-sm truncate font-normal text-gray-300">
                     {user?.email ?? ' '}
                </p>
            </div>

            <button onClick={signOut} className="footer-image">
                <Image src="/assets/icons/logout.svg" fill alt="logout" className="brightness-0 invert" />
            </button>
        </footer>

    )
}

export default Footer