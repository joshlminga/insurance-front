import { EPREFIX, EROUTES } from '@/utils/enums'
import { ChevronLeft, ChevronRight, MoveUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const InsuranceCard = ({ title, description, image, url }: { title: string, description: string, image: string, url?: string }) => (
  <div className="w-[220px] h-[201px] rounded-tl-[20px] rounded-tr-[20px] rounded-br-[20px] border border-[#D9D9D9]/20 overflow-hidden transition-transform hover:scale-105 bg-black">
    <div className="w-[220px] h-[93px] rounded-tl-[20px] rounded-tr-[20px] relative overflow-hidden">
      <img src={image} alt={title} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/40" />
    </div>
    <div className="p-4">
      <h3 className="font-['Poppins'] font-bold text-[13px] leading-[100%] text-white mb-2">
        {title}
      </h3>
      <p className="text-xs text-slate-300 leading-relaxed mb-2">
        {description}
      </p>
      <hr className="border-slate-700" />
      <Link to={String(url)} className='flex items-center gap-1 text-white text-xs hover:text-red-500 transition mb-1'>
        Learn More <MoveUpRight size={14} />
      </Link>
    </div>
  </div>
)

export const Cards = () => {
  return (
    <div className="relative w-full h-[127px] bg-black z-20" style={{ marginTop: '-127px' }}>
      <div className="absolute bottom-0 w-full h-[127px] flex items-center justify-center">
        <button className="absolute left-[403px] w-[30px] h-[30px] bg-white border border-[#FF9A9A] rounded-full flex items-center justify-center hover:bg-gray-50 transition-all z-10">
          <ChevronLeft size={16} className="text-slate-900" />
        </button>
        <div className="absolute bottom-0 flex gap-6 items-end justify-center">
          <InsuranceCard
            title="Motor Insurance"
            description="Comprehensive coverage for your vehicles against all types of risks."
            image="motor.jpg"
            url={`${EPREFIX.CUSTOMER} ${EROUTES.MOTOR}`}
          />
          <InsuranceCard
            title="Travel Insurance"
            description="Travel with peace of mind knowing you're covered worldwide."
            image="travel.jpg"
            url={`${EPREFIX.CUSTOMER} ${EROUTES.TRAVEL}`}
          />
          <InsuranceCard
            title="Marine Insurance"
            description="Protect your cargo and vessels across international waters."
            image="marine.jpg"
            url={`${EPREFIX.CUSTOMER} ${EROUTES.MARINE}`}
          />
          <InsuranceCard
            title="Health Insurance"
            description="Health insurance provides comprehensive coverage for medical expenses."
            image="life.jpg"
            url={`${EPREFIX.CUSTOMER} ${EROUTES.LIFE}`}
          />
        </div>
        <button className="absolute right-[403px] w-[30px] h-[30px] bg-white border border-[#FF9A9A] rounded-full flex items-center justify-center hover:bg-gray-50 transition-all z-10">
          <ChevronRight size={16} className="text-slate-900" />
        </button>
      </div>
    </div>
  )
}