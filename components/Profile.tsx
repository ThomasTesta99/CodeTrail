'use client'
import { checkRate, sendVerificationEmail } from '@/lib/user-actions/authActions'
import { User } from '@/types/types'
import Image from 'next/image'
import React from 'react'
import toast from 'react-hot-toast'

const Profile = ({user} : {user : User}) => {

    const handleVerifyEmail = async () => {
        try {
            if(user.emailVerified){
                toast.success("Email already verified.");
                return;
            }
            const email = user.email;

            const rateLimit = await checkRate(email, "verify-email");

            if(!rateLimit.valid){
                toast.error(rateLimit.message);
                return;
            }

            const result = await sendVerificationEmail({email: email, url: `${window.location.origin}/email-verified`});
            if(!result.success){
                toast.error(result.message);
            }
            toast.success("Verification email sent successfully. Please check your email.");
        } catch {
            toast.error("An error occurred while verifying the email.");
        }
    }

    return (
        <main className="w-full p-6">
            <div className="mx-auto">
                <div className="mb-8 text-[#2C325D]">
                    <h1 className="text-3xl font-bold">
                        Profile
                    </h1>

                    <p className="mt-1">
                        View your CodeTrail profile information.
                    </p>
                </div>

                <section className="rounded-xl border border-gray-700 bg-gray-900 p-6">
                    <div className="flex items-center gap-5">
                        {user.image ? (
                            <Image
                                src={user.image}
                                alt="Profile image"
                                width={96}
                                height={96}
                                className="rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex size-24 items-center justify-center rounded-full bg-gray-700">
                                <span className="text-3xl font-bold text-white">
                                    {user.name?.[0]?.toUpperCase() ?? '?'}
                                </span>
                            </div>
                        )}

                        <div className="min-w-0">
                            <h2 className="truncate text-2xl font-semibold text-white">
                                {user.name}
                            </h2>

                            <p className="truncate text-gray-400">
                                {user.email}
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 border-t border-gray-700 pt-6">
                        <h3 className="mb-6 text-lg font-semibold text-white">
                            Profile Information
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <p className="text-sm text-gray-400">
                                    Name
                                </p>

                                <p className="mt-1 text-white">
                                    {user.name ?? 'Not provided'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-400">
                                    Email
                                </p>

                                <p className="mt-1 text-white">
                                    {user.email}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-400">
                                    Member since
                                </p>

                                <p className="mt-1 text-white">
                                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-400">
                                    Email verification
                                </p>

                                {user.emailVerified ? (
                                    <p className="mt-1 text-green-400">
                                        Verified
                                    </p>
                                ) : (
                                    <div className="mt-2 flex items-center gap-3">
                                        <p className="text-yellow-400">
                                            Not verified
                                        </p>

                                        <button
                                            type="button"
                                            className="cursor-pointer rounded-md border border-gray-600 px-3 py-1.5 text-sm text-white transition hover:bg-gray-800"
                                            onClick={handleVerifyEmail}
                                        >
                                            Verify Email
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    )
}

export default Profile
