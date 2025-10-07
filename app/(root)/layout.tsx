
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/TopBar';
import { getUserSession } from '@/lib/user-actions/authActions'
import React, { ReactNode } from 'react'

const layout = async ({children}: {children: ReactNode}) => {
  const session = await getUserSession();
  const user = session?.user;
  return (
    <main className="flex flex-col md:flex-row w-full min-h-dvh overflow-x-hidden">
      <div className="md:hidden">
        <Topbar user={user} />
      </div>

      <div className="hidden md:flex md:flex-col md:w-64 md:shrink-0 md:self-stretch">
        <Sidebar user={user} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </main>
  )
}

export default layout
