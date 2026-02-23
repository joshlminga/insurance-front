
import { Link, Outlet } from 'react-router-dom'
import { StepperProvider } from '@/hooks/stepper-context'
import { Navbar } from '@/app/landing/components/navbar'
import { Footer } from '@/app/landing/components/footer'
import { UserMenuPopover } from '@/dev/core'
import { UseAuth } from '@/components/auth-provider'
import { createHeroPopoverItems } from '@/utils/constatnts'
import { getInitials } from '@/lib/format'
import { EPREFIX, EROUTES } from '@/utils/enums'

export const MotorLandingPage = () => {
    const { isAuthenticated, logout, user } = UseAuth()
    const userName = user?.name ?? "User"
    const userEmail = user?.email ?? ""
    const userInitials = getInitials(userName)
    const heroPopoverItems = createHeroPopoverItems(logout)
    return (
        <StepperProvider>
            <main className="relative flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 mb-3">
                {isAuthenticated ? (
                    <UserMenuPopover
                        className="absolute top-4 right-4 z-10 sm:right-[88px] rounded-full border border-[#C20C0C] bg-white"
                        userInitials={userInitials}
                        userName={userName}
                        userEmail={userEmail}
                        items={heroPopoverItems}
                    />
                ) : (
                    <Link
                        to={`/${EPREFIX.AUTH}${EROUTES.SIGNIN}`}
                        className="absolute top-[19px] right-[88px] z-10 flex h-[26px] w-[82px] items-center justify-center rounded-[20px] border border-[#C20C0C] bg-white text-sm font-semibold text-slate-900">
                        Login
                    </Link>
                )}
                <Navbar className='bg-[#ADABAB30] w-full h-[175px] rounded-2xl backdrop-blur-[3.379px]' textStyle='text-[#141414]' navTextStyle="text-[#000000]" />
                <div className="pt-64 w-[80vw] mx-auto">
                    <Outlet />
                </div>
            </main>
            <Footer />
        </StepperProvider>
    )
}
