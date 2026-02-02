import React from 'react'

export const AgentBanner = () => {
    return (
        <section className="py-16 bg-red-600 relative overflow-hidden">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 text-white relative z-10">
                    <div className="max-w-2xl text-center md:text-left">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                            Expand Your Business Reach with Our Reliable Network
                        </h2>
                        <p className="text-white/80 text-lg mb-8">
                            Join our community of professional agents and take your career to the next level with industry-leading support and tools.
                        </p>
                        <button className="bg-white text-red-600 font-bold py-4 px-10 rounded-full hover:bg-slate-100 transition-all shadow-xl hover:-translate-y-1">
                            Apply Now
                        </button>
                    </div>
                    
                    <div className="hidden md:block w-1/3">
                        <img 
                            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop" 
                            alt="Professional insurance agent" 
                            className="rounded-2xl shadow-2xl rotate-2"
                        />
                    </div>
                </div>
            </div>
            
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </section>
    )
}
