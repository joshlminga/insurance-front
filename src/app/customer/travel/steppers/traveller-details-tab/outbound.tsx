/* eslint-disable @typescript-eslint/no-explicit-any */
import { FieldGroup } from '@/components/ui/field'
import {
    Button,
    ReusableSelect,
    ReusableSingleSelectApiInput,
    ReuseableInput
} from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import { OutBoundDestinationSchema } from '@/types/form-schema'
import { OutboundFormValues } from '@/types/schema'
import {
    CustomerVerificationDetailsProps,
    SubmitResponse
} from '@/types/types'
import { EMETHODS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
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

const inputClassName = "w-full min-w-0 h-11 sm:h-10 rounded-[5px] border border-[#ADABAB]"

export const TravellerDstinationOutboundDetails: React.FC = ({
    goToNextStep,
    goToPrevStep
}: CustomerVerificationDetailsProps) => {
    const form = useForm<OutboundFormValues>({
        resolver: zodResolver(OutBoundDestinationSchema),
        defaultValues: {
            travel_as: "",
            type_of_trip: "",
            country_of_depature: "",
            country_of_arrival: "",
            date_of_depature: "",
            date_of_return: "",
            reason_for_travel: ""
        },
    })

    const submitMutation = UseApiMutation<SubmitResponse, OutboundFormValues>({
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

    const onSubmit = (data: OutboundFormValues) => {
        submitMutation.mutate(data)
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8 w-full">
            <FieldGroup className="w-full min-w-0 space-y-4 sm:space-y-5">
                <div className="space-y-3 sm:space-y-4">
                    <h2 className="flex flex-wrap items-baseline gap-x-1 gap-y-0.5 font-poppins text-base sm:text-lg md:text-[20px] font-medium leading-snug tracking-normal text-[#141414] justify-center sm:justify-start">
                        <span>OutBound</span>
                        <span className="text-[#C20C0C]">Travel Destination</span>
                    </h2>
                </div>
                <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-y-6 sm:gap-y-8 gap-x-6 sm:gap-x-10">
                    <ReusableSelect
                        name='travel_as'
                        label='Travel As'
                        control={form.control}
                        options={[]}
                    />
                    <ReusableSelect
                        name='type_of_trip'
                        label='Type Of trip'
                        control={form.control}
                        options={[]}
                    />

                    <Controller
                        control={form.control}
                        name="country_of_depature"
                        render={({ field }) => (
                            <ReusableSingleSelectApiInput
                                url=''
                                label="Country Of Depature"
                                required
                                value={String(field.value)}
                                onChange={field.onChange}
                            />
                        )}
                    />
                    <Controller
                        control={form.control}
                        name="country_of_arrival"
                        render={({ field }) => (
                            <ReusableSingleSelectApiInput
                                url=''
                                label="Country Of Arrivale"
                                required
                                value={String(field.value)}
                                onChange={field.onChange}
                            />
                        )}
                    />
                    <ReuseableInput
                        className={inputClassName}
                        control={form.control}
                        name="date_of_depature"
                        label="Date Of Depature"
                        type='date'
                    />
                    <ReuseableInput
                        className={inputClassName}
                        control={form.control}
                        name="date_of_return"
                        label="Date Of Return"
                        type='date'
                    />
                    <ReusableSelect
                        name='reason_for_travel'
                        label='Reason For Travel'
                        control={form.control}
                        options={[]}
                    />

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
    )
}
