import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, Car, Heart, Plane, ChevronLeft, ChevronRight } from 'lucide-react'
import { Navbar } from './navbar'

const InsuranceCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="flex flex-col items-start p-4 text-left transition-transform hover:scale-105">
        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mb-4 text-white">
            <Icon size={20} />
        </div>
        <h3 className="font-bold text-white text-base mb-2">{title}</h3>
        <p className="text-xs text-slate-300 mb-3">{description}</p>
        <button className="text-white font-semibold text-xs flex items-center gap-1 hover:underline">
            Learn More <span className="text-lg">→</span>
        </button>
    </div>
)

export const HeroSection = () => {
    return (
        <section className="relative h-[920px] mx-auto overflow-hidden">
            <div className="absolute inset-0 -z-10">
                <img
                    src="hero.jpg"
                    alt=""
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-transparent" />
            </div>

            <button className='absolute top-left'>
                Login
            </button>

            <div className="container mx-auto px-6 max-w-7xl">
                <div className="absolute top-[278px] left-[110px] w-[658px]">
                    <span className="block text-[#F91520] font-semibold uppercase tracking-wider text-5xl mb-4">
                        Your Trusted
                    </span>
                    <h1
                        className="
                            font-['Poppins']
                            font-semibold
                            text-[48px]
                            leading-[1]
                            text-white
                            mb-6
                        ">
                        Global Consulting Partner
                    </h1>

                    <p className="text-lg text-slate-200 mb-10 leading-relaxed max-w-2xl">
                        Acensure is committed to empowering organizations with strategic solutions in risk management,
                        financial advisory, and technology-driven growth. Whether you're looking to capitalize on new opportunities,
                        enhance financial performance, or embrace digital transformation, we are here to guide you every step of the way.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
                        <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-10 rounded-full transition-all shadow-lg hover:shadow-red-600/20">
                            Generate a quote
                        </button>
                        <button className="bg-transparent hover:bg-white/10 text-white font-bold py-4 px-10 rounded-full border-2 border-white transition-all">
                            Work with Us
                        </button>
                    </div>

                    {/* Carousel Dots */}
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-600"></div>
                        <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                        <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                        <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                    </div>
                </div>
                {/* </div> */}

                {/* Overlapping Black Bar for Insurance Cards */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-7xl translate-y-1/2 px-6 z-20">
                    <div className="bg-slate-950 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex items-center">
                        {/* Navigation Buttons */}
                        <button className="absolute left-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-md">
                            <ChevronLeft size={20} />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full px-10 z-100">
                            <InsuranceCard
                                icon={Car}
                                title="Motor Insurance"
                                description="Comprehensive coverage for your vehicles against all types of risks."
                            />
                            <InsuranceCard
                                icon={Plane}
                                title="Travel Insurance"
                                description="Travel with peace of mind knowing you're covered worldwide."
                            />
                            <InsuranceCard
                                icon={Shield}
                                title="Marine Insurance"
                                description="Protect your cargo and vessels across international waters."
                            />
                            <InsuranceCard
                                icon={Heart}
                                title="Health Insurance"
                                description="Health insurance provides comprehensive coverage for medical expenses."
                            />
                        </div>

                        <button className="absolute right-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-md">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}
