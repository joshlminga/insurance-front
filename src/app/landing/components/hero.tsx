import { UseAuth } from "@/stores/auth-store"
import { Button, ReusableDropdown, UserMenuPopover } from "@/dev/core"
import { getInitials } from "@/lib/format"
import { createHeroPopoverItems } from "@/utils/constatnts"
import { EPREFIX, EROUTES } from "@/utils/enums"
import { Link } from "react-router-dom"
import { Bus, Car, Ship, User } from "lucide-react"
import { useNavigate } from "react-router-dom"

export const HeroSection = () => {
    const { isAuthenticated, logout, user } = UseAuth()
    const userName = user?.name ?? "User"
    const userEmail = user?.email ?? ""
    const userInitials = getInitials(userName)
    const heroPopoverItems = createHeroPopoverItems(logout)
    const Navigate = useNavigate();
    
    return (
        <section className="relative mx-auto min-h-130 h-[78vh] sm:h-[85vh] lg:h-230 w-full overflow-hidden">
            <div className="absolute inset-0 -z-10">
                <img src="/hero.webp" alt="" className="h-full w-full object-cover" loading="eager" />
                <div className="absolute inset-0 bg-linear-to-r from-slate-900/60 to-slate-900/40" />
            </div>
            {isAuthenticated ? (
                <UserMenuPopover
                    className="absolute hidden lg:block top-4 right-22 z-999"
                    userInitials={userInitials}
                    userName={userName}
                    userEmail={userEmail}
                    items={heroPopoverItems}
                />
            ) : (
                <Link
                    to={`/${EPREFIX.AUTH}${EROUTES.SIGNIN}`}
                    className="absolute hidden lg:flex top-4.75 right-22 z-10 h-6.5 w-20.5 items-center justify-center rounded-[20px] border border-[#C20C0C] bg-white text-sm font-semibold text-slate-900">
                    Login
                </Link>
            )}
            <div className="relative h-full w-full flex items-end sm:items-start">
                <div className="w-[90vw] sm:w-[80vw] lg:w-[70vw] mx-auto pb-20 sm:pb-0 sm:absolute sm:top-52 lg:top-69.5 sm:left-1/2 sm:-translate-x-1/2">
                    <h1
                        className="mb-1 sm:mb-6 text-[26px] sm:text-[36px] lg:text-[48px] font-semibold text-white leading-tight">
                        <span className="text-[#000000]">Your Trusted </span>
                    </h1>
                    <h1
                        className="mb-3 sm:mb-6 text-[26px] sm:text-[36px] lg:text-[48px] font-semibold text-[#EE2527] leading-tight">
                        Global Consulting Partner
                    </h1>
                    <p className="mb-5 sm:mb-10 max-w-full lg:w-191.25 text-[14px] sm:text-[17px] lg:text-[20px] font-normal text-white/74 leading-relaxed">
                        Acensure is committed to empowering organizations with strategies that inspire confidence and drive growth.
                        Whether you're looking to optimize risk management, enhance financial performance, or embrace digital transformation, we are here to guide you every step of the way.
                    </p>
                    <div className="flex items-center gap-3 sm:gap-4">
                        <ReusableDropdown
                            trigger={
                                <Button
                                    className="h-9 w-32 sm:w-36.25 rounded-[5px] border border-white bg-[#D9D9D9]/38 hover:bg-[#D9D9D9]/50 text-xs sm:text-sm font-semibold text-white transition-all">
                                    Generate Quote
                                </Button>
                            }
                            items={[
                                {
                                    label: "Motor Insurance",
                                    icon: <Car className="w-4 h-4" />,
                                    onClick: () => {
                                        Navigate(`/${EPREFIX.CUSTOMER}${EROUTES.MOTOR}`)
                                    },
                                },
                                {
                                    label: "Travel Insurance",
                                    icon: <Bus className="w-4 h-4" />,
                                    onClick: () => {
                                        Navigate(`/${EPREFIX.CUSTOMER}${EROUTES.TRAVEL}`)
                                    },
                                },
                                {
                                    label: "Marine Insurance",
                                    icon: <Ship className="w-4 h-4" />,
                                    onClick: () => {
                                        Navigate(`/${EPREFIX.CUSTOMER}${EROUTES.MARINE}`)
                                    },
                                },
                                {
                                    label: "Life Insurance",
                                    icon: <User className="w-4 h-4" />,
                                    onClick: () => {
                                        Navigate(`/${EPREFIX.CUSTOMER}${EROUTES.LIFE}`)
                                    },
                                },
                            ]} />
                        <Button
                            className="h-9 w-32 sm:w-36.25 rounded-[5px] border border-white bg-[#D9D9D9]/38 hover:bg-[#D9D9D9]/50 text-xs sm:text-sm font-semibold text-white transition-all">
                            Work with Us
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
