/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardFooter } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldLabel } from '@/components/ui/field'
import {
    Button,
    ReusableApiMultiSelect,
    ReusableSelect,
    ReusableSingleSelectApiInput,
    ReuseableInput,
    ReuseableSingleSelectclassInput,
    ReuseableSingleSelectCoveringInput,
    ReuseableSingleSelectVehicleUseInput
} from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import { CreateMotorProductRatesSchema } from '@/types/form-schema'
import { CreateMotorProductRatesFormValues } from '@/types/schema'
import { SubmitResponse } from '@/types/types'
import { EMETHODS, TARGET_AUDIENCE_OPTIONS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

export const AddMotorProductRatesPage = ({ handleDialogContextSwitch, componentProps }: {
    handleDialogContextSwitch: (context?: any) => void
    componentProps?: any
}) => {

    const form = useForm<CreateMotorProductRatesFormValues>({
        resolver: zodResolver(CreateMotorProductRatesSchema),
        defaultValues: {
            coverfor_id: "",
            covertype_id: "",
            covering_id: "",
            usedfor_id: "",
            bodytype_id: "",
            used_tonnage_id: "",
            min_tonnage: "",
            max_tonnage: "",
            is_all_sum: undefined,
            valued_from: "",
            valued_to: "",
            is_all_age: undefined,
            age_from: "",
            age_to: "",
            minimum: "",
            pll: "",
            is_fleet: undefined,
            min_fleet: "",
            max_fleet: "",
            target_audience: "",
            cover_target: "",
            min_age: "",
            max_age: "",
            start_date: "",
            expiry_date: "",
            makemodel_offered: [],
            makemodel_notoffered: [],
            meta: undefined,

        },
    })

    const submitMutation = UseApiMutation<SubmitResponse, CreateMotorProductRatesFormValues>({
        url: `products/motor/rates/${componentProps?.data?.id}`,
        method: EMETHODS.POST,
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
    const onSubmit = (data: CreateMotorProductRatesFormValues) => {
        submitMutation.mutate(data)
    }

    return (
        <div className="w-full min-w-[600px] max-w-[600px] p-6 space-y-6">
            <div className="border-b pb-3">
                <h2 className="text-xl font-semibold">
                    Motor Detailed Benefits
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Fill in the details below to register a motor Detailed benefits.
                </p>
            </div>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">

                {/* Product */}
                <Controller
                    control={form.control}
                    name="coverfor_id"
                    render={({ field }) => (
                        <ReuseableSingleSelectclassInput
                            label="Cover Class"
                            required
                            value={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
                <Controller
                    control={form.control}
                    name="covertype_id"
                    render={({ field }) => (
                        <ReusableSingleSelectApiInput
                            url="motor/cover-type"
                            value={field.value}
                            onChange={field.onChange}
                            label="Cover Type"
                            placeholder="Select Cover Type..."
                        />
                    )}
                />
                <Controller
                    control={form.control}
                    name="covering_id"
                    render={({ field }) => (
                        <ReuseableSingleSelectCoveringInput
                            label="Covering"
                            required
                            value={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
                <Controller
                    control={form.control}
                    name="usedfor_id"
                    render={({ field }) => (
                        <ReuseableSingleSelectVehicleUseInput
                            label="Vehicle Use"
                            required
                            value={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
                <Controller
                    control={form.control}
                    name="bodytype_id"
                    render={({ field }) => (
                        <ReusableSingleSelectApiInput
                            url="motor/vehicle-body-type"
                            value={field.value}
                            onChange={field.onChange}
                            label="Vehicle Body Type"
                            placeholder="Select vehicle body type..."
                        />
                    )}
                />
                <Controller
                    control={form.control}
                    name="used_tonnage_id"
                    render={({ field }) => (
                        <ReusableSingleSelectApiInput
                            url="motor/tonnage"
                            value={field.value}
                            onChange={field.onChange}
                            label="Vehicle Tonnage (Optional)"
                            placeholder="Select vehicle tonnage..."
                        />
                    )}
                />
                <ReuseableInput
                    control={form.control}
                    name="min_tonnage"
                    type='number'
                    label="Min Tonage (Optional)"
                    className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                />
                <ReuseableInput
                    control={form.control}
                    name="max_tonnage"
                    type='number'
                    label="Max Tonage (Optional)"
                    className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                />
                {/* End of Product */}

                {/* Vehicle Info */}
                <div className='flex gap-2'>
                    <Controller
                        control={form.control}
                        name="used_tonnage_id"
                        render={({ field }) => (
                            <Field orientation="horizontal">
                                <Checkbox
                                    control={form.control}
                                    name="is_all_sum"
                                />
                                <FieldLabel>
                                    All
                                </FieldLabel>
                            </Field>
                        )}
                    />
                    <ReuseableInput
                        control={form.control}
                        name="valued_from"
                        type='number'
                        label="Valued From"
                        className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                    />
                    <ReuseableInput
                        control={form.control}
                        name="valued_to"
                        type='number'
                        label="Valued To"
                        className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                    />
                </div>

                <div className='flex gap-2'>
                    <Controller
                        control={form.control}
                        name="is_all_age"
                        render={({ field }) => (
                            <Field orientation="horizontal">
                                <Checkbox
                                    control={form.control}
                                    name="is_all_age"
                                />
                                <FieldLabel>
                                    Age
                                </FieldLabel>
                            </Field>
                        )}
                    />
                    <ReuseableInput
                        control={form.control}
                        name="age_from"
                        type='number'
                        label="Age From"
                        className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                    />
                    <ReuseableInput
                        control={form.control}
                        name="age_to"
                        type='number'
                        label="Age To"
                        className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                    />
                </div>
                <div className='flex gap-2'>
                    <ReuseableInput
                        control={form.control}
                        name="rate"
                        type='number'
                        label="Rate"
                        className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                    />
                    <ReuseableInput
                        control={form.control}
                        name="minimum"
                        type='number'
                        label="Minimum"
                        className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                    />
                    <ReuseableInput
                        control={form.control}
                        name="pll"
                        type='number'
                        label="Pll"
                        className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                    />
                </div>
                {/*End Of Vehicle Info */}

                {/* Fleet */}
                {/* <div className='flex gap-2'>
                    <Controller
                        control={form.control}
                        name="is_fleet"
                        render={({ field }) => (
                            <Field orientation="horizontal">
                                <ReuseableRadioChoiceGroup
                                    control={form.control}
                                    name="is_fleet"
                                />
                                <FieldLabel>
                                    True
                                </FieldLabel>
                            </Field>
                        )}
                    />
                    <Controller
                        control={form.control}
                        name="is_fleet"
                        render={({ field }) => (
                            <Field orientation="horizontal">
                                <ReuseableRadioChoiceGroup
                                    control={form.control}
                                    name="is_fleet"
                                />
                                <FieldLabel>
                                    False
                                </FieldLabel>
                            </Field>
                        )}
                    />
                    <ReuseableInput
                        control={form.control}
                        name="min_fleet"
                        type='number'
                        label="Min Fleet"
                        className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                    />
                    <ReuseableInput
                        control={form.control}
                        name="max_fleet"
                        type='number'
                        label="Max Fleet"
                        className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                    />
                </div> */}
                {/*End Fleet */}

                {/* Targets */}
                <ReusableSelect
                    control={form.control}
                    name="target_audience"
                    label="Target Audience (public or private)"
                    options={TARGET_AUDIENCE_OPTIONS}
                />
                <ReusableSelect
                    control={form.control}
                    name="cover_target"
                    label="Cover Target"
                    options={TARGET_AUDIENCE_OPTIONS}
                />

                <ReuseableInput
                    control={form.control}
                    name="min_age"
                    type='number'
                    label="Min Age"
                    className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                />
                <ReuseableInput
                    control={form.control}
                    name="max_age"
                    type='number'
                    label="Max Age"
                    className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                />
                {/* End Targets */}

                {/* Dates */}
                <ReuseableInput
                    control={form.control}
                    name="start_date"
                    type='date'
                    label="Start Date"
                    className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                />
                <ReuseableInput
                    control={form.control}
                    name="expiry_date"
                    type='date'
                    label="Expiry Date"
                    className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                />
                {/* End Dates */}

                {/*  Offered make and Nodel*/}
                <Controller
                    control={form.control}
                    name="makemodel_offered"
                    render={({ field }) => (
                        <ReusableApiMultiSelect
                            url="taxonomies/vehicle/search-make-model"
                            value={field.value}
                            onChange={field.onChange}
                            label="Make and Model Offered (Optional)"
                            placeholder="Select Make and Model Offered..."
                        />
                    )}
                />
                <Controller
                    control={form.control}
                    name="makemodel_notoffered"
                    render={({ field }) => (
                        <ReusableApiMultiSelect
                            url="taxonomies/vehicle/search-make-model"
                            value={field.value}
                            onChange={field.onChange}
                            label="Make and Model Not Offered (Optional)"
                            placeholder="Select Make and Model Not Offered..."
                        />
                    )}
                />
                {/* End Offered make and Nodel*/}

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
                        Save
                    </Button>
                </CardFooter>
            </form>
        </div>
    )
}
