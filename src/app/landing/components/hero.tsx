import { UseAuth } from "@/components/auth-provider"
import { UserMenuPopover } from "@/dev/core"
import { getInitials } from "@/lib/format"
import { createHeroPopoverItems } from "@/utils/constatnts"
import { EPREFIX, EROUTES } from "@/utils/enums"
import { Link } from "react-router-dom"

export const HeroSection = () => {
    const { isAuthenticated, logout, user } = UseAuth()
    const userName = user?.name ?? "User"
    const userEmail = user?.email ?? ""
    const userInitials = getInitials(userName)
    const heroPopoverItems = createHeroPopoverItems(logout)
    return (
        <section className="relative mx-auto h-[920px] w-full overflow-hidden">
            <div className="absolute inset-0 -z-10">
                <img src="hero.jpg" alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-linear-to-r from-slate-900/60 to-slate-900/40" />
            </div>
            {isAuthenticated ? (
                <UserMenuPopover
                    className="absolute top-4 right-4 z-10 sm:right-[88px]"
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
            <div className="relative h-full w-full">
                <div className="absolute top-[278px] left-1/2 z-50 w-[70vw] -translate-x-1/2">
                    <h1
                        className="mb-6 text-[48px] leading-[100%] font-semibold text-white">
                        <span className="text-[#F91520]">Your Trusted </span>
                    </h1>
                    <h1
                        className="mb-6 text-[48px] leading-[100%] font-semibold text-white">
                        Global Consulting Partner
                    </h1>
                    <p className="mb-10 w-[765px] font-['Poppins'] text-[20px] leading-[100%] font-semibold text-white/74">
                        Acensure is committed to empowering organizations with strategies that inspire confidence and drive growth.
                        Whether you're looking to optimize risk management, enhance financial performance, or embrace digital transformation, we are here to guide you every step of the way.
                    </p>
                    <div className="mb-12 flex items-center gap-4">
                        <button className="h-9 w-[145px] rounded-[5px] border border-white bg-[#D9D9D9]/38 text-sm font-semibold text-white transition-all">
                            Get Quote
                        </button>
                        <button className="h-9 w-[145px] rounded-[5px] border border-white bg-[#D9D9D9]/38 text-sm font-semibold text-white transition-all">
                            Work with Us
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}
