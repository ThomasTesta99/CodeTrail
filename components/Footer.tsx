'use client'
import { logoutUser } from '@/lib/user-actions/authActions'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'

const Footer = () => {
    const router = useRouter();
    const user : User = {
        name: "Thomas Testa",
        email: "ttesta99@yahoo.com"
    }

    const signOut = () => {
        logoutUser();
        router.push('/sign-in')
    }
    
    return (
        <footer className="footer">
            <div className={'footer-name'}>
                <p className="text-xl font-bold text-white">
                    {user?.name[0]} {/* Show first letter of name */}
                </p>
            </div>

            <div className={ 'footer-email'}>
                <h1 className="text-sm truncate font-semibold text-white">
                    {user?.name}
                </h1>
                <p className="text-sm truncate font-normal text-gray-300">
                    {user?.email}
                </p>
            </div>

            <button onClick = {signOut} className="footer-image">
                <Image src="/assets/icons/logout.svg" fill alt="logout" className="brightness-0 invert" />
            </button>
        </footer>
    )
}

export default Footer
