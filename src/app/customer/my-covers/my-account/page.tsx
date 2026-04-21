/* eslint-disable @typescript-eslint/no-explicit-any */
import { UseAuth } from '@/stores/auth-store'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button, ReuseableInput } from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import { UpdatePasswordSchema, UpdateProfileSchema } from '@/types/form-schema'
import { UpdatePasswordFormValues, UpdateProfileFormValues } from '@/types/schema'
import { EMETHODS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, User as UserIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'

export const MyAccountManagementPage = () => {
    const { user, updateUser } = UseAuth()

    const profileForm = useForm<UpdateProfileFormValues>({
        resolver: zodResolver(UpdateProfileSchema),
        defaultValues: {
            first_name: user?.name.split(' ')[0] ?? "",
            last_name: user?.name.split(' ').slice(1).join(' ') ?? "",
            email: user?.email ?? "",
            phone: (user as any)?.phone ?? "",
        },
    })

    const passwordForm = useForm<UpdatePasswordFormValues>({
        resolver: zodResolver(UpdatePasswordSchema),
        defaultValues: {
            current_password: "",
            new_password: "",
            confirm_password: "",
        },
    })

    const profileMutation = UseApiMutation<any, UpdateProfileFormValues>({
        url: 'user/update-profile',
        method: EMETHODS.PATCH,
        mutationOptions: {
            onSuccess: (data: any) => {
                ShowToast.success(data.message || "Profile updated successfully!")
                updateUser({ 
                    name: `${profileForm.getValues('first_name')} ${profileForm.getValues('last_name')}`,
                    email: profileForm.getValues('email')
                })
            },
            onError: (error: any) => {
                const message = extractErrorMessage(error);
                ShowToast.error(message || "Failed to update profile!")
            }
        }
    })

    const passwordMutation = UseApiMutation<any, UpdatePasswordFormValues>({
        url: 'user/update-password',
        method: EMETHODS.PATCH,
        mutationOptions: {
            onSuccess: (data: any) => {
                ShowToast.success(data.message || "Password updated successfully!")
                passwordForm.reset()
            },
            onError: (error: any) => {
                const message = extractErrorMessage(error);
                ShowToast.error(message || "Failed to update password!")
            }
        }
    })

    const onProfileSubmit = (data: UpdateProfileFormValues) => {
        profileMutation.mutate(data)
    }

    const onPasswordSubmit = (data: UpdatePasswordFormValues) => {
        passwordMutation.mutate(data)
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Account Management</h1>
                <p className="text-muted-foreground mt-1">Manage your profile details and account security settings.</p>
            </div>
            <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-12 xl:col-span-7">
                    <Card className="border-none shadow-none bg-white lg:border lg:border-slate-100 lg:shadow-sm overflow-hidden">
                        <CardHeader className="border-b border-slate-50 bg-slate-50/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                    <UserIcon size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold">Profile Details</h2>
                                    <p className="text-xs text-muted-foreground">Update your personal information</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <ReuseableInput
                                        className="h-11 border-slate-200 focus:border-red-500 focus:ring-red-500/20"
                                        control={profileForm.control}
                                        name="first_name"
                                        label="First Name"
                                        placeholder="Enter your first name"
                                    />
                                    <ReuseableInput
                                        className="h-11 border-slate-200 focus:border-red-500 focus:ring-red-500/20"
                                        control={profileForm.control}
                                        name="last_name"
                                        label="Last Name"
                                        placeholder="Enter your last name"
                                    />
                                </div>
                                <div className="grid sm:grid-cols-1 gap-4">
                                    <ReuseableInput
                                        className="h-11 border-slate-200 focus:border-red-500 focus:ring-red-500/20"
                                        control={profileForm.control}
                                        name="email"
                                        label="Email Address"
                                        type="email"
                                        placeholder="e.g. john@example.com"
                                    />
                                    <ReuseableInput
                                        className="h-11 border-slate-200 focus:border-red-500 focus:ring-red-500/20"
                                        control={profileForm.control}
                                        name="phone"
                                        label="Phone Number"
                                        placeholder="e.g. +254 700 000 000"
                                    />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button
                                        className="bg-[#C20C0C] hover:bg-[#C20C0C]/90 text-white font-semibold h-11 px-8 rounded-lg shadow-sm transition-all"
                                        loading={profileMutation.isPending}
                                        type="submit">
                                        Save Profile Changes
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-12 xl:col-span-5">
                    <Card className="border-none shadow-none bg-white lg:border lg:border-slate-100 lg:shadow-sm overflow-hidden">
                        <CardHeader className="border-b border-slate-50 bg-slate-50/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                    <Lock size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold">Security Settings</h2>
                                    <p className="text-xs text-muted-foreground">Keep your account secure with a strong password</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                                <ReuseableInput
                                    className="h-11 border-slate-200 focus:border-red-500 focus:ring-red-500/20"
                                    control={passwordForm.control}
                                    name="current_password"
                                    label="Current Password"
                                    type="password"
                                    placeholder="••••••••"
                                />
                                <Separator className="my-2 bg-slate-100" />
                                <ReuseableInput
                                    className="h-11 border-slate-200 focus:border-red-500 focus:ring-red-500/20"
                                    control={passwordForm.control}
                                    name="new_password"
                                    label="New Password"
                                    type="password"
                                    placeholder="••••••••"
                                />
                                <ReuseableInput
                                    className="h-11 border-slate-200 focus:border-red-500 focus:ring-red-500/20"
                                    control={passwordForm.control}
                                    name="confirm_password"
                                    label="Confirm New Password"
                                    type="password"
                                    placeholder="••••••••"
                                />
                                <div className="flex justify-end pt-2">
                                    <Button
                                        className="bg-[#C20C0C] hover:bg-[#C20C0C]/90 text-white font-semibold h-11 rounded-lg shadow-sm transition-all"
                                        loading={passwordMutation.isPending}
                                        type="submit">
                                        Update Password
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
