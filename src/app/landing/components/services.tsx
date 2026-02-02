import React from 'react'

const ServiceCard = ({ title, image }: { title: string, image: string }) => (
    <div className="relative group overflow-hidden rounded-3xl h-[450px] shadow-2xl">
        <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
        
        {/* red accent line */}
        <div className="absolute bottom-0 right-0 w-24 h-1 bg-red-600"></div>
        <div className="absolute bottom-0 right-0 w-1 h-24 bg-red-600"></div>

        <div className="absolute bottom-8 left-8 right-8">
            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-red-500 transition-colors uppercase tracking-wide">
                {title}
            </h3>
            <button className="text-red-500 font-bold flex items-center gap-2 hover:underline">
                Read more <span className="text-xl">→</span>
            </button>
        </div>
    </div>
)

export const ServicesSection = () => {
    return (
        <section id="services" className="py-32 bg-white">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="text-center mb-20">
                    <h2 className="text-4xl font-bold text-slate-900 mb-4 uppercase tracking-wider">Our Core Services</h2>
                    <div className="w-20 h-1 bg-red-600 mx-auto"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <ServiceCard 
                        title="Risk & Insurance Consulting" 
                        image="https://images.unsplash.com/photo-1454165833767-027ffcb58c17?q=80&w=2070&auto=format&fit=crop"
                    />
                    <ServiceCard 
                        title="Reinsurance Solutions" 
                        image="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop"
                    />
                    <ServiceCard 
                        title="Actuarial Services" 
                        image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
                    />
                </div>
            </div>
        </section>
    )
}
