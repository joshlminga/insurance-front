import React from 'react'

export const PartnersSection = () => {
    const partners = [
        { name: 'Partner 1', logo: 'https://via.placeholder.com/150x50?text=PARTNER+1' },
        { name: 'Partner 2', logo: 'https://via.placeholder.com/150x50?text=PARTNER+2' },
        { name: 'Partner 3', logo: 'https://via.placeholder.com/150x50?text=PARTNER+3' },
        { name: 'Partner 4', logo: 'https://via.placeholder.com/150x50?text=PARTNER+4' },
        { name: 'Partner 5', logo: 'https://via.placeholder.com/150x50?text=PARTNER+5' },
        { name: 'Partner 6', logo: 'https://via.placeholder.com/150x50?text=PARTNER+6' },
    ]

    return (
        <section className="py-12 bg-slate-50 border-y border-slate-100 overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {partners.map((partner, index) => (
                        <div key={index} className="h-8 md:h-10">
                            <img 
                                src={partner.logo} 
                                alt={partner.name} 
                                className="h-full object-contain filter contrast-125"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
