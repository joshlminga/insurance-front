import { Footer } from '@/app/landing/components/footer'
import Navbar from '@/app/landing/components/navbar'
import React from 'react'

export const CustomerProfileLayout = () => {
    return (
        <div className="min-h-screen">
            <Navbar />
            <main>
                <div className="relative w-full h-48 sm:h-64 lg:h-80 overflow-hidden">
                    <img
                        src="/contact_us.webp"
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="eager"
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-slate-900/60 to-slate-900/40" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pt-16 sm:pt-20">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2 sm:mb-3">
                            Visit Our Office or Get in Touch
                        </h1>
                        <p className="text-white/75 max-w-xl text-sm sm:text-base leading-relaxed">
                            We'd love to meet you in person or connect virtually. Reach out online and we'll get back to you within 24 hours.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
