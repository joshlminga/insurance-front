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

export const CreateUserModal = ({ handleDialogContextSwitch, componentProps }: {
    handleDialogContextSwitch: (context?: any) => void
    componentProps?: any
}
) => {
    const form = useForm<UsersFormValues>({
        resolver: zodResolver(UsersSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            country: "",
        },
    })

    const submitMutation = UseApiMutation<SubmitResponse, UsersFormValues>({
        url: "user/register",
        method: EMETHODS.POST,
        // config: {
        //     headers: {
        //         "Content-Type": "multipart/form-data",
        //     },
        // },
        mutationOptions: {
            onSuccess: (data) => {
                ShowToast.success(data.message || "Submitted successfully!")
                form.reset()
                componentProps?.refetch?.()
                handleDialogContextSwitch({ refetch: true })
            },
            onError: (error: unknown) => {
                const message = extractErrorMessage(error)
                ShowToast.error(message || "Submission failed!")
            },
        },
    })
    const onSubmit = (data: UsersFormValues) => {
        // const formData = new FormData()
        // formData.append("name", data.name)
        // formData.append("organization_type", data.organization_type)
        // formData.append("domain", data.domain)
        // formData.append("admin_id", data.admin_id)
        // formData.append("initials", data.initials)
        // data.locations.forEach((location) => {
        //     formData.append("locations[]", location)
        // })
        // if (data.logo instanceof File) {
        //     formData.append("logo", data.logo)
        // }
        submitMutation.mutate(data)
    }

    return (
        <div className="w-full min-w-[600px] max-w-[600px] p-6 space-y-6">
            <div className="border-b pb-3">
                <h2 className="text-xl font-semibold">
                    Create Users
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Fill in the details below to register a new user.
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)}
                className="grid gap-4">
                <ReuseableInput
                    control={form.control}
                    name="name"
                    label="Full Name"
                    className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                />
                {/* <ReusableSelect
                    control={form.control}
                    name="organization_type"
                    label="Organization Type"
                    options={ORGANIZATIONTYPES}
                /> */}
                <ReuseableInput
                    control={form.control}
                    name="email"
                    type='email'
                    label="Email Address"
                    className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                />

                <ReuseableInput
                    control={form.control}
                    name="phone"
                    label="Phone Number"
                    type='tel'
                    className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                />
                {/* <Controller
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                        <ReusableCountriesInputMultiselect
                            label="country"
                            required
                            value={field.value}
                            onChange={field.onChange}
                        />
                    )}
                /> */}
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
                        loading={submitMutation.isPending}>
                        Save Changes
                    </Button>
                </CardFooter>
            </form>
        </div>
    )
}
