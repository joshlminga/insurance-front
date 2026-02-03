import React from 'react'
import { Navbar } from '../landing/components/navbar'

export const MotorLandingPage = ({ children }: { children?: React.ReactNode }) => {
    return (
        <main className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <Navbar className='bg-[#0000001F]/50 w-full h-[175px] rounded-2xl backdrop-blur-[10px]' textStyle='text-[#141414]' navTextStyle="text-[#000000]" />
            {children}
        </main>
    )
}
