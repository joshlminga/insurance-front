/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button, ReusableSelect, ReusableSingleSelectApiInput, ReuseableInput, ReuseableSingleSelectNationalityInput } from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import { KycSchema } from '@/types/form-schema'
import type { KycFormValues } from '@/types/schema'
import type { CustomerVerificationDetailsProps, SubmitResponse } from '@/types/types'
import { EMETHODS, IDTYPES, INVOICE_SESSION_STORAGE_KEY, PURCHASE_SESSION_STORAGE_KEY } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

export const KycInfo: React.FC<CustomerVerificationDetailsProps> = ({ goToPrevStep, goToNextStep }) => {
    const [purchaseSessionId, setPurchaseSessionId] = useState<string | null>(null)

    const form = useForm<KycFormValues>({
        resolver: zodResolver(KycSchema),
        defaultValues: {
            nationality_id: "",
            id_type: "",
            id_number: "",
            tax_pin: "",
            color: "",
            chassis_number: "",
            engine_cc: "",
            engine_number: "",
            total_seats: "",
            tonage_capacity: "",
            logbook: undefined,
            tax_certificate: undefined,
            id_document: undefined,
        },
    })

    useEffect(() => {
        const storedPurchaseKey = String(sessionStorage.getItem(PURCHASE_SESSION_STORAGE_KEY))
        if (storedPurchaseKey) {
            setPurchaseSessionId(storedPurchaseKey)
        } else {
            setPurchaseSessionId(null)
        }
    }, [])

    const fileFields = new Set(["logbook", "tax_certificate", "id_document"])
    const submitMutation = UseApiMutation<SubmitResponse, FormData>({
        url: `purchase/motor/${purchaseSessionId}/kyc`,
        method: EMETHODS.POST,
        config: {
            headers: { "Content-Type": "multipart/form-data" },
        },
        mutationOptions: {
            onSuccess: (data) => {
                sessionStorage.setItem(INVOICE_SESSION_STORAGE_KEY, String(data?.data?.purchase_id))
                goToNextStep?.()
                ShowToast.success(data.message || "Submitted successfully!")
            },
            onError: (error: any) => {
                const message = extractErrorMessage(error);
                ShowToast.error(message || "Submission failed!")
            },
        },
    })

    const onSubmit = (data: KycFormValues) => {
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
            if (value === undefined || value === null) return
            if (fileFields.has(key)) {
                if (value instanceof File) formData.append(key, value)
            } else {
                formData.append(key, String(value))
            }
        })
        submitMutation.mutate(formData)
    }
    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full mx-auto bg-transparent">
            <div className='items-center justify-center border p-3 sm:p-4'>
                <div className="w-full py-3">
                    <h1 className="text-xl sm:text-2xl font-bold leading-none mb-4">KYC Info</h1>
                </div>
                <Separator className='my-4' />
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'>
                    <Controller
                        control={form.control}
                        name="nationality_id"
                        render={({ field }) => (
                            <ReuseableSingleSelectNationalityInput
                                label="Nationality"
                                required
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />
                    {/* <ReusableSelect
                        control={control}
                        name="ownership"
                        label="ownership"
                        placeholder="Select ownership"
                        options={OWNERSHIPOPTIONS}
                    /> */}
                    <ReusableSelect
                        control={form.control}
                        name="id_type"
                        label="ID Types"
                        placeholder="Select ID Type"
                        options={IDTYPES}
                    />
                    <ReuseableInput
                        className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        name="id_number"
                        label="Passport/ID Number"
                    />
                    {/* <ReuseableInput
                        className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        name="color"
                        label="Color"
                    /> */}
                    <Controller
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                            <div>
                                <ReusableSingleSelectApiInput
                                    url="motor/vehicle-color"
                                    value={field.value}
                                    onChange={field.onChange}
                                    label="Vehicle Color"
                                    required
                                    placeholder="Select Vehicle color..."
                                />
                            </div>
                        )}
                    />
                    <ReuseableInput
                        className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        name="tax_pin"
                        label="Personal Tax Pin"
                    />
                    <ReuseableInput
                        className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        name="chassis_number"
                        label="Vehicle Chassis Number"
                    />
                    <ReuseableInput
                        className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        name="engine_number"
                        label="Vehicle Engine Number"
                    />
                    <ReuseableInput
                        className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        name="engine_cc"
                        label="Vehicle Engine Capacity (CC)"
                    />
                    <ReuseableInput
                        className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        name="total_seats"
                         type='number'
                        label="Vehicle Total Seat Number"
                    />
                    <ReuseableInput
                        className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        type='number'
                        name="tonage_capacity"
                        label="Vehicle Tonage Capacity (Tones)"
                    />
                </div>

                <Separator className='my-4' />
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'>
                    <ReuseableInput
                        className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        type='file'
                        name="logbook"
                        label="Attach Logbook"
                    />
                    <ReuseableInput
                        className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        type='file'
                        name="tax_certificate"
                        label="Attach Tax Certificate"
                    />
                    <ReuseableInput
                        className="w-full h-12.75 rounded-[5px] border border-[#ADABAB] sm:col-span-2 lg:col-span-1"
                        control={form.control}
                        type='file'
                        name="id_document"
                        label="Attach ID/Passport"
                    />
                </div>
            </div>
            <CardFooter className="w-full flex flex-col sm:flex-row justify-between gap-3 mt-3 px-0">
                <Button
                    type="button"
                    className="w-full sm:w-auto rounded-full border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
                    leftIcon={<ArrowLeftCircle />}
                    onClick={() => goToPrevStep?.()}>
                    Previous
                </Button>
                <Button
                    type="submit"
                    className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-full hover:bg-[#C20C0C]"
                    rightIcon={<ArrowRightCircle />}
                    loading={submitMutation.isPending}>
                    Invoice Cover Quotation
                </Button>
            </CardFooter>
        </form>
    )
}
