import { MoveRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const ServiceCard = ({ title, image }: { title: string, image: string }) => (
    <div className="relative group overflow-hidden rounded-tl-3xl rounded-br-3xl h-[450px] border-r-2 border-l-2 border-red-600 shadow-2xl shrink-0 w-full md:w-[calc(33.333%-1.67rem)]">
        <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
        <div className="absolute bottom-8 left-8 right-8">
            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-red-500 transition-colors uppercase tracking-wide">
                {title}
            </h3>
            <Link to="#" className="text-red-500 font-bold flex items-center gap-2 hover:underline">
                Read more <span className="text-xl"><MoveRight /></span>
            </Link>
        </div>
    </div>
)

export const ServicesSection = () => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const services = [
        {
            title: "Risk & Insurance Consulting",
            image: "insuarance.jpg"
        },
        {
            title: "Reinsurance",
            image: "reinsuarance.png"
        },
        {
            title: "Actuarial Services",
            image: "acturial.jpg"
        },
        {
            title: "Insurance Broking",
            image: "acturial.jpg"
        },
        {
            title: "Investment Banking",
            image: "acturial.jpg"
        }
    ]
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % services.length)
        }, 1000)

        return () => clearInterval(timer)
    }, [services.length])

    return (
        <section id="services" className="py-20 bg-white">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="text-center mb-20">
                    <h2 className="text-4xl font-bold text-slate-900 mb-4 uppercase tracking-wider">Our Core Services</h2>
                    <div className="w-20 h-1 bg-red-600 mx-auto"></div>
                </div>
                <div className="relative overflow-hidden">
                    <div
                        className="flex gap-10 transition-transform duration-700 ease-in-out"
                        style={{ transform: `translateX(-${currentIndex * (100 / 3)}%)` }}>
                        {services.map((service, index) => (
                            <ServiceCard
                                key={index}
                                title={service.title}
                                image={service.image}
                            />
                        ))}
                    </div>
                </div>
                <div className="flex justify-center gap-4 mt-8">
                    {services.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-[70px] h-2.5 rounded-[20px] transition-all ${currentIndex === index
                                    ? 'bg-[#C20C0C]'
                                    : 'bg-[#B7B7B9]/[0.55]'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}