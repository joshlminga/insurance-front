/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardFooter } from '@/components/ui/card'
import { Button, ReuseableInput, ReuseableSingleSelectCountriesInput } from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import { UsersSchema } from '@/types/form-schema'
import { UsersFormValues } from '@/types/schema'
import { SubmitResponse } from '@/types/types'
import { EMETHODS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

export const EditUserModal = ({
    handleDialogContextSwitch,
    componentProps,
}: {
    handleDialogContextSwitch: (context?: any) => void
    componentProps?: {
        data?: Record<string, any>
        refetch?: () => Promise<any>
        readOnly?: boolean
    }
}) => {
    const user = componentProps?.data ?? {}
    const form = useForm<UsersFormValues>({
        resolver: zodResolver(UsersSchema),
        defaultValues: {
            name: user?.name ?? '',
            email: user?.email ?? '',
            phone: user?.phone ?? '',
            country: user?.country?.id ? String(user.country.id) : '',
        },
    })
    const updateMutation = UseApiMutation<SubmitResponse, UsersFormValues>({
        url: `user/${user?.id}`,
        method: EMETHODS.PATCH,
        mutationOptions: {
            onSuccess: (response) => {
                ShowToast.success(response?.message || 'User updated successfully')
                componentProps?.refetch?.()
                handleDialogContextSwitch({})
            },
            onError: (error) => {
                ShowToast.error(extractErrorMessage(error))
            },
        },
    })

    const onSubmit = (data: UsersFormValues) => {
        if (!user?.id) {
            ShowToast.error('Unable to update user: missing user id')
            return
        }
        updateMutation.mutate(data)
    }

    return (
        <div className="w-full min-w-[600px] max-w-[600px] p-6 space-y-6">
            <div className="border-b pb-3">
                <h2 className="text-xl font-semibold">
                   Edit User
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Update user details below.
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <ReuseableInput
                    control={form.control}
                    name="name"
                    label="Full Name"
                    className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                />
                <ReuseableInput
                    control={form.control}
                    name="email"
                    type="email"
                    label="Email Address"
                    className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                />
                <ReuseableInput
                    control={form.control}
                    name="phone"
                    label="Phone Number"
                    type="tel"
                    className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                />
                <Controller
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                        <ReuseableSingleSelectCountriesInput
                            label="Country"
                            required
                            value={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
                <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 mt-2 px-0">
                    <Button
                        type="button"
                        className="w-full sm:w-auto rounded-full border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
                        onClick={() => handleDialogContextSwitch({})}>
                        Cancel
                    </Button>
                        <Button
                            type="submit"
                            className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-full hover:bg-[#C20C0C]"
                            loading={updateMutation.isPending}>
                            Save Changes
                        </Button>
                </CardFooter>
            </form>
        </div>
    )
}
