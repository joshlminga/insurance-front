import { cn } from "@/lib/utils";
import { ELOGO, EPREFIX, EROUTES } from "@/utils/enums";
import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { UseAuth } from "@/components/auth-provider";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

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
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        "uppercase tracking-wider text-sm font-semibold hover:text-red-500 transition inline-flex items-center gap-1",
                        text
                    )}
                    aria-haspopup="true"
                    aria-expanded="false">
                    {label}
                    <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="min-w-48 rounded-xl border border-gray-200/80 bg-white py-2 shadow-xl shadow-black/5 backdrop-blur-sm"
                sideOffset={8}>
                {items.map((item) => (
                    <DropdownMenuItem key={item.name} asChild>
                        <a
                            href={item.href}
                            className="block w-full cursor-pointer px-4 py-2.5 text-sm text-gray-700 outline-none focus:bg-red-500/10 focus:text-red-600 hover:bg-red-500/10 hover:text-red-600">
                            {item.name}
                        </a>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const MobileDropdown = ({
    label,
    items,
    textStyle = "text-[#141414]",
}: {
    label: string
    items: { name: string; href: string }[]
    textStyle?: string
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="w-full border-b border-gray-200/60 last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex w-full items-center justify-between py-3 text-left uppercase tracking-wider text-sm font-semibold transition",
                    textStyle,
                    "hover:text-red-500"
                )}
                aria-expanded={isOpen}>
                {label}
                <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
            </button>
            {isOpen && (
                <ul className="space-y-0.5 border-t border-gray-100 bg-gray-50/80 pb-3 pt-2">
                    {items.map((item) => (
                        <li key={item.name}>
                            <Link
                                to={item.href}
                                className="block px-4 py-2.5 text-sm text-gray-600 transition hover:bg-red-500/5 hover:text-red-600">
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export const Navbar = (
    {
        className = "w-full h-auto lg:h-43.75 rounded-2xl bg-white/40 backdrop-blur-[10px]",
        textStyle = "text-[#141414]",
        navTextStyle
    }: {
        className?: string,
        textStyle?: string,
        navTextStyle?: string
    }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isAuthenticated } = UseAuth();
    const dropdownItems = {
        generateQuote: [
            { name: "Motor Insurance", href: `/${EPREFIX.CUSTOMER}${EROUTES.MOTOR}` },
            { name: "Travel Insurance", href: `/${EPREFIX.CUSTOMER}${EROUTES.TRAVEL}` },
            { name: "Marine Insurance", href: `/${EPREFIX.CUSTOMER}${EROUTES.MARINE}` },
            { name: "Life Insurance", href: `/${EPREFIX.CUSTOMER}${EROUTES.LIFE}` },
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
        <nav className="absolute top-4 sm:top-14.5 left-1/2 -translate-x-1/2 z-50 w-[95vw] lg:w-[80vw]">
            <div
                className={cn(className,
                    "shadow-[0_8.45px_16.9px_rgba(0,0,0,0.12)] px-4 sm:px-9.25 flex flex-col"
                )}>
                <div className="h-15 lg:h-12.5 mt-4 lg:mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 w-30 sm:w-39.5 h-10 sm:h-12.5">
                        <img src={ELOGO.NAVBARLOGO} alt="logo" className="h-full w-auto object-contain" />
                    </div>
                    <div className={cn(`hidden lg:flex items-center gap-6 xl:gap-10 text-sm font-semibold cursor-pointer ${textStyle}`)}>
                        <Link to={EROUTES.LANDING} className="hover:text-red-500 transition uppercase text-sm font-semibold py-2">Home</Link>
                        <a className="hover:text-red-500 transition uppercase text-sm font-semibold py-2 cursor-pointer">News</a>
                        <a className="hover:text-red-500 transition uppercase text-sm font-semibold py-2 cursor-pointer">Careers</a>
                        <a className="hover:text-red-500 transition uppercase text-sm font-semibold py-2 cursor-pointer">Contact</a>
                        {isAuthenticated && (
                            <>
                                {/* {isGeneral === true && (
                                    <Link to={EROUTES.DASHBOARD} className="hover:text-red-500 transition uppercase">Dashboard</Link>
                                )} */}
                                {/* <button onClick={logout} className="hover:text-red-500 transition uppercase">Logout</button> */}
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
                    <div className="absolute top-25.25 left-1/2 -translate-x-1/2 w-full h-px border-t border-[#F91520]" />
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
                            <a className="hover:text-red-500 transition uppercase text-sm font-semibold py-2 cursor-pointer">News</a>
                            <a className="hover:text-red-500 transition uppercase text-sm font-semibold py-2 cursor-pointer">Careers</a>
                            <a className="hover:text-red-500 transition uppercase text-sm font-semibold py-2 cursor-pointer">Contact</a>
                            {isAuthenticated && (
                                <>
                                    {/* {isGeneral === false && (
                                        <Link to={EROUTES.DASHBOARD} className="hover:text-red-500 transition uppercase text-sm font-semibold py-2">Dashboard</Link>
                                    )} */}
                                    {/* <button onClick={logout} className="text-left hover:text-red-500 transition uppercase text-sm font-semibold py-2">Logout</button> */}
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
