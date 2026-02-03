import React from 'react'
import { Navbar } from '../landing/components/navbar'
import { Outlet } from 'react-router-dom'

export const MotorLandingPage = () => {
    return (
        <main className="relative flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <Navbar className=' bg-[#ADABAB30] w-full h-[175px] rounded-2xl backdrop-blur-[3.379px]' textStyle='text-[#141414]' navTextStyle="text-[#000000]" />
            <div className="pt-64 w-[80vw] mx-auto">
                <Outlet />
            </div>
        </main>
    )
}
