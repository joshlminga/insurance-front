
import { Outlet } from 'react-router-dom'
import { Footer } from '@/app/landing/components/footer'
import Navbar from '@/app/landing/components/navbar'

export const MotorLandingPage = () => {
    return (
        <div>
            <main className="relative flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 mb-3">
                <Navbar />
                <div className="pt-18 sm:pt-18 lg:pt-20 w-[95vw] sm:w-[90vw] lg:w-[80vw] mx-auto">
                    {/* <div className="hidden lg:flex flex-col items-start justify-center w-full min-w-0 px-2 sm:block">
                        <h1 className="text-2xl xl:text-[32px] font-bold leading-tight text-black text-center mb-4 xl:mb-6">
                            Motor Insurance
                        </h1>
                    </div> */}
                    <Outlet />
                </div>
            </main>
            <Footer />
        </div>
    )
}
