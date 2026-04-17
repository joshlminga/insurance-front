import React from "react"

export const FaqsPage: React.FC = () => {
  return (
    <section id="faqs" className="bg-[#FFFFFF] py-10 sm:py-14 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row gap-8 lg:gap-10 justify-between items-start">

        <div className="flex-1 relative z-10 w-full">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#D11F3E] mb-2">
            FAQs
          </p>
          <h2 className="text-[28px] sm:text-[32px] lg:text-[36px] font-bold text-black mb-8 sm:mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3 sm:space-y-4">
            <FaqItem text="How long does a claim take to process?" />
            <FaqItem text="How quickly can I get covered?" />
            <FaqItem text="Can I change or cancel my policy?" />
            <FaqItem text="Can I cover my whole family under one plan?" />
          </div>
        </div>

        <div className="relative w-full sm:w-[80%] sm:mx-auto lg:mx-0 lg:w-125 h-72 sm:h-90 lg:h-112.5 shrink-0 overflow-hidden">
          <div className="absolute left-0 top-0 w-48 sm:w-60 lg:w-75 h-full bg-[#EE2527] z-3"
            style={{ clipPath: "polygon(60% 0%, 100% 0%, 40% 100%, 0% 100%)" }}
          />
          <div className="absolute left-20 sm:left-24 lg:left-32 top-16 sm:top-22 lg:top-30 w-44 sm:w-56 lg:w-70 h-52 sm:h-66 lg:h-82 z-1">
            <img
              src="/faqimage.png"
              alt="Family walking together"
              className="w-full h-full object-cover grayscale opacity-90"
            />
          </div>
          <div className="absolute left-28 sm:left-36 lg:left-45 top-0 w-44 sm:w-52 lg:w-67 h-44 sm:h-56 lg:h-70 bg-[#BE2332] z-2"
            style={{ clipPath: "polygon(0% 0%, 50% 0%, 100% 100%, 45% 100%)" }}
          />
          <div className="absolute right-4 sm:right-8 lg:right-12 bottom-1 w-36 sm:w-48 lg:w-60 h-18 sm:h-22 lg:h-27.5 bg-[#BE2332] z-3"
           style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 25% 100%)" }}
          />
        </div>
      </div>
    </section>
  )
}

const FaqItem = ({ text }: { text: string }) => {
  return (
    <div className="flex items-center justify-between border border-gray-200 rounded-[10px] px-4 py-3 bg-white shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 shrink-0">
          <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
            <path
              d="M1.5 1L6.5 6L1.5 11"
              stroke="#D11F3E"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-sm text-black">{text}</p>
      </div>
      <span className="text-[#D11F3E] text-xl font-semibold shrink-0 ml-4">+</span>
    </div>
  )
}
