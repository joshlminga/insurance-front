import React from 'react'
import { Facebook, Twitter, Instagram, Linkedin, Send } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export const Footer = () => {
    return (
        <footer className="bg-slate-950 text-white py-24">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                    <div className="space-y-8">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-red-600 rounded-md flex items-center justify-center">
                                <span className="text-white font-bold text-xl italic">A</span>
                            </div>
                            <span className="text-xl font-extrabold tracking-tight uppercase">Accenture</span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                            Professional insurance and consulting services for a complex world. We protect what matters most to you.
                        </p>
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
                    
                    <div>
                        <h4 className="font-bold text-xl mb-8 uppercase tracking-widest text-red-600">Subscribe</h4>
                        <p className="text-slate-400 text-sm mb-8">
                            Subscribe to get latest updates and insurance tips.
                        </p>
                        <div className="relative group">
                            <Input placeholder="Email Address" className="bg-white/5 border-white/10 h-14 pr-16 text-white placeholder:text-slate-500 focus-visible:ring-red-500 rounded-xl" />
                            <Button className="absolute right-1 top-1 bottom-1 bg-red-600 hover:bg-red-700 w-12 shrink-0 p-0 rounded-lg">
                                <Send size={18} />
                            </Button>
                        </div>
                    </div>
                </div>
                
                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-xs font-bold uppercase tracking-widest">
                    <p>© 2026 Accenture Consulting. All rights reserved.</p>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
