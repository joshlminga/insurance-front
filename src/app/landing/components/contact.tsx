import React from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export const ContactSection = () => {
    return (
        <section id="contact" className="relative py-32 overflow-hidden">
            {/* Background with overlay */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2069&auto=format&fit=crop" 
                    alt="Team joined hands" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0  backdrop-blur-[2px]"></div>
            </div>
            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="text-white">
                        <h2 className="text-4xl md:text-6xl font-bold mb-8 uppercase tracking-wider">Get in Touch</h2>
                        <p className="text-slate-200 text-lg mb-12 leading-relaxed max-w-lg">
                            Whether you're looking to capitalize on new opportunities, enhance financial performance, 
                            or embrace digital transformation, we are here to guide you every step of the way.
                        </p>
                        
                        <div className="space-y-8">
                            <div className="flex gap-6 items-start">
                                <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                                    <MapPin size={26} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xl mb-1 uppercase tracking-wide">Address</h4>
                                    <p className="text-slate-300">Acentria House, Westlands Avenue, Nairobi</p>
                                </div>
                            </div>
                            <div className="flex gap-6 items-start">
                                <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                                    <Phone size={26} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xl mb-1 uppercase tracking-wide">Phone</h4>
                                    <p className="text-slate-300">+254 700 000 000 / +254 20 444 000</p>
                                </div>
                            </div>
                            <div className="flex gap-6 items-start">
                                <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                                    <Mail size={26} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xl mb-1 uppercase tracking-wide">Email</h4>
                                    <p className="text-slate-300">info@acentriagroup.com</p>
                                </div>
                            </div>
                            <div className="flex gap-6 items-start">
                                <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                                    <Clock size={26} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xl mb-1 uppercase tracking-wide">Working Hours</h4>
                                    <p className="text-slate-300">Mon - Fri: 8:00 AM - 5:00 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/20 shadow-2xl">
                        <form className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-white uppercase tracking-widest pl-1">Full Name</label>
                                <Input placeholder="Enter your name" className="bg-white/10 border-white/20 h-14 text-white placeholder:text-slate-400 focus-visible:ring-red-500 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-white uppercase tracking-widest pl-1">Email Address</label>
                                <Input placeholder="Enter your email" type="email" className="bg-white/10 border-white/20 h-14 text-white placeholder:text-slate-400 focus-visible:ring-red-500 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-white uppercase tracking-widest pl-1">Subject</label>
                                <Input placeholder="What is this about?" className="bg-white/10 border-white/20 h-14 text-white placeholder:text-slate-400 focus-visible:ring-red-500 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-white uppercase tracking-widest pl-1">Message</label>
                                <Textarea placeholder="How can we help you?" className="bg-white/10 border-white/20 min-h-[150px] text-white placeholder:text-slate-400 focus-visible:ring-red-500 rounded-2xl" />
                            </div>
                            <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold h-16 rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 text-lg uppercase tracking-widest">
                                Send Message
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    )
}
