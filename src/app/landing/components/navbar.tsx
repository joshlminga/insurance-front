import { cn } from "@/lib/utils";
import { ELOGO, EROUTES } from "@/utils/enums";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { UseAuth } from "@/components/auth-provider";

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
            <div className="absolute left-0 top-full mt-3 w-48 rounded-xl bg-white/80 backdrop-blur-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-999">
                <ul className="py-2">
                    {items.map((item) => (
                        <li key={item.name}>
                            <a
                                href={item.href}
                                className="block px-4 py-2 text-sm text-gray-800 hover:bg-red-500/10 hover:text-red-600 transition">
                                {item.name}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

const MobileDropdown = ({
    label,
    items,
}: {
    label: string
    items: { name: string; href: string }[]
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="w-full">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left uppercase tracking-wider text-sm font-semibold hover:text-red-500 transition py-2">
                {label}
            </button>
            {isOpen && (
                <ul className="pl-4 py-2 space-y-2">
                    {items.map((item) => (
                        <li key={item.name}>
                            <a
                                href={item.href}
                                className="block py-1 text-sm text-gray-600 hover:text-red-600 transition"
                            >
                                {item.name}
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export const Navbar = (
    {
        className = "w-full h-auto lg:h-[175px] rounded-2xl bg-white/40 backdrop-blur-[10px]",
        textStyle = "text-[#141414]",
        navTextStyle
    }: {
        className?: string,
        textStyle?: string,
        navTextStyle?: string
    }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isAuthenticated, isGeneral, logout } = UseAuth();

    const dropdownItems = {
        generateQuote: [
            { name: "Auto", href: "#" },
            { name: "Health", href: "#" },
            { name: "Property", href: "#" },
        ],
        claims: [
            { name: "File Claim", href: "#" },
            { name: "Track Claim", href: "#" },
        ],
        resources: [
            { name: "Blog", href: "#" },
            { name: "Guides", href: "#" },
        ],
        service: [
            { name: "Support", href: "#" },
            { name: "Contact Agent", href: "#" },
        ],
    };

    return (
        <nav className="absolute top-4 sm:top-[58px] left-1/2 -translate-x-1/2 z-999 w-[95vw] lg:w-[80vw]">
            <div
                className={cn(className,
                    "shadow-[0_8.45px_16.9px_rgba(0,0,0,0.12)] px-4 sm:px-[37px] flex flex-col"
                )}>
                <div className="h-[60px] lg:h-[50px] mt-4 lg:mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 w-[120px] sm:w-[158px] h-10 sm:h-[50px]">
                        <img src={ELOGO.NAVBARLOGO} alt="logo" className="h-full w-auto object-contain" />
                    </div>
                    <div className={cn(`hidden lg:flex items-center gap-6 xl:gap-10 text-sm font-semibold cursor-pointer ${textStyle}`)}>
                        <Link to={EROUTES.LANDING} className="hover:text-red-500 transition uppercase">Home</Link>
                        <Link to='#' className="hover:text-red-500 transition uppercase">About</Link>
                        <Link to='#' className="hover:text-red-500 transition uppercase">Services</Link>
                        <Link to='#' className="hover:text-red-500 transition uppercase">Contact</Link>
                        {isAuthenticated && (
                            <>
                                {isGeneral === true && (
                                    <Link to={EROUTES.DASHBOARD} className="hover:text-red-500 transition uppercase">Dashboard</Link>
                                )}
                                <button onClick={logout} className="hover:text-red-500 transition uppercase">Logout</button>
                            </>
                        )}
                    </div>
                    <button
                        className="lg:hidden p-2 hover:bg-black/5 rounded-lg transition"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu">
                        {mobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>
                <div className="hidden lg:block">
                    <div className="absolute top-[101px] left-1/2 -translate-x-1/2 w-full max-w-7xl h-px border-t border-[#F91520]" />
                    <div className="ml-4 mb-6 flex left-2/4 w-full max-w-7xl pt-6 mt-3">
                        <div className="flex gap-4 xl:gap-6 w-auto cursor-pointer flex-wrap">
                            <Dropdown
                                text="text-[#C20C0C]"
                                label="Generate Quote"
                                items={dropdownItems.generateQuote}
                            />
                            <Dropdown
                                text={navTextStyle}
                                label="Claims"
                                items={dropdownItems.claims}
                            />
                            <Dropdown
                                text={navTextStyle}
                                label="Resources"
                                items={dropdownItems.resources}
                            />
                            <Dropdown
                                text={navTextStyle}
                                label="Service"
                                items={dropdownItems.service}
                            />
                        </div>
                    </div>
                </div>
                {mobileMenuOpen && (
                    <div className="lg:hidden flex flex-col py-4 border-t border-gray-200 mt-2">
                        <div className={cn(`flex flex-col space-y-3 mb-4 ${textStyle}`)}>
                            <Link to={EROUTES.LANDING} className="hover:text-red-500 transition uppercase text-sm font-semibold py-2">Home</Link>
                            <a className="hover:text-red-500 transition uppercase text-sm font-semibold py-2 cursor-pointer">About</a>
                            <a className="hover:text-red-500 transition uppercase text-sm font-semibold py-2 cursor-pointer">Services</a>
                            <a className="hover:text-red-500 transition uppercase text-sm font-semibold py-2 cursor-pointer">Contact</a>
                            {isAuthenticated && (
                                <>
                                    {isGeneral === false && (
                                        <Link to={EROUTES.DASHBOARD} className="hover:text-red-500 transition uppercase text-sm font-semibold py-2">Dashboard</Link>
                                    )}
                                    <button onClick={logout} className="text-left hover:text-red-500 transition uppercase text-sm font-semibold py-2">Logout</button>
                                </>
                            )}
                        </div>
                        <div className="border-t border-gray-200 pt-4 space-y-2">
                            <MobileDropdown label="Generate Quote" items={dropdownItems.generateQuote} />
                            <MobileDropdown label="Claims" items={dropdownItems.claims} />
                            <MobileDropdown label="Resources" items={dropdownItems.resources} />
                            <MobileDropdown label="Service" items={dropdownItems.service} />
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
