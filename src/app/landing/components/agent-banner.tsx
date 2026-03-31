export const AgentBanner = () => {
    return (
        <section className="relative w-full min-h-80 py-16 overflow-hidden bg-linear-to-r from-[#C20C0C0D] to-[#FF9A9A0D] flex items-center">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="relative grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-32 xl:gap-40 items-center">
                    <div className="flex flex-col">
                        <h1 className="font-bold leading-[100%] text-black mb-4 text-2xl md:text-3xl lg:text-4xl">
                            BECOME AN AGENT WITH ACENTRIA
                        </h1>
                        <p className="w-full max-w-89.75 font-medium leading-[120%] text-black mb-8 text-sm md:text-base">
                            Join our network of industry experts and unlock new opportunities in
                            risk management, insurance, and financial consulting. Partner with
                            us to grow your career, expand your reach, and deliver innovative
                            solutions to clients worldwide.
                        </p>

                        <button className="w-27.5 h-8.25 rounded-[5px] bg-white border border-[#ED1E26] font-medium leading-[100%] text-black hover:bg-gray-50 transition-all">
                            Apply Now
                        </button>
                    </div>
                    <div className="relative h-55 mt-10 md:mt-0">
                        <div className="absolute top-8.75 left-0 w-19.5 h-20.25 rounded-tl-[20px] rounded-tr-[20px] rounded-br-[20px] bg-[#FF9A9A]/36" />
                        <div className="absolute top-14.5 left-6 w-64.25 h-44.25 rounded-tl-[20px] rounded-tr-[20px] rounded-br-[20px] border-2 border-white overflow-hidden">
                            <img
                                src="agent.webp"
                                alt="Professional insurance agent"
                                className="w-full h-full object-cover"
                                loading="eager"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
