// import { UseAuth } from "@/stores/auth-store"
import { Button, ReusableDropdown } from "@/dev/core"
import { EPREFIX, EROUTES } from "@/utils/enums"
import { Link, useNavigate } from "react-router-dom"
import { useRef } from "react"
import { useInView } from "motion/react"
import { ArrowRight, Bus, Car, Ship, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { motion } from "motion/react";
import SeamlessCloud from "./seamless-cloud"

const propertyFeatures = [
    {
        icon: Car,
        label: "Motor Insurance",
        className: "border-e",
        url: EROUTES.MOTOR
    },
    {
        icon: Ship,
        label: "Marine Insurance",
        className: "border-e",
        url: EROUTES.MARINE
    },
    {
        icon: Bus,
        label: "Travel Insurance",
        className: "border-e",
        url: EROUTES.TRAVEL
    },
    {
        icon: User,
        label: "Life Insurance",
        className: "",
        url: EROUTES.LIFE
    },
];

export const HeroSection = () => {
    const Navigate = useNavigate();
    const sectionRef = useRef<HTMLElement>(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

    return (
        <section ref={sectionRef} className="relative w-full overflow-hidden">
            <div className="relative z-10 flex min-h-screen flex-col justify-between bg-[url('/hero.webp')] bg-cover bg-center bg-repeat-none pt-24 sm:pt-32 lg:pt-0">
                <div className="absolute inset-0 bg-linear-to-r from-slate-900/80 via-slate-900/60 to-slate-900/40" />
                <div className="relative z-20 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
                    <div className="max-w-2xl lg:max-w-3xl">
                        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                            <span>Your Trusted </span>
                            <span className="block mt-1 sm:mt-2 text-[#BF162E]">
                                Global Consulting Partner
                            </span>
                        </h1>

                        <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl font-normal text-white/80 leading-relaxed max-w-xl lg:max-w-2xl">
                            Acensure is committed to empowering organizations with strategies that inspire confidence and drive growth.
                            Whether you're looking to optimize risk management, enhance financial performance, or embrace digital transformation, we are here to guide you every step of the way.
                        </p>

                        <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-4">
                            <ReusableDropdown
                                trigger={
                                    <Button
                                        className="h-11 px-6 sm:px-8 flex items-center justify-center gap-2 rounded-full bg-[#BF162E] text-sm font-semibold text-white hover:bg-[#BF162E]/90 transition-colors shadow-lg shadow-red-900/20"
                                        rightIcon={<ArrowRight className="h-4 w-4" />}>
                                        Generate Quote
                                    </Button>
                                }
                                items={[
                                    {
                                        label: "Motor Insurance",
                                        icon: <Car className="w-4 h-4" />,
                                        onClick: () => Navigate(`/${EPREFIX.CUSTOMER}${EROUTES.MOTOR}`),
                                    },
                                    {
                                        label: "Travel Insurance",
                                        icon: <Bus className="w-4 h-4" />,
                                        onClick: () => Navigate(`/${EPREFIX.CUSTOMER}${EROUTES.TRAVEL}`),
                                    },
                                    {
                                        label: "Marine Insurance",
                                        icon: <Ship className="w-4 h-4" />,
                                        onClick: () => Navigate(`/${EPREFIX.CUSTOMER}${EROUTES.MARINE}`),
                                    },
                                    {
                                        label: "Life Insurance",
                                        icon: <User className="w-4 h-4" />,
                                        onClick: () => Navigate(`/${EPREFIX.CUSTOMER}${EROUTES.LIFE}`),
                                    },
                                ]}
                            />
                            <Button
                                variant="outline"
                                className="h-11 px-6 sm:px-8 flex items-center justify-center gap-2 rounded-full bg-transparent border-2 border-white text-sm font-semibold text-white hover:bg-white hover:text-slate-900 transition-all">
                                Work with Us
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="relative z-30 w-full lg:ml-auto lg:max-w-5xl xl:max-w-6xl">
                    <div className="bg-background rounded-t-3xl border-t border-gray-100 shadow-2xl px-4 py-6 sm:p-8 lg:rounded-none lg:rounded-tl-3xl lg:p-10">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6 lg:flex lg:items-center lg:justify-between lg:gap-8">
                            {propertyFeatures.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                    transition={{
                                        duration: 0.3,
                                        delay: 0.05 + index * 0.1,
                                        ease: "easeOut",
                                    }}
                                    className="flex flex-1 items-center justify-between">
                                    <Link
                                        to={`/${EPREFIX.CUSTOMER}${item?.url}`}
                                        className={`flex flex-col items-center gap-2 sm:gap-3 p-3 hover:bg-muted/50 transition-colors w-full text-center ${item.className}`}>
                                        {item.icon && (
                                            <>
                                                <item.icon
                                                    size={40}
                                                    className="text-foreground font-light sm:h-12 sm:w-12"
                                                />
                                                <p className="text-xs sm:text-sm font-medium text-muted-foreground tracking-tight">
                                                    {item.label}
                                                </p>
                                            </>
                                        )}
                                    </Link>
                                    {index < propertyFeatures.length - 1 && (
                                        <Separator
                                            orientation="vertical"
                                            className="hidden lg:block h-10 my-auto ml-4 opacity-40"
                                        />
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>

                <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-screen">
                    <SeamlessCloud
                        cloudCount={2}
                        minSize={400}
                        maxSize={478}
                        opacity="opacity-40"
                        gapMin={100}
                        gapMax={500}
                        top="top-24 lg:top-8 left-0"
                    />
                </div>
            </div>
        </section>

    )
}
