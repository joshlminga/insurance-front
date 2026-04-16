import { StepState } from "@/types/types"
import React from "react"

const steps = [
    {
        title: "Select Your Product",
        description:
            "Browse our range of insurance solutions and pick the coverage that fits your lifestyle and budget.",
    },
    {
        title: "Generate a Quote",
        description:
            "Answer a few quick questions and get an instant, personalised premium estimate in under 2 minutes.",
    },
    {
        title: "Pay Online & Go",
        description:
            "Securely pay via card, M-Pesa, or bank transfer. Your policy documents arrive instantly by email.",
    },
]


function getStepState(index: number, activeStep: number): StepState {
    if (index + 1 < activeStep) return "completed"
    if (index + 1 === activeStep) return "active"
    return "upcoming"
}

const ACTIVE_STEP = 2

const stepCircleClass: Record<StepState, string> = {
    completed: "border border-[#D11F3E] bg-white",
    active: "bg-[#D11F3E]",
    upcoming: "bg-[#1A1A1A]",
}

const stepNumberClass: Record<StepState, string> = {
    completed: "text-[#D11F3E]",
    active: "text-white",
    upcoming: "text-white",
}

export const HowItWorks = () => {
    return (
        <section id="how-it-works" className="py-10 sm:py-14 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-[#D11F3E] text-center mb-8 sm:mb-10">
                    HOW IT WORKS
                </p>

                {/* Desktop horizontal stepper */}
                <div className="hidden md:block w-full relative">
                    <div className="flex items-center w-full">
                        {steps.map((_step, index) => {
                            const state = getStepState(index, ACTIVE_STEP)
                            const isLast = index === steps.length - 1
                            return (
                                <React.Fragment key={index}>
                                    <div className="flex-1 flex items-center justify-center relative">
                                        {index > 0 && (
                                            <div className="absolute left-0 right-[calc(50%+32.5px)] h-px bg-[#D1D1D1]" />
                                        )}
                                        {!isLast && (
                                            <div className="absolute left-[calc(50%+32.5px)] right-0 h-px bg-[#D1D1D1]" />
                                        )}
                                        <div className={`w-16.25 h-16.25 rounded-full flex items-center justify-center shrink-0 relative z-1 
                                                        ${stepCircleClass[state]}`}>
                                            <span className={`font-medium text-xl leading-none ${stepNumberClass[state]}`}>
                                                {index + 1}
                                            </span>
                                        </div>
                                    </div>
                                </React.Fragment>
                            )
                        })}
                    </div>
                    <div className="flex w-full mt-5">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className="flex-1 flex flex-col items-center text-center gap-2.5 px-3">
                                <p className="font-medium text-xl leading-normal text-black">
                                    {step.title}
                                </p>
                                <p className="font-normal text-sm leading-[1.6] text-[#6B6B6B] max-w-65">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile vertical stepper */}
                <div className="md:hidden flex flex-col gap-6 relative pl-10">
                    <div className="absolute left-5.75 top-4 bottom-4 w-px bg-[#D1D1D1]" />
                    {steps.map((step, index) => {
                        const state = getStepState(index, ACTIVE_STEP)
                        return (
                            <div key={index} className="flex items-start gap-4 relative">
                                <div className={`absolute -left-4.25 w-11 h-11 rounded-full flex items-center justify-center shrink-0 z-1 ${stepCircleClass[state]}`}>
                                    <span className={`font-medium text-base leading-none ${stepNumberClass[state]}`}>
                                        {index + 1}
                                    </span>
                                </div>
                                <div className="ml-4 pt-1">
                                    <p className="font-medium text-lg leading-normal text-black">
                                        {step.title}
                                    </p>
                                    <p className="font-normal text-sm leading-[1.6] text-[#6B6B6B] mt-1">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="mt-12 sm:mt-20 rounded-xl border-4 sm:border-5 border-[#E5E5E5] bg-white flex flex-col md:flex-row items-stretch overflow-hidden min-h-fit md:min-h-85">
                    <div className="relative w-full md:w-[45%] shrink-0 h-56 sm:h-72 md:h-auto md:min-h-85 bg-[#F5F5F5] overflow-hidden">
                        <div
                            className="absolute top-0 right-0 w-0 h-0 border-solid z-1 hidden sm:block"
                            style={{
                                borderWidth: "0 220px 340px 0",
                                borderColor: "transparent #D11F3E transparent transparent",
                            }}
                        />
                        <div
                            className="absolute top-0 right-0 w-0 h-0 border-solid z-1 sm:hidden"
                            style={{
                                borderWidth: "0 140px 224px 0",
                                borderColor: "transparent #D11F3E transparent transparent",
                            }}
                        />
                        <div className="absolute bottom-0 left-8 sm:left-15 w-20 sm:w-30 h-20 sm:h-30 bg-[rgba(180,180,180,0.4)] z-2"
                            style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center z-0">
                            <div className="w-40 sm:w-55 h-52 sm:h-70 bg-[#b5a99e] rounded-lg flex items-center justify-center">
                                <img src="/become-agent.jpg" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 px-6 sm:px-14 py-8 sm:py-12 flex flex-col justify-center gap-4 sm:gap-5">
                        <h2 className="font-bold text-xl sm:text-[28px] leading-[1.3] tracking-wider text-[#1A1A1A] uppercase">
                            BECOME AN AGENT WITH ACENTRIA
                        </h2>

                        <p className="font-normal text-sm sm:text-base leading-[1.7] text-[#9B9B9B] max-w-full lg:max-w-105">
                            Join our network of industry experts and unlock new opportunities in risk management,
                            insurance, and financial consulting. Partner with us to grow your career, expand your
                            reach, and deliver innovative solutions to clients worldwide.
                        </p>

                        <div className="mt-2">
                            <button className="font-medium text-sm text-[#1A1A1A] bg-transparent border border-[#ED1E26] rounded px-6 py-2.5 cursor-pointer tracking-[0.02em]">
                                Apply Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HowItWorks
