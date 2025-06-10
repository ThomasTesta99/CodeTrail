
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/TopBar';
import { getUserSession } from '@/lib/user-actions/authActions'
import React, { ReactNode } from 'react'

const layout = async ({children}: {children: ReactNode}) => {
  const session = await getUserSession();
  const user = session?.user;
  return (
    <main className="flex flex-col md:flex-row w-full min-h-screen overflow-x-hidden">
      {/* Topbar: visible only on small screens */}
      <div className="md:hidden">
        <Topbar user={user} />
      </div>

      {/* Sidebar: visible only on md+ screens */}
      <div className="hidden md:block">
        <Sidebar user={user} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </main>
  )
}

export default layout
