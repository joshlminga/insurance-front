/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Separator } from '@/components/ui/separator'
import {
    Button,
    ReuseableInput,
    ReuseableSingleSelectNationalityInput
} from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import { TravelKycSchema } from '@/types/form-schema'
import { TravelKycFormValues } from '@/types/schema'
import {
    CustomerVerificationDetailsProps,
    SubmitResponse
} from '@/types/types'
import { EMETHODS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { invalidSelectClassName, ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    ArrowLeftCircle,
    ArrowRightCircle
} from 'lucide-react'
import React from 'react'
import {
    Controller,
    useForm
} from 'react-hook-form'

export const TravelKycDetailsPage: React.FC<CustomerVerificationDetailsProps> = ({ goToNextStep, goToPrevStep }) => {
    const form = useForm<TravelKycFormValues>({
        resolver: zodResolver(TravelKycSchema),
        defaultValues: {
            first_name: "",
            middle_name: "",
            sur_name: "",
            email: "",
            phone_number: "",
            date_or_birth: "",
            nationality: "",
            passport_number: "",
            tax_number: "",
            tax_certificate: undefined,
            passport_attachment: undefined,
        },
    })
    const submitMutation = UseApiMutation<SubmitResponse, TravelKycFormValues>({
        url: '',
        method: EMETHODS.POST,
        mutationOptions: {
            onSuccess: (data) => {
                goToNextStep?.()
                ShowToast.success(data.message || "Submitted successfully!")
            },
            onError: (error: any) => {
                const message = extractErrorMessage(error)
                ShowToast.error(message || "Submission failed!")
            },
        },
    })

    const onSubmit = (data: TravelKycFormValues) => {
        submitMutation.mutate(data)
    }
    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full mx-auto bg-transparent">
            <div className='items-center justify-center border p-3 sm:p-4'>
                <div className="w-full py-3">
                    <h1 className="text-xl sm:text-2xl font-bold leading-none mb-4">KYC Info</h1>
                </div>
                <Separator className='my-4' />
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'>
                    <ReuseableInput
                        className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        name="first_name"
                        label="First Name"
                    />
                    <ReuseableInput
                        className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        name="middle_name"
                        label="Middle Name (Optional)"
                    />
                    <ReuseableInput
                        className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        name="sur_name"
                        label="Surname"
                    />
                    <ReuseableInput
                        className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        name="email"
                        type='email'
                        label="Email Address"
                    />
                    <ReuseableInput
                        className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        name="phone_number"
                        label="Phone Number"
                        type='tel'
                    />
                    <ReuseableInput
                        className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        type='date'
                        name="date_or_birth"
                        label="Date Of Birth"
                    />
                    <Controller
                        control={form.control}
                        name="nationality"
                        render={({ field, fieldState }) => (
                            <div data-invalid={fieldState.invalid} className={invalidSelectClassName}>
                                {/* <ReuseableSingleSelectNationalityInput
                                    label="Nationality"
                                    required
                                    value={String(field.value)}
                                    onChange={field.onChange}
                                /> */}
                                {fieldState.error ? (
                                    <p className="mt-1 text-sm text-red-500">
                                        {fieldState.error.message}
                                    </p>
                                ) : null}
                            </div>
                        )}
                    />
                    <ReuseableInput
                        className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        name="passport_number"
                        label="Passport Number"
                    />
                    <ReuseableInput
                        className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        name="tax_number"
                        label="Tax Number"
                    />
                </div>
                <Separator className='my-4' />
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'>
                    <ReuseableInput
                        className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                        control={form.control}
                        type='file'
                        name="tax_certificate"
                        label="Attach Tax Certificate"
                    />
                    <ReuseableInput
                        className="w-full h-10 rounded-[5px] border border-[#ADABAB] sm:col-span-2 lg:col-span-1"
                        control={form.control}
                        type='file'
                        name="passport_attachment"
                        label="Attach ID/Passport"
                    />
                </div>
            </div>
            <div className="w-full flex flex-col sm:flex-row justify-between gap-3 mt-3 px-0">
                <Button
                    type="button"
                    className="w-full sm:w-auto rounded-full border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
                    leftIcon={<ArrowLeftCircle />}
                    onClick={() => goToPrevStep?.()}>
                    Previous
                </Button>
                <Button
                    type="button"
                    className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-full hover:bg-[#C20C0C]"
                    rightIcon={<ArrowRightCircle />}
                    onClick={() => goToNextStep?.()}>
                    Next
                </Button>
            </div>
        </form>
    )
}
