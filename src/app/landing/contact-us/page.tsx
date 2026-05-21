import { Footer } from '../components/footer'
import { Button } from '@/dev/core'
import { 
    Car, 
    ChevronDown, 
    Clock, 
    Coffee, 
    Mail, 
    MapPin, 
    Phone, 
    ShieldAlert, 
    Wifi 
} from 'lucide-react'
import Navbar from '../components/navbar'

export const ContactUsPage = () => {
    return (
        <div className="min-h-screen">
           <Navbar />
            <main>
                <div className="relative mx-auto min-h-70 h-[78vh] sm:h-[85vh] lg:h-80 w-full overflow-hidden">
                    <div className="absolute inset-0 -z-10">
                        <img src="/contact_us.webp" alt="" className="h-full w-full object-cover" loading="eager" />
                        <div className="absolute inset-0 bg-linear-to-r from-slate-900/60 to-slate-900/40" />
                    </div>
                </div>
                <header className="max-w-4xl mx-auto text-center pt-16 pb-12 px-4">
                    <h1 className="text-4xl font-bold tracking-tight text-[#111111] mb-3">
                        Visit Our Office or Get in Touch
                    </h1>
                    <p className="text-[#666666] max-w-2xl mx-auto text-base leading-relaxed">
                        We'd love to meet you in person or connect virtually. Find us at our San Francisco office or reach out online.
                    </p>
                </header>
                <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 pb-24">
                    <section className="lg:col-span-7 bg-white border border-[#EAEAEA] rounded-sm p-8 shadow-sm">
                        <h2 className="text-xl font-bold text-[#111111] mb-1">Send us a Message</h2>
                        <p className="text-sm text-[#71717A] mb-6">Fill out the form below and we'll respond within 24 hours.</p>

                        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label htmlFor="firstName" className="text-sm font-semibold text-[#111111]">First name</label>
                                    <input
                                        type="text" id="firstName" placeholder="John"
                                        className="w-full text-sm border border-[#E4E4E7] rounded px-3 py-2 placeholder-[#A1A1AA] focus:outline-none focus:ring-1 focus:ring-black"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="lastName" className="text-sm font-semibold text-[#111111]">Last name</label>
                                    <input
                                        type="text" id="lastName" placeholder="Doe"
                                        className="w-full text-sm border border-[#E4E4E7] rounded px-3 py-2 placeholder-[#A1A1AA] focus:outline-none focus:ring-1 focus:ring-black"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="email" className="text-sm font-semibold text-[#111111]">Email</label>
                                <input
                                    type="email" id="email" placeholder="john@example.com"
                                    className="w-full text-sm border border-[#E4E4E7] rounded px-3 py-2 placeholder-[#A1A1AA] focus:outline-none focus:ring-1 focus:ring-black"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="phone" className="text-sm font-semibold text-[#111111]">Phone</label>
                                <input
                                    type="tel" id="phone" placeholder="+1 (555) 123-4567"
                                    className="w-full text-sm border border-[#E4E4E7] rounded px-3 py-2 placeholder-[#A1A1AA] focus:outline-none focus:ring-1 focus:ring-black"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label htmlFor="visitType" className="text-sm font-semibold text-[#111111]">Visit Type</label>
                                    <div className="relative">
                                        <select
                                            id="visitType"
                                            className="w-full text-sm border border-[#E4E4E7] rounded px-3 py-2 appearance-none bg-white text-[#71717A] focus:outline-none focus:ring-1 focus:ring-black"
                                        >
                                            <option value="">Select visit type</option>
                                            <option value="consultation">Consultation</option>
                                            <option value="support">Support</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-[#A1A1AA] pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="company" className="text-sm font-semibold text-[#111111]">Company</label>
                                    <input
                                        type="text" id="company" placeholder="Your company name"
                                        className="w-full text-sm border border-[#E4E4E7] rounded px-3 py-2 placeholder-[#A1A1AA] focus:outline-none focus:ring-1 focus:ring-black"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="message" className="text-sm font-semibold text-[#111111]">Message</label>
                                <textarea
                                    id="message" rows={4} placeholder="Tell us about your needs or questions..."
                                    className="w-full text-sm border border-[#E4E4E7] rounded px-3 py-2 placeholder-[#A1A1AA] focus:outline-none focus:ring-1 focus:ring-black resize-y"
                                />
                            </div>
                            <Button 
                            variant='default'
                            className='w-full bg-[#000000] text-white text-sm font-medium py-2.5 rounded transition-colors mt-2'>
                                Send Message
                            </Button>
                        </form>
                    </section>

                    <section className="lg:col-span-5 space-y-6">
                        <div className="bg-[#F4F4F5] border border-[#EAEAEA] rounded-sm p-6 relative min-h-[380px] flex flex-col justify-between">
                            <div>
                                <span className="inline-flex items-center gap-1.5 bg-white border border-[#E4E4E7] text-xs font-semibold px-3 py-1.5 rounded shadow-sm text-[#111111]">
                                    <span className="h-2 w-2 rounded-full bg-[#E3003B]"></span>
                                    Our Office
                                </span>
                            </div>

                            <div className="flex flex-col items-center justify-center text-center my-auto">
                                <div className="h-12 w-12 rounded-full bg-white shadow-md flex items-center justify-center mb-3">
                                    <MapPin className="h-6 w-6 text-[#E3003B]" fill="#E3003B" fillOpacity={0.1} />
                                </div>
                                <h3 className="text-sm font-bold text-[#111111] mb-1">Interactive Map</h3>
                                <p className="text-xs text-[#71717A]">123 Business Ave, San Francisco, CA 94105</p>
                            </div>
                        </div>
                        <div className="bg-white border border-[#EAEAEA] rounded-sm p-6 shadow-sm space-y-6">
                            <h3 className="text-sm font-bold text-[#111111]">Office Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
                                <div className="flex gap-2.5">
                                    <MapPin className="h-4 w-4 text-[#E3003B] shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-[#111111] mb-0.5">Address</h4>
                                        <p className="text-[#71717A] leading-relaxed">
                                            123 Business Ave, Suite 100<br />
                                            San Francisco, CA 94105, United States
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2.5">
                                    <Clock className="h-4 w-4 text-[#E3003B] shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-[#111111] mb-0.5">Business Hours</h4>
                                        <p className="text-[#71717A] leading-relaxed">
                                            Mon-Fri: 9:00 AM - 6:00 PM<br />
                                            Sat: 10:00 AM - 4:00 PM • Sun: Closed
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2.5">
                                    <Phone className="h-4 w-4 text-[#E3003B] shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-[#111111] mb-0.5">Phone</h4>
                                        <p className="text-[#71717A]">+1 (555) 123-4567</p>
                                    </div>
                                </div>
                                <div className="flex gap-2.5">
                                    <Mail className="h-4 w-4 text-[#E3003B] shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-[#111111] mb-0.5">Email</h4>
                                        <p className="text-[#71717A]">hello@company.com</p>
                                    </div>
                                </div>
                            </div>
                            <hr className="border-[#E4E4E7]" />
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-[#111111]">Office Amenities</h4>
                                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-[#52525B]">
                                    <div className="flex items-center gap-2">
                                        <Car className="h-3.5 w-3.5 text-[#E3003B]" />
                                        <span>Free Parking</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Wifi className="h-3.5 w-3.5 text-[#E3003B]" />
                                        <span>Free WiFi</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Coffee className="h-3.5 w-3.5 text-[#E3003B]" />
                                        <span>Refreshments</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ShieldAlert className="h-3.5 w-3.5 text-[#E3003B]" />
                                        <span>Secure Access</span>
                                    </div>
                                </div>
                            </div>
                            <hr className="border-[#E4E4E7]" />
                            <p className="text-[11px] text-[#71717A]">
                                <span className="font-bold text-[#111111]">Visitor Info:</span> Please bring a valid ID and check in at reception.
                            </p>
                        </div>
                    </section>
                </main>
            </main>
            <Footer />
        </div>
    )
}