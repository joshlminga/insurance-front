import React from 'react'

export const PartnersSection = () => {
    const partners = [
        { name: 'CIC Group', logo: 'cic.png' },
        { name: 'Britam', logo: 'britam.png' },
        { name: 'apa', logo: 'apa.png' },
        { name: 'sanlam', logo: 'sanlam.png' },
        { name: 'madison', logo: 'madison.png' },
    ]

    return (
        <section className="py-12 bg-slate-50 border-y border-slate-100 overflow-hidden">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16">
                    {partners.map((partner, index) => (
                        <div key={index} className="w-[164px] h-[92px] flex items-center justify-center">
                            <img 
                                src={partner.logo} 
                                alt={partner.name} 
                                className="max-w-full max-h-full object-contain transition-all duration-300"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}