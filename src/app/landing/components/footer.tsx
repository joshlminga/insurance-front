import { Instagram, Linkedin, MoveUpRight, Facebook } from 'lucide-react'

const XIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
)

const TikTokIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.27 1.77-.25 1.04.17 2.14.91 2.88.74.75 1.83 1.05 2.85.86 1.08-.18 2.04-.98 2.36-2.03.11-.38.14-.77.14-1.16V0z" /></svg>
)
export const Footer = () => {
    const currentYear = new Date().getFullYear()
    return (
        <footer
            className="relative w-full overflow-hidden text-white"
            style={{ height: '830px' }}>
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
                className="absolute bottom-0 left-0 w-full -z-10"
                style={{ height: '190.75px' }}>
                <img
                    src="/fluid-dots-red.svg"
                    className="w-full h-full object-cover object-bottom"
                    alt=""
                />
            </div>
            <div className="mx-auto flex flex-col justify-between relative z-10"
                style={{
                    width: '1280px',
                    height: '635px',
                    marginTop: '90px'
                }}>
                <div className="flex flex-col items-center text-center">
                    <img src="/logo/logo.png" alt="Acentria" className="h-18 w-[228.34px] mb-8" />
                    <h2 className="text-[85px] font-bold mb-10 tracking-tight">Join Us</h2>
                    <div className="relative w-full max-w-160 border-b border-white/30 pb-4 flex items-center">
                        <input
                            type="email"
                            placeholder="Enter Your Email"
                            className="bg-transparent w-full text-xl outline-none placeholder:text-white/40 font-light"/>
                        <button className="text-white/80 hover:text-white transition-all">
                            <MoveUpRight size={28} />
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-4 w-full px-4">
                    <FooterColumn title="Company" links={['Home', 'Insights', 'Careers', 'CSR', 'ESG']} />
                    <FooterColumn title="Legal" links={['Privacy Policy', 'Cookie Policy', 'Terms & Conditions', 'Ethics & Compliance', 'Complaints']} />
                    <FooterColumn title="Services" links={['Insurance', 'Reinsurance', 'Actuarial', 'Technology', 'Investment']} />
                    <div className="space-y-6">
                        <h4 className="font-bold uppercase tracking-[0.15em]">Contact Us</h4>
                        <ul className="space-y-3 leading-relaxed">
                            <li>+254 705 200 222</li>
                            <li>info@acentriagroup.com</li>
                            <li>PO Box 5864-00100 Nairobi</li>
                            <li>West Park Towers, Westlands</li>
                        </ul>
                    </div>
                </div>
                <div className="flex justify-between items-center w-full border-t border-white/5 pt-8">
                    <div className="flex gap-6 items-center">
                        <a href="#" className="hover:text-white transition-colors"><Facebook size={18} fill="currentColor" strokeWidth={0} /></a>
                        <a href="#" className="hover:text-white transition-colors"><Instagram size={18} /></a>
                        <a href="#" className="hover:text-white transition-colors"><Linkedin size={18} fill="currentColor" strokeWidth={0} /></a>
                        <a href="#" className="hover:text-white transition-colors"><XIcon /></a>
                        <a href="#" className="hover:text-white transition-colors"><TikTokIcon /></a>
                    </div>
                    <p className=" font-bold tracking-[0.25em]">
                        © {currentYear} Acentria Group. All rights reserved.
                    </p>

                    <p className="font-bold tracking-[0.25em] cursor-pointer transition-colors">
                        Developed by Acentria Technologies
                    </p>
                </div>
            </div>
        </footer>
    )
}
const FooterColumn = ({ title, links }: { title: string, links: string[] }) => (
    <div className="space-y-6">
        <h4 className="font-bold text-base uppercase tracking-[0.15em]">{title}</h4>
        <ul className="space-y-3">
            {links.map(link => (
                <li key={link}><a href="#" className="hover:text-white transition-colors">{link}</a></li>
            ))}
        </ul>
    </div>
)