// import { UseAuth } from "@/stores/auth-store"
import { Button, ReusableDropdown } from "@/dev/core"
import { EPREFIX, EROUTES } from "@/utils/enums"
import { useNavigate } from "react-router-dom"
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
        className: "border-e border-b",
        url: "#"
    },
    {
        icon: Ship,
        label: "Marine Insurance",
        className: "border-b",
        url: "#"
    },
    {
        icon: Bus,
        label: "Travel Insurance",
        className: "border-e",
        url: "#"
    },
    {
        icon: User,
        label: "Life Insurance",
        className: "",
        url: "#"
    },
];


export const HeroSection = () => {
    const Navigate = useNavigate();
    const sectionRef = useRef<HTMLElement>(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

    return (
        <section ref={sectionRef}>
            <div className="bg-[url('/hero.webp')] bg-cover bg-center bg-repeat-x overflow-hidden relative flex flex-col xl:h-screen justify-center z-10">
                <div className="absolute inset-0 bg-linear-to-r from-slate-900/60 to-slate-900/40" />
                <div className="max-w-7xl w-[70vw] sm:w-[70vw] lg:w-[70vw] mx-auto sm:pb-0 sm:absolute sm:left-1/2 sm:-translate-x-1/2">
                    <h1 className="mb-1 sm:mb-6 text-[26px] sm:text-[36px] lg:text-[48px] font-semibold text-white leading-tight">
                        <span className="text-[#ffff]">Your Trusted </span>
                    </h1>
                    <h1 className="mb-3 sm:mb-6 text-[26px] sm:text-[36px] lg:text-[48px] font-semibold text-[#BF162E] leading-tight">
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
                                    className="h-10 w-32 sm:w-36.25 sm:text-sm flex items-center justify-center gap-2 rounded-full bg-[#BF162E] text-sm font-semibold text-white hover:bg-[#BF162E]/80 transition-colors"
                                    rightIcon={<ArrowRight className="h-3.5 w-3.5"/>}>
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
                <div className="xl:absolute bottom-0 right-0 z-30 xl:w-auto lg:w-4/5 w-full lg:ms-auto">
                    <div className="relative">
                        <div className="bg-background rounded-t-2xl xl:rounded-none xl:rounded-tl-2xl sm:py-10 py-6 sm:ps-12 ps-4 sm:pe-12 pe-4 xl:pe-60 z-1 relative">
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={
                                    isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }
                                }
                                transition={{ duration: 0.05, ease: "easeInOut" }}
                                className="grid grid-cols-2 sm:grid-cols-4 gap-0 sm:flex sm:items-center justify-center sm:gap-10 sm:text-center">
                                {propertyFeatures.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={
                                            isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                                        }
                                        transition={{
                                            duration: 0.05,
                                            delay: 0.02 + index * 0.2,
                                            ease: "easeInOut",
                                        }}
                                        className="flex sm:gap-10">
                                        <div className={`flex flex-col items-center gap-3 sm:py-0 sm:px-0 py-5 px-8 sm:border-0 border-gray-700 w-full ${item.className}`}>
                                            {item.icon && (
                                                <>
                                                    <item.icon
                                                        size={48}
                                                        className="text-foreground font-light"
                                                    />
                                                    <p className="text-sm font-normal text-muted-foreground">
                                                        {item.label}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                        {index < propertyFeatures.length - 1 && (
                                            <Separator
                                                orientation="vertical"
                                                className="h-12 my-auto sm:block hidden"
                                            />
                                        )}
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </div>


                {/* Clouds */}
                <>
                    <SeamlessCloud
                        cloudCount={2}
                        minSize={400}
                        maxSize={478}
                        opacity="opacity-60"
                        gapMin={100}
                        gapMax={500}
                        top="top-56 sm:top-8 left-0"
                    />
                </>
            </div>
        </section>

    )
}
