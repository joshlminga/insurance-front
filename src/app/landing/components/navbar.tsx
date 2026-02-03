import { cn } from "@/lib/utils";
import { ELOGO, EROUTES } from "@/utils/enums";
import { Link } from "react-router-dom";

const Dropdown = ({
    label,
    items,
    text = "text-white/90"
}: {
    label: string
    items: { name: string; href: string }[],
    text?: string
}) => {
    return (
        <div className="relative group">
            <button className={`uppercase tracking-wider text-sm font-semibold hover:text-red-500 transition ${text}`}>
                {label}
            </button>
            <div className="absolute left-0 top-full mt-3 w-48 rounded-xl bg-white/80 backdrop-blur-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <ul className="py-2">
                    {items.map((item) => (
                        <li key={item.name}>
                            <a
                                href={item.href}
                                className="block px-4 py-2 text-sm text-gray-800 hover:bg-red-500/10 hover:text-red-600 transition"
                            >
                                {item.name}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export const Navbar = (
    {
        className = "w-full h-[175px] rounded-2xl bg-white/40 backdrop-blur-[10px]",
        textStyle = "text-[#141414]",
        navTextStyle
    }: {
        className?: string,
        textStyle?: string,
        navTextStyle?: string
    }) => {
    return (
        <nav className="absolute top-[58px] left-1/2 -translate-x-1/2 z-50 w-[80vw]">
            <div
                className={cn(className,
                    "shadow-[0_8.45px_16.9px_rgba(0,0,0,0.12)] px-[37px] flex flex-col"
                )}>
                <div className="h-[50px] mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 w-[158px] h-[50px]">
                        <img src={ELOGO.NAVBARLOGO} alt="logo" />
                    </div>
                    <div className={cn(`flex items-center gap-10 text-sm font-semibold cursor-pointer ${textStyle}`)}>
                        <Link to={EROUTES.LANDING} className="hover:text-red-500 transition uppercase">Home</Link>
                        <a className="hover:text-red-500 transition uppercase">About</a>
                        <a className="hover:text-red-500 transition uppercase">Services</a>
                        <a className="hover:text-red-500 transition uppercase">Contact</a>
                    </div>
                </div>
                <div className="absolute top-[101px] left-1/2 -translate-x-1/2 w-7xl h-px border-t border-[#F91520]" />
                <div className="mt-auto mb-6 flex justify-center">
                    <div className="flex gap-6 w-[460px] cursor-pointer">
                        <Dropdown
                            text="text-[#C20C0C]"
                            label="Generate Quote"
                            items={[
                                { name: "Auto", href: "#" },
                                { name: "Health", href: "#" },
                                { name: "Property", href: "#" },
                            ]}
                        />
                        <Dropdown
                            text={navTextStyle}
                            label="Claims"
                            items={[
                                { name: "File Claim", href: "#" },
                                { name: "Track Claim", href: "#" },
                            ]}
                        />
                        <Dropdown
                            text={navTextStyle}
                            label="Resources"
                            items={[
                                { name: "Blog", href: "#" },
                                { name: "Guides", href: "#" },
                            ]}
                        />
                        <Dropdown
                            text={navTextStyle}
                            label="Service"
                            items={[
                                { name: "Support", href: "#" },
                                { name: "Contact Agent", href: "#" },
                            ]}
                        />
                    </div>
                </div>
            </div>
        </nav>
    )
}
