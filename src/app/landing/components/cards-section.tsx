import { EPREFIX, EROUTES } from '@/utils/enums'
import { ChevronLeft, ChevronRight, MoveUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const InsuranceCard = ({ title, description, image, url }: { title: string, description: string, image: string, url?: string }) => (
  <Link
    to={url || '#'}
    className="flex flex-col w-full rounded-t-[20px] rounded-br-[20px] border border-[#D9D9D9] overflow-hidden transition-transform hover:scale-105 bg-black mx-auto"
    style={{ height: 'clamp(170px, 22vw, 201px)' }}
  >
    <div className="relative overflow-hidden" style={{ height: 'clamp(80px, 10vw, 93px)' }}>
      <img src={image} alt={title} className="w-full h-full object-cover" loading="eager" />
      <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/40" />
    </div>
    <div className="p-3 sm:p-4 flex flex-col justify-between grow">
      <div>
        <h3 className="font-bold text-[12px] sm:text-[13px] leading-tight text-white mb-1">
          {title}
        </h3>
        <p className="text-[10px] sm:text-[11px] text-slate-400 leading-snug line-clamp-2 mb-1 sm:mb-2">
          {description}
        </p>
      </div>
      <div className="space-y-1.5 sm:space-y-2">
        <hr className="border-white/10" />
        <span className="flex items-center gap-1 text-white text-[10px] sm:text-[11px] hover:text-red-500 transition-colors">
          Learn More <MoveUpRight size={11} />
        </span>
      </div>
    </div>
  </Link>
)

export const Cards = () => {
  const insuranceData = [
    { title: "Motor Insurance", description: "Comprehensive coverage for your vehicles.", image: "motor.webp", url: `${EPREFIX.CUSTOMER}${EROUTES.MOTOR}` },
    { title: "Travel Insurance", description: "Travel with peace of mind worldwide.", image: "travel.webp", url: `${EPREFIX.CUSTOMER}${EROUTES.TRAVEL}` },
    { title: "Marine Insurance", description: "Protect your cargo across international waters.", image: "marine.webp", url: `${EPREFIX.CUSTOMER}${EROUTES.MARINE}` },
    { title: "Health Insurance", description: "Comprehensive coverage for medical expenses.", image: "life.webp", url: `${EPREFIX.CUSTOMER}${EROUTES.LIFE}` },
  ]

  return (
    <div
      className="relative w-full bg-black z-20 -mt-10 sm:-mt-15 lg:-mt-31.75"
      style={{ paddingBottom: '8px' }}
    >
      <div className="w-full flex items-end justify-center px-8 sm:px-10 md:px-14">
        <Carousel
          opts={{ align: "start", loop: true }}
          className="w-full max-w-250 mx-auto"
        >
          <CarouselContent className="-ml-2 sm:-ml-4 md:-ml-6 flex items-end h-45 sm:h-50 lg:h-55">
            {insuranceData.map((item, index) => (
              <CarouselItem
                key={index}
                className="pl-2 sm:pl-4 md:pl-6 basis-[48%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <InsuranceCard {...item} />
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="absolute -left-6 sm:-left-9 md:-left-10 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 md:w-7.5 md:h-7.5 bg-white border border-[#FF9A9A] rounded-full flex items-center justify-center hover:bg-gray-50 transition-all z-10 shadow-sm">
            <ChevronLeft size={14} className="text-slate-900" />
          </CarouselPrevious>

          <CarouselNext className="absolute -right-6 sm:-right-9 md:-right-10 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 md:w-7.5 md:h-7.5 bg-white border border-[#FF9A9A] rounded-full flex items-center justify-center hover:bg-gray-50 transition-all z-10 shadow-sm">
            <ChevronRight size={14} className="text-slate-900" />
          </CarouselNext>
        </Carousel>
      </div>
    </div>
  )
}