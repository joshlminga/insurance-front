/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardFooter } from '@/components/ui/card'
import {
    Button,
    ReusableSelect,
    ReuseableInput,
    ReuseableSingleSelectAdminInput,
} from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import { OrganizationEditSchema } from '@/types/form-schema'
import { OrganizationEditFormValues } from '@/types/schema'
import { SubmitResponse } from '@/types/types'
import { EMETHODS, ORGANIZATIONTYPES } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

export const EditOrganizationModal = ({
    componentProps,
    handleDialogContextSwitch,
}: {
    componentProps?: {
        data?: Record<string, any>
        refetch?: () => Promise<any>
    }
    handleDialogContextSwitch: (context?: any) => void
}) => {

    const organizationId =
        componentProps?.data?.organization_id ??
        componentProps?.data?.id

    const form = useForm<OrganizationEditFormValues>({
        resolver: zodResolver(OrganizationEditSchema),
        defaultValues: {
            name: componentProps?.data?.organization_name ?? '',
            organization_type: componentProps?.data?.organization_type ?? '',
            admin_id: String(componentProps?.data?.organization_admin_id ?? ''),
        },
    })

    const updateMutation = UseApiMutation<SubmitResponse, FormData>({
        url: `organization/${organizationId}`,
        config: {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        },
        method: EMETHODS.POST,
        mutationOptions: {
            onSuccess: (response) => {
                ShowToast.success(response?.message || 'Organization updated successfully')
                componentProps?.refetch?.()
                handleDialogContextSwitch({})
            },
            onError: (error) => {
                ShowToast.error(extractErrorMessage(error))
            },
        },
    })

    const onSubmit = (data: OrganizationEditFormValues) => {
        if (!organizationId) {
            ShowToast.error('Unable to update organization: missing organization id')
            return
        }
        const formData = new FormData()
        formData.append("name", data.name)
        formData.append("organization_type", data.organization_type)
        formData.append("admin_id", data.admin_id)
        updateMutation.mutate(formData)
    }

    return (
        <div className="w-full min-w-[600px] max-w-[700px] p-6 space-y-6">
            <div className="border-b pb-3">
                <h2 className="text-xl font-semibold">Edit Organization</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Update organization details below.
                </p>
            </div>

            {!organizationId && (
                <div className="text-sm text-destructive">
                    Unable to load organization details: missing organization id.
                </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-6 gap-4">
                <div className="col-span-6">
                    <ReuseableInput
                        control={form.control}
                        name="name"
                        label="Organization Name"
                        className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                        required
                    />
                </div>

                <div className="col-span-6 sm:col-span-3">
                    <ReusableSelect
                        control={form.control}
                        name="organization_type"
                        label="Organization Type"
                        options={ORGANIZATIONTYPES}
                        triggerClassName="rounded-[5px] border border-[#ADABAB]"
                    />
                </div>

                <div className="col-span-6 sm:col-span-3">
                    <Controller
                        control={form.control}
                        name="admin_id"
                        render={({ field }) => (
                            <ReuseableSingleSelectAdminInput
                                label="Admin"
                                required
                                value={field.value ?? ''}
                                onChange={field.onChange}
                            />
                        )}
                    />
                </div>
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
                        disabled={!organizationId || updateMutation.isPending}
                        loading={updateMutation.isPending}>
                        Save Changes
                    </Button>
                </CardFooter>
            </form>
        </div>
    )
}
