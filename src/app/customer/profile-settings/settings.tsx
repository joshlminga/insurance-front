import { Button, ReuseableInput } from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import { CustomerDetailsSchema } from '@/types/form-schema'
import { CustomerFormValues } from '@/types/schema'
import { SubmitResponse } from '@/types/types'
import { EMETHODS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

export const AccountSettingsPage = () => {
    const [show, setShow] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showNewConfirm, setShowNewConfirm] = useState(false);

    const form = useForm<CustomerFormValues>({
        resolver: zodResolver(CustomerDetailsSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
        },

    })
    const pass_form = useForm<CustomerFormValues>({
        resolver: zodResolver(CustomerDetailsSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
        },
    })
    const submitMutation = UseApiMutation<SubmitResponse, CustomerFormValues>({
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
    const onSubmit = (data: CustomerFormValues) => {
        submitMutation.mutate(data)
    }

    const submitPasswordMutation = UseApiMutation<SubmitResponse, CustomerFormValues>({
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
    const onSubmitPassword = (data: CustomerFormValues) => {
        submitPasswordMutation.mutate(data)
    }

    return (
        <section className="">
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 '>
                <div className='lg:col-span-6 bg-white border border-[#EAEAEA] rounded-xl p-5 sm:p-8'>
                    <h2 className="text-lg sm:text-xl font-bold text-[#111111] mb-1">Profile Settings</h2>
                    <p className="text-sm text-[#71717A] mb-5 sm:mb-6">Update your profile information at any time.</p>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
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
                            type='email'
                            placeholder="Enter email"
                            label="Email"
                        />
                        <ReuseableInput
                            className="w-full h-12 rounded-[5px] border border-[#ADABAB]"
                            control={form.control}
                            name="phone"
                            type='tel'
                            placeholder="Enter phone number"
                            label="Phone Number"
                        />
                        <Button
                            type="submit"
                            loading={submitMutation.isPending}
                            className="w-full bg-[#C20C0C]/80 hover:bg-[#C20C0C] h-11 rounded-lg text-sm font-semibold">
                            Update Profile
                        </Button>
                    </form>
                </div>

                <div className='lg:col-span-6 bg-white border border-[#EAEAEA] rounded-xl p-5 sm:p-8'>
                    <h2 className="text-lg sm:text-xl font-bold text-[#111111] mb-1">Security Settings</h2>
                    <p className="text-sm text-[#71717A] mb-5 sm:mb-6">Update your security preferences at any time.</p>
                    <form onSubmit={pass_form.handleSubmit(onSubmitPassword)} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                            <div className="relative items-center justify-center">
                                <ReuseableInput
                                    className="w-full h-12.75 rounded-[5px] border border-[#ADABAB] pr-10"
                                    control={form.control}
                                    name="old_password"
                                    label="Old Password"
                                    type={show ? "text" : "password"}
                                    placeholder="Enter your old password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShow(!show)}
                                    className="absolute right-3 top-3/5 -translate-y-1/10 text-gray-500 hover:text-gray-700"
                                    aria-label={show ? "Hide password" : "Show password"}>
                                    {show ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <div className="relative items-center justify-center">
                                <ReuseableInput
                                    className="w-full h-12.75 rounded-[5px] border border-[#ADABAB] pr-10"
                                    control={form.control}
                                    name="new_password"
                                    label="New Password"
                                    type={showNewConfirm ? "text" : "password"}
                                    placeholder="Enter your new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewConfirm(!showNewConfirm)}
                                    className="absolute right-3 top-3/5 -translate-y-1/10 text-gray-500 hover:text-gray-700"
                                    aria-label={showNewConfirm ? "Hide password" : "Show password"}>
                                    {showNewConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <div className="relative items-center justify-center">
                                <ReuseableInput
                                    className="w-full h-12.75 rounded-[5px] border border-[#ADABAB] pr-10"
                                    control={form.control}
                                    name="confirm_password"
                                    label="Confirm Password"
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="Confirm your new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-3/5 -translate-y-1/10 text-gray-500 hover:text-gray-700"
                                    aria-label={showConfirm ? "Hide password" : "Show password"}>
                                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            loading={submitPasswordMutation.isPending}
                            className="w-full bg-[#C20C0C]/80 hover:bg-[#C20C0C] h-11 rounded-lg text-sm font-semibold">
                            Update Password
                        </Button>
                    </form>
                </div>

                <div className='lg:col-span-6 bg-white border border-[#EAEAEA] rounded-xl p-5 sm:p-8'>
                    <h2 className="text-lg sm:text-xl font-bold text-[#111111] mb-1">2 Factor Authentication</h2>
                    <p className="text-sm text-[#71717A] mb-5 sm:mb-6">Update your security preferences at any time.</p>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">

                        </div>
                    </form>
                </div>

            </div>
        </section>
    )
}
