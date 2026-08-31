/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FieldGroup } from '@/components/ui/field'
import {
    Button,
    ReuseableInput,
    ReuseableSingleSelectNationalityInput
} from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import { TravellerDetailsSchema } from '@/types/form-schema'
import { TravellerFormValues } from '@/types/schema'
import {
    CustomerVerificationDetailsProps,
    SubmitResponse
} from '@/types/types'
import { EMETHODS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import {
    invalidSelectClassName,
    ShowToast
} from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    ArrowLeftCircle,
    ArrowRightCircle,
    PlusCircle
} from 'lucide-react'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'

const inputClassName = "w-full min-w-0 h-11 sm:h-10 rounded-[5px] border border-[#ADABAB]"

export const TravellerDetailsPage: React.FC = ({
    goToNextStep,
    goToPrevStep,
}: CustomerVerificationDetailsProps) => {
    const form = useForm<TravellerFormValues>({
        resolver: zodResolver(TravellerDetailsSchema),
        defaultValues: {
            first_name: "",
            sur_name: "",
            email: "",
            phone: "",
            d_o_b: "",
            nationality: "",
        },
    })

    const submitMutation = UseApiMutation<SubmitResponse, TravellerFormValues>({
        url: "",
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

    const onSubmit = (data: TravellerFormValues) => {
        submitMutation.mutate(data)
    }

    return (
        <div className="w-full min-w-0 max-w-full mx-auto items-center justify-center px-1 sm:px-2 lg:px-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8 w-full">
                <FieldGroup className="w-full min-w-0 space-y-4 sm:space-y-5">
                    <div className="space-y-3 sm:space-y-4">
                        <h2 className="flex flex-wrap items-baseline gap-x-1 gap-y-0.5 font-poppins text-base sm:text-lg md:text-[20px] font-medium leading-snug tracking-normal text-[#141414] justify-center sm:justify-start">
                            <span>Proceed to add your</span>
                            <span className="text-[#C20C0C]">Travel Details</span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-y-6 sm:gap-y-8 gap-x-6 sm:gap-x-10">
                        <ReuseableInput
                            className={inputClassName}
                            control={form.control}
                            name="first_name"
                            label="First Name"
                        />
                        <ReuseableInput
                            className={inputClassName}
                            control={form.control}
                            name="sur_name"
                            label="Surname"
                        />
                        <ReuseableInput
                            className={inputClassName}
                            control={form.control}
                            name="email"
                            label="Email"
                            type="email"
                        />
                        <ReuseableInput
                            className={inputClassName}
                            control={form.control}
                            name="phone"
                            label="Mobile Number"
                            type="tel"
                        />
                        <ReuseableInput
                            className={inputClassName}
                            control={form.control}
                            name="d_o_b"
                            label="Date Of Birth"
                            type="date"
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
                                        />
                                        {fieldState.error ? (
                                            <p className="mt-1 text-sm text-red-500">
                                                {fieldState.error.message}
                                            </p>
                                        ) : null} */}
                                </div>
                            )}
                        />
                    </div>
                    <div className="flex items-center justify-start gap-2 border border-dotted p-2.5 rounded-md max-w-sm">
                        <span className="text-sm text-gray-600">
                            Add Other Details
                        </span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            leftIcon={ <PlusCircle className="h-12 w-12" />}>
                        </Button>
                    </div>

                </FieldGroup>
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <Button
                        type="button"
                        className="w-full sm:w-auto min-h-11 rounded-full border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10 px-6"
                        leftIcon={<ArrowLeftCircle className="shrink-0" />}
                        onClick={() => goToPrevStep?.()}>
                        Previous
                    </Button>
                    <Button
                        // type="submit"
                        type='button'
                        className="w-full sm:w-auto min-h-11 bg-[#C20C0C]/80 rounded-full hover:bg-[#C20C0C] px-8"
                        rightIcon={<ArrowRightCircle className="shrink-0" />}
                        // loading={submitMutation.isPending}
                        onClick={() => goToNextStep?.()}>
                        Next
                    </Button>
                </div>
            </form>
        </div>
    )
}
