/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ReusableSwitchToggle, ReuseableInput } from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import { CustomerDetailsSchema, ResetPasswordSchema } from '@/types/form-schema'
import { CustomerFormValues, ResetPasswordValues } from '@/types/schema'
import { SubmitResponse } from '@/types/types'
import { EMETHODS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

export const AccountSettingsPage = () => {
    const [showOldPassword, setShowOldPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

    const form = useForm<CustomerFormValues>({
        resolver: zodResolver(CustomerDetailsSchema),
        defaultValues: {
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
        },
    })

    const passForm = useForm<ResetPasswordValues>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: {
            old_password: '',
            password: '',
            password_confirmation: '',
        },
    })

    const submitMutation = UseApiMutation<SubmitResponse, CustomerFormValues>({
        url: ``,
        method: EMETHODS.POST,
        mutationOptions: {
            onSuccess: (data) => {
                ShowToast.success(data.message || 'Profile updated successfully!')
            },
            onError: (error: any) => {
                ShowToast.error(extractErrorMessage(error) || 'Profile update failed!')
            },
        },
    })

    const submitPasswordMutation = UseApiMutation<SubmitResponse, ResetPasswordValues>({
        url: ``,
        method: EMETHODS.POST,
        mutationOptions: {
            onSuccess: (data) => {
                ShowToast.success(data.message || 'Password updated successfully!')
                passForm.reset()
            },
            onError: (error: any) => {
                ShowToast.error(extractErrorMessage(error) || 'Password update failed!')
            },
        },
    })

    const onSubmit = (data: CustomerFormValues) => {
        submitMutation.mutate(data)
    }

    const onSubmitPassword = (data: ResetPasswordValues) => {
        submitPasswordMutation.mutate(data)
    }

    const handleTwoFactorChange = (enabled: boolean) => {
        setTwoFactorEnabled(enabled)
    }

    return (
        <section>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <div className="rounded-xl border border-[#EAEAEA] bg-white p-5 sm:p-8">
                    <h2 className="text-lg sm:text-xl font-bold text-[#111111] mb-1">
                        Account Details
                    </h2>
                    <p className="text-sm text-[#71717A] mb-5 sm:mb-6">
                        Update your name, email, and phone number.
                    </p>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        <ReuseableInput
                            className="w-full h-12 rounded-[5px] border border-[#ADABAB]"
                            control={form.control}
                            name="email"
                            type="email"
                            placeholder="Enter email"
                            label="Email"
                        />
                        <ReuseableInput
                            className="w-full h-12 rounded-[5px] border border-[#ADABAB]"
                            control={form.control}
                            name="phone"
                            type="tel"
                            placeholder="Enter phone number"
                            label="Phone Number"
                        />
                        <Button
                            type="submit"
                            loading={submitMutation.isPending}
                            className="w-full bg-[#C20C0C]/80 hover:bg-[#C20C0C] h-11 rounded-lg text-sm font-semibold"
                        >
                            Update Profile
                        </Button>
                    </form>
                </div>
                <div className="rounded-xl border border-[#EAEAEA] bg-white p-5 sm:p-8">
                    <h2 className="text-lg sm:text-xl font-bold text-[#111111] mb-1">
                        Security Settings
                    </h2>
                    <p className="text-sm text-[#71717A] mb-5 sm:mb-6">
                        Manage your password and two-factor authentication.
                    </p>

                    <form onSubmit={passForm.handleSubmit(onSubmitPassword)} className="space-y-4">
                        <div className="relative">
                            <ReuseableInput
                                className="w-full h-12 rounded-[5px] border border-[#ADABAB] pr-10"
                                control={passForm.control}
                                name="old_password"
                                label="Current Password"
                                type={showOldPassword ? 'text' : 'password'}
                                placeholder="Enter your current password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowOldPassword((v) => !v)}
                                className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
                                aria-label={showOldPassword ? 'Hide password' : 'Show password'}>
                                {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <div className="relative">
                            <ReuseableInput
                                className="w-full h-12 rounded-[5px] border border-[#ADABAB] pr-10"
                                control={passForm.control}
                                name="password"
                                label="New Password"
                                type={showNewPassword ? 'text' : 'password'}
                                placeholder="Enter your new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword((v) => !v)}
                                className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
                                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                            >
                                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <div className="relative">
                            <ReuseableInput
                                className="w-full h-12 rounded-[5px] border border-[#ADABAB] pr-10"
                                control={passForm.control}
                                name="password_confirmation"
                                label="Confirm New Password"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirm your new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword((v) => !v)}
                                className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
                                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <Button
                            type="submit"
                            loading={submitPasswordMutation.isPending}
                            className="w-full bg-[#C20C0C]/80 hover:bg-[#C20C0C] h-11 rounded-lg text-sm font-semibold">
                            Update Password
                        </Button>
                    </form>
                    <div className="mt-8 pt-6 border-t border-[#EAEAEA]">
                        <ReusableSwitchToggle
                            id="two-factor-auth"
                            label="Two-Factor Authentication"
                            description="Add an extra layer of security to your account."
                            checked={twoFactorEnabled}
                            onCheckedChange={handleTwoFactorChange}
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
