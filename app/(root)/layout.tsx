import Sidebar from '@/components/Sidebar'
import React, { ReactNode } from 'react'

const layout = ({children}: {children: ReactNode}) => {
  return (
    <main className="flex flex-row h-screen w-full">
        <Sidebar />
        <div className = "flex size-full flex-col">
          {children}
        </div>
    </main>
  )
}

export default layout
