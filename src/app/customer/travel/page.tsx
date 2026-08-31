import { Footer } from '@/app/landing/components/footer'
import Navbar from '@/app/landing/components/navbar'
import { Outlet } from 'react-router-dom'

export const TravelLandingPage = () => {
    return (
        <div>
            <main className="relative flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 mb-3">
                <Navbar />
                <div className="pt-18 sm:pt-18 lg:pt-20 w-[95vw] sm:w-[90vw] lg:w-[80vw] mx-auto">
                    <Outlet />
                </div>
            </main>
            <Footer />
        </div>
    )
}
