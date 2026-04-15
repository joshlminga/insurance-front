import React from 'react'

export const FaqsPage: React.FC = () => {
    return (
        <section id="faqs" className="bg-[#FFFFF] py-14 relative overflow-hidden">
            <div className="max-w-360.75 mx-auto px-30 flex justify-between items-start">
                <div className="max-w-155 relative z-10">

                    <p className="text-[32px] font-semibold uppercase text-[#D11F3E] mb-2">
                        FAQS
                    </p>

                    <h2 className="text-[36px] font-bold text-black mb-10">
                        Frequently Asked Questions
                    </h2>

                    <div className="space-y-4">
                        <FaqItem text="How long does a claim take to process?" />
                        <FaqItem text="How quickly can I get covered?" />
                        <FaqItem text="Can I change or cancel my policy?" />
                        <FaqItem text="Can I cover my whole family under one plan?" />
                    </div>
                </div>
                <div className="relative w-130 h-115">

                    <div className="absolute right-27.5 top-0 w-85.25 h-108 bg-[#EE2527] clip-main"></div>

                    <div className="absolute right-0 top-0 w-46.25 h-61.25 bg-[#BE2332] clip-top"></div>

                    <div className="absolute right-2.5 bottom-0 w-53.5 h-25 bg-[#BE2332] clip-bottom"></div>

                    <img
                        src="/faqimage.png"
                        alt="faq"
                        className="absolute right-13.75 top-17.5 w-62.5 h-65 object-cover z-10 grayscale"
                    />
                </div>
            </div>

            <div className="absolute bottom-5 left-0 w- h-30 dotted-fade">
                <img
                    src="/fluid-dots-red.svg"
                    className="w-full h-full object-cover object-bottom"
                    alt=""
                />
            </div>
        </section>
    )
}


const FaqItem = ({ text }: { text: string }) => {
    return (
        <div className="flex items-center justify-between border border-gray-300 rounded-[10px] px-4 py-3 bg-white">

            <div className="flex items-center gap-4">
                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100">
                    <span className="text-[#D11F3E] text-3xl font-extrabold">{'>'}</span>
                </div>

                <p className="text-[14px] text-black">
                    {text}
                </p>
            </div>

            <span className="text-[#D11F3E] text-xl font-semibold">+</span>
        </div>
    )
}