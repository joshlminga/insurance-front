/* eslint-disable @typescript-eslint/no-explicit-any */
import { Footer } from '../components/footer'
import { Button, ReuseableInput } from '@/dev/core'
import {
    Clock,
    Mail,
    MapPin,
    Phone,
} from 'lucide-react'
import Navbar from '../components/navbar'
import { UseApiMutation } from '@/hooks/hooks'
import { EMETHODS } from '@/utils/constatnts'
import { SubmitResponse } from '@/types/types'
import { ShowToast } from '@/utils/utils'
import { extractErrorMessage } from '@/utils/helpers'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SendContactUsMessageValues } from '@/types/schema'
import { ContactUsSchema } from '@/types/form-schema'
import { Separator } from '@/components/ui/separator'

export const ContactUsPage = () => {

    const form = useForm<SendContactUsMessageValues>({
        resolver: zodResolver(ContactUsSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            email: "",
            subject: "",
            message: "",
        },

    })
    const submitMutation = UseApiMutation<SubmitResponse, SendContactUsMessageValues>({
        url: ``,
        method: EMETHODS.POST,
        mutationOptions: {
            onSuccess: (data) => {
                ShowToast.success(data.message || "Submitted successfully!")
            },
            onError: (error: any) => {
                const message = extractErrorMessage(error);
                ShowToast.error(message || "Submission failed!")
            },
        },
    })
    const onSubmit = (data: SendContactUsMessageValues) => {
        submitMutation.mutate(data)
    }

    return (
        <div className="min-h-screen">
            <Navbar />
            <main>
                <div className="relative w-full h-48 sm:h-64 lg:h-80 overflow-hidden">
                    <img
                        src="/contact_us.webp"
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="eager"
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-slate-900/60 to-slate-900/40" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pt-16 sm:pt-20">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2 sm:mb-3">
                            Visit Our Office or Get in Touch
                        </h1>
                        <p className="text-white/75 max-w-xl text-sm sm:text-base leading-relaxed">
                            We'd love to meet you in person or connect virtually. Reach out online and we'll get back to you within 24 hours.
                        </p>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
                    <section className="lg:col-span-7 bg-white border border-[#EAEAEA] rounded-xl p-5 sm:p-8">
                        <h2 className="text-lg sm:text-xl font-bold text-[#111111] mb-1">Send us a Message</h2>
                        <p className="text-sm text-[#71717A] mb-5 sm:mb-6">Fill out the form below and we'll respond within 24 hours.</p>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <ReuseableInput
                                    className="w-full h-12 rounded-[5px] border border-[#ADABAB]"
                                    control={form.control}
                                    name="first_name"
                                    placeholder="Enter first name"
                                    label="First name"
                                />
                                <ReuseableInput
                                    className="w-full h-12 rounded-[5px] border border-[#ADABAB]"
                                    control={form.control}
                                    name="last_name"
                                    placeholder="Enter last name"
                                    label="Last name"
                                />
                            </div>
                            <ReuseableInput
                                className="w-full h-12 rounded-[5px] border border-[#ADABAB]"
                                control={form.control}
                                name="email"
                                placeholder="Enter email"
                                label="Email"
                            />
                            <ReuseableInput
                                className="w-full h-12 rounded-[5px] border border-[#ADABAB]"
                                control={form.control}
                                name="subject"
                                placeholder="Enter subject"
                                label="Subject"
                            />
                            <ReuseableInput
                                className="w-full rounded-[5px] border border-[#ADABAB]"
                                control={form.control}
                                name="message"
                                placeholder="Tell us about your needs or questions..."
                                label="Message"
                                type="textarea"
                                rows={4}
                            />
                            <Button
                                type="submit"
                                loading={submitMutation.isPending}
                                className="w-full bg-[#C20C0C]/80 hover:bg-[#C20C0C] h-11 rounded-lg text-sm font-semibold">
                                Send Message
                            </Button>
                        </form>
                    </section>
                    <section className="lg:col-span-5 flex flex-col gap-5 sm:gap-6">
                        <div className="border border-[#EAEAEA] rounded-xl overflow-hidden flex flex-col">
                            <div className="flex items-center gap-2 px-4 py-3 bg-[#F4F4F5] border-b border-[#EAEAEA]">
                                <span className="h-2 w-2 rounded-full bg-[#E3003B] shrink-0" />
                                <span className="text-xs font-semibold text-[#111111]">Our Office - Westpark Towers, Westlands</span>
                            </div>
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.846382754401!2d36.804493375689844!3d-1.2647045356043882!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f176afe68fe1b%3A0xf590c6d95ac4594f!2sWestpark%20Towers!5e0!3m2!1sen!2ske!4v1779365026252!5m2!1sen!2ske"
                                className="w-full h-56 sm:h-72 lg:h-80"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                        <div className="bg-white border border-[#EAEAEA] rounded-xl p-5 sm:p-6 space-y-5">
                            <h3 className="text-sm font-bold text-[#111111]">Our Offices</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div className="flex gap-2.5">
                                    <MapPin className="h-4 w-4 text-[#E3003B] shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-[#111111] mb-0.5">Address</h4>
                                        <p className="text-[#71717A] leading-relaxed">
                                            West Park Towers, Westlands<br />
                                            PO Box 5864-00100, Nairobi
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2.5">
                                    <Clock className="h-4 w-4 text-[#E3003B] shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-[#111111] mb-0.5">Business Hours</h4>
                                        <p className="text-[#71717A] leading-relaxed">
                                            Mon–Fri: 8:00 AM – 5:00 PM<br />
                                            Sat: Closed · Sun: Closed . Holidays: Closed
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2.5">
                                    <Phone className="h-4 w-4 text-[#E3003B] shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-[#111111] mb-0.5">Phone</h4>
                                        <p className="text-[#71717A]">+254 705 200 222</p>
                                    </div>
                                </div>
                                <div className="flex gap-2.5">
                                    <Mail className="h-4 w-4 text-[#E3003B] shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-[#111111] mb-0.5">Email</h4>
                                        <p className="text-[#71717A]">info@acentriagroup.com</p>
                                    </div>
                                </div>
                            </div>
                            <Separator className="border-[#E4E4E7]" />
                            <div className="space-y-2.5">
                                <h4 className="text-xs font-bold text-[#111111]">Prefer to call?</h4>
                                <div className="grid grid-cols-1 gap-y-2 gap-x-4 text-xs text-[#52525B]">
                                <Button
                                    variant="outline"
                                    className="h-10 px-4 rounded-lg border-[#E4E4E7] text-sm font-semibold text-[#111111] hover:bg-[#F4F4F5] transition-colors">
                                    Call Us
                                </Button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    )
}