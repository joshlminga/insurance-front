
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
            <div className="max-w-7xl mx-auto px-6 flex gap-10 justify-between items-start">
                <div className="flex justify-center gap-12 md:gap-16">
                    {partners.map((partner, index) => (
                        <div key={index} className="w-41 h-23 flex items-center justify-center">
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