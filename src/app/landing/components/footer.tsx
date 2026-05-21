import { MoveUpRight } from 'lucide-react'
import { ImFacebook2, ImLinkedin } from "react-icons/im";
import { SlSocialInstagram } from "react-icons/sl";
import { SiTiktok } from "react-icons/si";
import { BsTwitterX } from "react-icons/bs";

export const Footer = () => {
    const currentYear = new Date().getFullYear()
    return (
        <footer
            className="relative w-full overflow-hidden text-white min-h-175 sm:min-h-195 lg:min-h-207.5">
            <div className="absolute inset-0 -z-30">
                <img src="/footer.webp" alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 -z-20"
                style={{
                    background: `
                        linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #000000 100%),
                        linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 100%)`
                }}
            />
            <div
                className="absolute bottom-0 left-0 w-full -z-10 h-24 sm:h-36 lg:h-[190.75px]">
                <img
                    src="/fluid-dots-red.svg"
                    className="w-full h-full object-cover object-bottom"
                    alt=""
                />
            </div>
            <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-4 flex flex-col justify-between relative z-10 pt-14 sm:pt-18 lg:pt-22.5 pb-8 min-h-[inherit]">
                <div className="flex flex-col items-center text-center">
                    <img src="/logo/logo.png" alt="Acentria" className="h-12 sm:h-14 lg:h-18 w-auto mb-6 sm:mb-8" />
                    <h2 className="text-[42px] sm:text-[60px] lg:text-[85px] font-bold mb-6 sm:mb-10 tracking-tight">Join Us</h2>
                    <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-160 border-b border-white/30 pb-4 flex items-center">
                        <input
                            type="email"
                            placeholder="Enter Your Email"
                            className="bg-transparent w-full text-base sm:text-lg lg:text-xl outline-none placeholder:text-white/40 font-light"/>
                        <button className="text-white/80 hover:text-white transition-all">
                            <MoveUpRight size={24} />
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 lg:gap-4 w-full mt-10 lg:mt-0">
                    <FooterColumn title="Company" links={['Home', 'Insights', 'Careers', 'CSR', 'ESG']} />
                    <FooterColumn title="Legal" links={['Privacy Policy', 'Cookie Policy', 'Terms & Conditions', 'Ethics & Compliance', 'Complaints']} />
                    <FooterColumn title="Services" links={['Insurance', 'Reinsurance', 'Actuarial', 'Technology', 'Investment']} />
                    <div className="space-y-4 sm:space-y-6">
                        <h4 className="font-bold text-sm sm:text-base uppercase tracking-[0.15em]">Contact Us</h4>
                        <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base leading-relaxed">
                            <li>+254 705 200 222</li>
                            <li>info@acentriagroup.com</li>
                            <li>PO Box 5864-00100 Nairobi</li>
                            <li>West Park Towers, Westlands</li>
                        </ul>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 sm:gap-0 w-full border-t border-white/5 pt-6 sm:pt-8 mt-8 lg:mt-0">
                    <div className="flex gap-5 sm:gap-6 items-center">
                        <a href="#" className="hover:text-white transition-colors"><ImFacebook2 size={18} fill="currentColor" strokeWidth={0} /></a>
                        <a href="#" className="hover:text-white transition-colors"><SlSocialInstagram size={18} /></a>
                        <a href="#" className="hover:text-white transition-colors"><ImLinkedin size={18} fill="currentColor" strokeWidth={0} /></a>
                        <a href="#" className="hover:text-white transition-colors"><BsTwitterX /></a>
                        <a href="#" className="hover:text-white transition-colors"><SiTiktok /></a>
                    </div>
                    <p className="text-xs sm:text-sm font-bold tracking-[0.15em] sm:tracking-[0.25em] text-center">
                        &copy; {currentYear} Acentria Group. All rights reserved.
                    </p>

                    <p className="text-xs sm:text-sm font-bold tracking-[0.15em] sm:tracking-[0.25em] cursor-pointer transition-colors text-center">
                        Developed by Acentria Technologies
                    </p>
                </div>
            </div>
        </footer>
    )
}
const FooterColumn = ({ title, links }: { title: string, links: string[] }) => (
    <div className="space-y-4 sm:space-y-6">
        <h4 className="font-bold text-sm sm:text-base uppercase tracking-[0.15em]">{title}</h4>
        <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base">
            {links.map(link => (
                <li key={link}><a href="#" className="hover:text-white transition-colors">{link}</a></li>
            ))}
        </ul>
    </div>
)