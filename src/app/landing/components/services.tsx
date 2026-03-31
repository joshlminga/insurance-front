import * as React from "react"
import { MoveRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Autoplay from "embla-carousel-autoplay"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselApi,
} from "@/components/ui/carousel"

const services = [
    { title: "Risk & Insurance Consulting", image: "insuarance.webp" },
    { title: "Reinsurance", image: "reinsuarance.webp" },
    { title: "Actuarial Services", image: "acturial.webp" },
    { title: "Insurance Broking", image: "acturial.webp" },
    { title: "Investment Banking", image: "acturial.webp" }
]

const ServiceCard = ({ title, image, index }: { title: string, image: string, index: number }) => (
    <div className="relative group overflow-hidden rounded-tl-3xl rounded-br-3xl h-112.5 border-x-2 border-red-600 shadow-2xl w-full">
        <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading={index < 3 ? "eager" : "lazy"}
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
    const [api, setApi] = React.useState<CarouselApi>()
    const [current, setCurrent] = React.useState(0)
    React.useEffect(() => {
        if (!api) return
        setCurrent(api.selectedScrollSnap())

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap())
        })
    }, [api])

    return (
        <section id="services" className="py-20 bg-white">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="text-center mb-20">
                    <h2 className="text-4xl font-bold text-slate-900 mb-4 uppercase tracking-wider">
                        Our Core Services
                    </h2>
                    <div className="w-20 h-1 bg-red-600 mx-auto"></div>
                </div>
                <Carousel
                    setApi={setApi}
                    plugins={[
                        Autoplay({
                            delay: 3000,
                        }),
                    ]}
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full">
                    <CarouselContent className="-ml-6">
                        {services.map((service, index) => (
                            <CarouselItem
                                key={index} className="pl-6 md:basis-1/2 lg:basis-1/3">
                                <ServiceCard {...service} index={index} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
                <div className="flex justify-center gap-4 mt-12">
                    {services.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => api?.scrollTo(index)}
                            className={`h-2.5 rounded-full transition-all duration-300 ${current === index ? 'w-16 bg-[#C20C0C]' : 'w-4 bg-[#B7B7B9]/40'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}