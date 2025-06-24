'use client'
import { sidebarLinks } from '@/constants'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import Footer from './Footer'
import { UserProps } from '@/types/types'

const Sidebar = ({user}: UserProps) => {
    const pathName = usePathname();
    return (
        <section className="sidebar">
            <nav className="flex flex-col gap-4">
                <Link href='/' className='mb-12 cursor-pointer flex items-center gap-2'>
                    <h1 className="sidebar-logo">&lt;CodeTrail /&gt;</h1>
                </Link>

                {sidebarLinks.map((item) => {
                    const isActive = pathName === item.route || pathName.startsWith(`${item.route}/`);

                    return (
                        <Link href={item.route} key={item.label} className={cn('sidebar-link', {
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
                            <p className={cn('sidebar-label', {
                                '!text-black': isActive
                            })}>
                                {item.label}
                            </p>
                        </Link>
                    );
                })}
            </nav>
            <Footer user = {user}/>
        </section>
    );
};

export default Sidebar;