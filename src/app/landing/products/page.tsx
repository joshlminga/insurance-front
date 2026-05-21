import React from 'react'
import Navbar from '../components/navbar'

export const ProductsListPage = () => {
    return (
        <div className="min-h-screen">
            <Navbar />
            <main>
                <div className="relative w-full h-60 sm:h-64 lg:h-100 overflow-hidden">
                    <img
                        src="/product.webp"
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="eager"
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-slate-900/60 to-slate-900/40" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pt-16 sm:pt-20">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2 sm:mb-3">
                           What are you protecting today?
                        </h1>
                        <p className="text-white/75 max-w-xl text-sm sm:text-base leading-relaxed">
                            Browse our full range of insurance products and find the right protection for you,
                            your family, or your business.
                        </p>
                    </div>
                </div>
                    {/* Product list section */}
            </main>
        </div>
    )
}
