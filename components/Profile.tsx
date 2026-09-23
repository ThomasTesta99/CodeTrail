'use client'

import { sendVerificationEmail } from '@/lib/user-actions/authActions'
import { User } from '@/types/types'
import Image from 'next/image'
import { useState } from 'react'
import toast from 'react-hot-toast'
import ActivityCalendar from './ActivityCalendar'

const Profile = ({ user }: { user: User}) => {
    const [isSending, setIsSending] = useState(false);

    const handleVerifyEmail = async () => {
        setIsSending(true);
        try {
            if(isSending) return;
            if (user.emailVerified) {
                toast.success("Email already verified.");
                return;
            }

            const result = await sendVerificationEmail({
                url: `${window.location.origin}/email-verified`
            });

            if (!result.success) {
                toast.error(result.message);
                return;
            }

            toast.success("Verification email sent successfully. Please check your email.");
        } catch {
            toast.error("An error occurred while verifying the email.");
        }finally{
            setIsSending(false);
        }
    }

    return (
        <main className="w-full p-6">
            <div className="max-w-7xl mx-auto flex flex-col gap-8">

                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Profile
                    </h1>

                    <p className="mt-2 text-base text-gray-600">
                        View your CodeTrail profile information and activity.
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
                                className="size-24 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex size-24 shrink-0 items-center justify-center rounded-full bg-gray-700">
                                <span className="text-3xl font-bold text-white">
                                    {user.name?.[0]?.toUpperCase() ?? '?'}
                                </span>
                            </div>
                        )}

                        <div className="min-w-0">
                            <h2 className="truncate text-2xl font-semibold text-white">
                                {user.name}
                            </h2>

                            <p className="mt-1 truncate text-sm text-gray-400">
                                {user.email}
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 border-t border-gray-700 pt-6">
                        <h2 className="mb-6 text-xl font-semibold text-white">
                            Profile Information
                        </h2>

                        <div className="space-y-6">

                            <div>
                                <p className="text-sm font-medium text-gray-400">
                                    Name
                                </p>

                                <p className="mt-1 text-base text-gray-100">
                                    {user.name ?? 'Not provided'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-400">
                                    Email
                                </p>

                                <p className="mt-1 text-base text-gray-100">
                                    {user.email}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-400">
                                    Member since
                                </p>

                                <p className="mt-1 text-base text-gray-100">
                                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-400">
                                    Email verification
                                </p>

                                {user.emailVerified ? (
                                    <p className="mt-1 text-base font-medium text-green-400">
                                        Verified
                                    </p>
                                ) : (
                                    <div className="mt-2 flex items-center gap-3">
                                        <p className="text-base font-medium text-yellow-400">
                                            Not verified
                                        </p>

                                        <button
                                            type="button"
                                            onClick={handleVerifyEmail}
                                            disabled={isSending}
                                            className="cursor-pointer rounded-md border border-gray-600 px-3 py-1.5 text-sm font-medium text-gray-100 transition hover:border-gray-500 hover:bg-gray-800"
                                        >
                                            {isSending ? "Sending..." : "Verify Email"}
                                        </button>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </section>

                <section className="rounded-xl border border-gray-700 bg-gray-900 p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-white">
                            Activity
                        </h2>

                        <p className="mt-1 text-sm text-gray-400">
                            Your CodeTrail activity over the past year.
                        </p>
                    </div>

                    <ActivityCalendar/>
                </section>

            </div>
        </main>
    )
}

export default Profile