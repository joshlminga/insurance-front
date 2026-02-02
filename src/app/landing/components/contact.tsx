import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export const ContactSection = () => {
    return (
        <section id="contact" className="relative py-20 overflow-hidden">
            <div className="container mx-auto px-6 max-w-7xl justify-center items-center">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-slate-900 mb-4 uppercase tracking-wider">Contact</h2>
                    <div className="w-20 h-1 bg-red-600 mx-auto"></div>
                </div>

                <div className="flex gap-16 items-center">
                    <div className="flex-1 space-y-8">
                        <div className="flex gap-6 items-start">
                            <div className="w-[45px] h-[45px] bg-white rounded-[10px] border border-[#FF9A9A] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex items-center justify-center shrink-0">
                                <MapPin size={20} className="text-red-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-xl mb-2 uppercase tracking-wide text-slate-900">Address</h4>
                                <p className="text-slate-600">Acentria House, Westlands Avenue, Nairobi</p>
                            </div>
                        </div>

                        <div className="flex gap-6 items-start">
                            <div className="w-[45px] h-[45px] bg-white rounded-[10px] border border-[#FF9A9A] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex items-center justify-center shrink-0">
                                <Phone size={20} className="text-red-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-xl mb-2 uppercase tracking-wide text-slate-900">Phone</h4>
                                <p className="text-slate-600">+254 700 000 000 / +254 20 444 000</p>
                            </div>
                        </div>

                        <div className="flex gap-6 items-start">
                            <div className="w-[45px] h-[45px] bg-white rounded-[10px] border border-[#FF9A9A] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex items-center justify-center shrink-0">
                                <Mail size={20} className="text-red-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-xl mb-2 uppercase tracking-wide text-slate-900">Email</h4>
                                <p className="text-slate-600">info@acentriagroup.com</p>
                            </div>
                        </div>

                        <div className="flex gap-6 items-start">
                            <div className="w-[45px] h-[45px] bg-white rounded-[10px] border border-[#FF9A9A] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex items-center justify-center shrink-0">
                                <Clock size={20} className="text-red-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-xl mb-2 uppercase tracking-wide text-slate-900">Working Hours</h4>
                                <p className="text-slate-600">Mon - Fri: 8:00 AM - 5:00 PM</p>
                            </div>
                        </div>
                    </div>
                    <div className="w-full max-w-[601px] mx-auto">
                        <div className="relative rounded-[10px] border border-[#D9D9D9] shadow-[0px_4px_4px_0px_#FF9A9A] overflow-hidden">
                            <div className="absolute inset-0 z-0">
                                <img
                                    src="contact.jpg"
                                    alt="Team joined hands"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
                            </div>
                            <div className="relative z-10 p-12">
                                <form className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                                        <div className="space-y-2">
                                            <Input
                                                placeholder="Enter your name"
                                                className="h-12 bg-white/75 border border-[#D9D9D9] rounded-[10px] placeholder:text-slate-400 focus-visible:ring-red-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Input
                                                placeholder="Enter your email"
                                                type="email"
                                                className="h-12 bg-white/75 border border-[#D9D9D9] rounded-[10px] placeholder:text-slate-400 focus-visible:ring-red-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Input
                                            placeholder="What is this about?"
                                            className="h-12 bg-white/75 border border-[#D9D9D9] rounded-[10px] placeholder:text-slate-400 focus-visible:ring-red-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Textarea
                                            placeholder="How can we help you?"
                                            className="min-h-[170px] bg-white/75 border border-[#D9D9D9] rounded-[10px] placeholder:text-slate-400 focus-visible:ring-red-500 resize-none"
                                        />
                                    </div>
                                    <div className="flex justify-center pt-4">
                                        <Button className="w-[222px] h-[37px] bg-[#C20C0C] hover:bg-[#B40404] border border-[#B40404] font-bold rounded-[100px] shadow-lg transition-all hover:scale-[1.02] active:scale-95 text-sm uppercase tracking-widest text-white">
                                            Send Message
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}