
import { Facebook, Twitter, Linkedin } from 'lucide-react'

export const Footer = () => {
    return (
        <footer className="bg-slate-950 text-white py-24">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 mb-20">
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 w-[158px] h-[50px]">
                            <img src="logo.png" alt="" />
                        </div>
                        <div className="flex gap-4">
                            <a href="#" className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-red-600 transition-all border border-white/10">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-red-600 transition-all border border-white/10">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-red-600 transition-all border border-white/10">
                                <Linkedin size={20} />
                            </a>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-xl mb-8 uppercase tracking-widest text-red-600">Explore</h4>
                        <ul className="space-y-4 text-slate-300 text-sm font-medium">
                            <li><a href="#home" className="hover:text-red-500 transition-colors uppercase">Home</a></li>
                            <li><a href="#about" className="hover:text-red-500 transition-colors uppercase">About Us</a></li>
                            <li><a href="#services" className="hover:text-red-500 transition-colors uppercase">Our Services</a></li>
                            <li><a href="#contact" className="hover:text-red-500 transition-colors uppercase">Contact Us</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-xl mb-8 uppercase tracking-widest text-red-600">Services</h4>
                        <ul className="space-y-4 text-slate-300 text-sm font-medium">
                            <li><a href="#" className="hover:text-red-500 transition-colors uppercase">Risk Consulting</a></li>
                            <li><a href="#" className="hover:text-red-500 transition-colors uppercase">Reinsurance</a></li>
                            <li><a href="#" className="hover:text-red-500 transition-colors uppercase">Actuarial Services</a></li>
                            <li><a href="#" className="hover:text-red-500 transition-colors uppercase">Policy Management</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-10 py-6 border-t border-red-500 w-full justify-center items-center gap-6 text-xs font-bold uppercase tracking-widest text-center">
                    <p>© Copyright 2025 Acensure. All Rights Reserved.</p>

                    <p className="hover:text-white transition-colors">
                        Powered by Acensure Technologies
                    </p>
                </div>
            </div>
        </footer>
    )
}
