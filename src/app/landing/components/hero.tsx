import { Button } from "@/dev/core"
import { EPREFIX, EROUTES } from "@/utils/enums"

export const HeroSection = () => {
    return (
        <section className="relative w-full h-[920px] mx-auto overflow-hidden">
            <div className="absolute inset-0 -z-10">
                <img
                    src="hero.jpg"
                    alt=""
                    className="w-full h-full object-cover"
                />
                {/* <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-transparent" /> */}
                <div className="absolute inset-0 bg-linear-to-r from-slate-900/60 to-slate-900/40" />
            </div>
            <a href={`${EPREFIX.AUTH}${EROUTES.SIGNIN}`}>
                <Button type="button" className='absolute top-[19px] right-[88px] w-[82px] 
                h-[26px] rounded-[20px] bg-white border border-[#C20C0C] text-sm font-semibold text-slate-900 cursor-pointer'>
                    Login
                </Button>
            </a>
            <div className="relative w-full h-full">
                <div className="absolute top-[278px] left-1/2 -translate-x-1/2 z-50 w-[70vw]">
                    <h1
                        className="
                            font-['Poppins']
                            font-semibold
                            text-[48px]
                            leading-[100%]
                            text-white
                            mb-6">
                        <span className="text-[#F91520]">Your Trusted </span>
                    </h1>
                    <h1
                        className="
                            font-['Poppins']
                            font-semibold
                            text-[48px]
                            leading-[100%]
                            text-white
                            mb-6">
                        Global Consulting Partner
                    </h1>

                    <p className="w-[765px] font-['Poppins'] font-semibold text-[20px] leading-[100%] text-white/74 mb-10">
                        Acensure is committed to empowering organizations with strategies that inspire confidence and drive growth. Whether you're looking to optimize risk management, enhance financial performance, or embrace digital transformation, we are here to guide you every step of the way.
                    </p>

                    <div className="flex items-center gap-4 mb-12">
                        <button className="w-[145px] h-9 rounded-[5px] bg-[#D9D9D9]/38 border border-white text-white font-semibold text-sm transition-all">
                            Get Quote
                        </button>
                        <button className="w-[145px] h-9 rounded-[5px] bg-[#D9D9D9]/38 border border-white text-white font-semibold text-sm transition-all">
                            Work with Us
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}