
export const PartnersSection = () => {
    const partners = [
        { name: 'CIC Group', logo: 'cic.webp' },
        { name: 'Britam', logo: 'britam.webp' },
        { name: 'apa', logo: 'apa.webp' },
        { name: 'sanlam', logo: 'sanlam.webp' },
        { name: 'madison', logo: 'madison.webp' },
    ]

    return (
        <section id="faqs" className="bg-[#FFFFFF] py-6 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 md:gap-12 lg:gap-16">
                    {partners.map((partner, index) => (
                        <div key={index} className="w-28 h-16 sm:w-32 sm:h-18 md:w-36 md:h-20 lg:w-41 lg:h-23 flex items-center justify-center">
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