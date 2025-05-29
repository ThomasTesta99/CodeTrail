
import Sidebar from '@/components/Sidebar'
import { getUserSession } from '@/lib/user-actions/authActions'
import React, { ReactNode } from 'react'

const layout = async ({children}: {children: ReactNode}) => {
  const session = await getUserSession();
  console.log(session)
  const user = session?.user;
  return (
    <main className="flex flex-row h-screen w-full">
        <Sidebar user = {user}/>
        <div className = "flex size-full flex-col">
          {children}
        </div>
    </main>
  )
}

export default layout
