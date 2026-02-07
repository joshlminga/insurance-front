
import { Navbar } from '../landing/components/navbar'
import { Outlet } from 'react-router-dom'
import { Footer } from '../landing/components/footer'

export const MotorLandingPage = () => {
    return (
        <>
        <main className="relative flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 mb-3">
            <Navbar className='bg-[#ADABAB30] w-full h-[175px] rounded-2xl backdrop-blur-[3.379px]' textStyle='text-[#141414]' navTextStyle="text-[#000000]" />
            <div className="pt-64 w-[80vw] mx-auto">
                <Outlet />
            </div>
        </main>
        <Footer/>
        </>
    )
}
