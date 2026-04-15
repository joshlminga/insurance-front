import React from 'react'

export const FaqsPage = () => {
    return (
        <section id="faqs" className="bg-[#F5F3EF] py-20">
            <div className="max-w-360.75 mx-auto px-30 flex justify-between items-start">

                {/* LEFT SIDE */}
                <div className="max-w-150">

                    {/* Label */}
                    <p className="text-[32px] font-semibold uppercase text-[#D11F3E] mb-2">
                        FAQ’s
                    </p>

                    {/* Title */}
                    <h2 className="text-[36px] font-bold text-black leading-[100%] mb-4">
                        File a Claim
                    </h2>

                    {/* Description */}
                    <p className="text-[14px] text-gray-600 mb-10">
                        We believe claims should be settled fast and fairly. Our digital process
                        ensures you're never left waiting.
                    </p>

                    {/* Steps */}
                    <div className="relative">

                        {/* Vertical line */}
                        <div className="absolute left-3.5 top-0 bottom-0 w-px bg-gray-300"></div>

                        <div className="space-y-8">

                            <Step
                                number="01"
                                title="Report the Incident"
                                description="Notify us online, via app or call our 24/7 hotline within 48 hours"
                            />

                            <Step
                                number="02"
                                title="Submit Documentation"
                                description="Upload photos, receipts or reports through our secure portal."
                            />

                            <Step
                                number="03"
                                title="Track in Real Time"
                                description="Follow your claim status in real time via app or SMS updates."
                            />

                            <Step
                                number="04"
                                title="Receive Your Payout"
                                description="Approved claims paid within 5 days to M-Pesa or bank account."
                            />

                        </div>
                    </div>
                </div>

                {/* RIGHT CARD */}
                <div className="w-122.25 h-84.25 rounded-[20px] border border-[#B7B7B9] bg-white/10 p-8">

                    <h3 className="text-[32px] font-semibold mb-3 text-black">
                        Ready to file your claims?
                    </h3>

                    <p className="text-[14px] text-gray-600 mb-6">
                        Our team is at hand to guide you through every step from submission to payout
                    </p>

                    {/* Status */}
                    <div className="flex items-center gap-2 mb-6 border border-gray-300 text-gray-600 text-[15px] px-5 py-2 rounded-lg max-w-58">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <p className="text-[15px] text-gray-600">
                            Live support available now
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button className="bg-[#D11F3E] text-white text-[15px] px-5 py-2 rounded-lg">
                            Start Online Claim
                        </button>

                        <button className="border border-gray-300 text-gray-600 text-[15px] px-5 py-2 rounded-lg">
                            Call Claims Team
                        </button>
                    </div>

                </div>

            </div>
        </section>
    )
}

/* Step Component */
const Step = ({
    number,
    title,
    description,
}: {
    number: string
    title: string
    description: string
}) => {
    return (
        <div className="flex gap-4 relative">

            {/* Number Circle */}
            <div className="z-10 flex items-center justify-center w-[28px] h-[28px] rounded-full border border-[#D11F3E] text-[10px] text-[#D11F3E] bg-white">
                {number}
            </div>

            {/* Text */}
            <div>
                <h4 className="text-[14px] font-semibold text-black">
                    {title}
                </h4>
                <p className="text-[13px] text-gray-600">
                    {description}
                </p>
            </div>
        </div>
    )
}