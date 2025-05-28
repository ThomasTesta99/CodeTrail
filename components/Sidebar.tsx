'use client'
import { sidebarLinks } from '@/constants'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

const Sidebar = () => {
    const pathName = usePathname();
    return (
        <section className="sticky left-0 top-0 flex h-screen w-[250px] sm:w-[280px] md:w-[300px] items-center flex-col justify-between border-r border-gray-200 bg-[#1E1E2F] text-white p-5">
            <nav className="flex flex-col gap-4">
                <Link href='/' className='mb-12 cursor-pointer flex items-center gap-2'>
                    <h1 className="text-2xl font-bold tracking-wide text-white">LeetCode Tracker</h1>
                </Link>

                {sidebarLinks.map((item) => {
                    const isActive = pathName === item.route || pathName.startsWith(`${item.route}/`);

                    return (
                        <Link href={item.route} key={item.label} className={cn('flex gap-3 items-center py-1 md:p-3 2xl:p-4 rounded-lg justify-center xl:justify-start transition-colors duration-200 hover:bg-gray-700', {
                            'bg-white text-black': isActive,
                            'hover:bg-gray-700': !isActive
                        })}>
                            <div className="relative size-6">
                                <Image
                                    src={item.imgUrl}
                                    alt={item.label}
                                    fill
                                    className={cn({'brightness-[3] invert-0': isActive, 'brightness-0 invert': !isActive})}
                                />
                            </div>
                            <p className={cn('text-sm font-medium text-white max-xl:hidden', {
                                '!text-black': isActive
                            })}>
                                {item.label}
                            </p>
                        </Link>
                    );
                })}
            </nav>
        </section>
    );
};

export default Sidebar;