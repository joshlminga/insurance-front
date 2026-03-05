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
  <Link to={url || '#'} className="flex flex-col w-full max-w-[220px] h-[201px] rounded-t-[20px] rounded-br-[20px] border border-white/10 overflow-hidden transition-transform hover:scale-105 bg-black mx-auto">
    <div className="h-[93px] relative overflow-hidden">
      <img src={image} alt={title} className="w-full h-full object-cover" loading="eager" />
      <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/40" />
    </div>
    <div className="p-4 flex flex-col justify-between grow">
      <div>
        <h3 className="font-bold text-[13px] leading-tight text-white mb-1">
          {title}
        </h3>
        <p className="text-[11px] text-slate-400 leading-snug line-clamp-2 mb-2">
          {description}
        </p>
      </div>
      <div className="space-y-2">
        <hr className="border-white/10" />
        <Link
          to={url || '#'}
          className='flex items-center gap-1 text-white text-[11px] hover:text-red-500 transition-colors'>
          Learn More <MoveUpRight size={12} />
        </Link>
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
    <div className="relative w-full h-[127px] bg-black z-20" style={{ marginTop: '-127px' }}>
      <div className="absolute bottom-0 w-full h-[127px] flex items-center justify-center">
        <div className="absolute bottom-0 flex gap-6 items-end justify-center">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-[1000px] mx-auto">
            <CarouselContent className="-ml-6 flex items-end h-60">
              {insuranceData.map((item, index) => (
                <CarouselItem key={index} className="pl-6 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <InsuranceCard {...item} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-[-50px] top-1/2 -translate-y-1/2 w-[30px] h-[30px] bg-white border border-[#FF9A9A] rounded-full flex items-center justify-center hover:bg-gray-50 transition-all z-10">
              <ChevronLeft size={16} className="text-slate-900" />
            </CarouselPrevious>
            <CarouselNext
              className="absolute right-[-50px] top-1/2 -translate-y-1/2 w-[30px] h-[30px] bg-white border border-[#FF9A9A] rounded-full flex items-center justify-center hover:bg-gray-50 transition-all z-10">
              <ChevronRight size={16} className="text-slate-900" />
            </CarouselNext>
          </Carousel>
        </div>
      </div>


    </div>
  )
}