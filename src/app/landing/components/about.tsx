import React from 'react'

export const AboutSection = () => {
    return (
        <section id="about" className="py-24 bg-white">
            <div className="container mx-auto px-6 max-w-7xl">
                {/* Centered Headline */}


                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-20">
                    {/* Image Collage */}
                    <div className="relative">
                        <div className="rounded-3xl overflow-hidden shadow-2xl">
                            <img
                                src="about_big.jpg"
                                alt="Modern building"
                                className="w-full h-[500px] object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-64 h-64 rounded-3xl overflow-hidden border-8 border-white shadow-2xl hidden lg:block">
                            <img
                                src="about_small.jpg"
                                alt="Analytics"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                    <div className="lg:pl-10">
                        <div className="text-center mb-6">
                            <h2 className="text-4xl font-bold text-slate-900 mb-4 uppercase tracking-wider">About Us</h2>
                        </div>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                            Acensure is committed to empowering organizations with strategic solutions in risk management,
                            financial advisory, and technology-driven growth. Whether you're looking to capitalize on new opportunities,
                            enhance financial performance, or embrace digital transformation, we are here to guide you every step of the way.
                        </p>
                        <p className="text-slate-500 mb-8">
                            Our team of seasoned experts brings decades of collective experience across various industries,
                            ensuring that our clients receive the highest level of service and most innovative strategies.
                        </p>

                        <div className="bg-slate-50 rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between border border-slate-100 shadow-sm mt-32">
                            <div className="flex-1 text-center py-4">
                                <h4 className="text-4xl font-extrabold text-slate-900 mb-2">200,000+</h4>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Customer</p>
                            </div>
                            <div className="hidden md:block w-px h-16 bg-red-600"></div>
                            <div className="flex-1 text-center py-4">
                                <h4 className="text-4xl font-extrabold text-slate-900 mb-2">150,000+</h4>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Quote Generated</p>
                            </div>
                            <div className="hidden md:block w-px h-16 bg-red-600"></div>
                            <div className="flex-1 text-center py-4">
                                <h4 className="text-4xl font-extrabold text-slate-900 mb-2">12+</h4>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Years in Business</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
