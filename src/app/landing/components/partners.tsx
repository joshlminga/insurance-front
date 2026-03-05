
export const PartnersSection = () => {
    const partners = [
        { name: 'CIC Group', logo: 'cic.webp' },
        { name: 'Britam', logo: 'britam.webp' },
        { name: 'apa', logo: 'apa.webp' },
        { name: 'sanlam', logo: 'sanlam.webp' },
        { name: 'madison', logo: 'madison.webp' },
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