/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardFooter } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldLabel } from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
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
import { CAUDIENCE_OPTIONS, EMETHODS, TAUDIENCE_OPTIONS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'

const steps = [
    { title: 'Product', fields: ['coverfor_id', 'covertype_id', 'covering_id', 'usedfor_id', 'bodytype_id', 'used_tonnage_id'] },
    { title: 'Vehicle Info', fields: ['valued_from', 'valued_to', 'age_from', 'age_to', 'rate', 'minimum', 'pll'] },
    { title: 'Fleet', fields: ['is_fleet', 'min_fleet', 'max_fleet'] },
    { title: 'Targets', fields: ['target_audience', 'cover_target', 'min_age', 'max_age'] },
    { title: 'Dates', fields: ['start_date', 'expiry_date'] },
    { title: 'Offered Vehicles', fields: ['makemodel_offered', 'makemodel_notoffered'] }
]

export const AddMotorProductRatesPage = ({ handleDialogContextSwitch, componentProps }: {
    handleDialogContextSwitch: (context?: any) => void
    componentProps?: any
}) => {
    const {slung} = useParams();

    const [currentStep, setCurrentStep] = useState(0)

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
            is_all_sum: false,
            valued_from: "",
            valued_to: "",
            is_all_age: false,
            age_from: "",
            age_to: "",
            rate: "",
            minimum: "",
            pll: "",
            is_fleet: false,
            min_fleet: "",
            max_fleet: "",
            target_audience: "",
            cover_target: "",
            min_age: "",
            max_age: "",
            start_date: "",
            expiry_date: "",
            is_active: true,
            makemodel_offered: [],
            makemodel_notoffered: [],
            meta: [],
        },
    })

    const submitMutation = UseApiMutation<SubmitResponse, CreateMotorProductRatesFormValues>({
        url: `products/motor/rates/${slung}`,
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

    const onFormError = (errors: any) => {
        console.error("Form validation errors (detailed):", JSON.stringify(errors, null, 2))
        const firstErrorKey = Object.keys(errors)[0]
        const firstError = errors[firstErrorKey] as any

        if (firstError?.message) {
            ShowToast.error(`${firstErrorKey}: ${firstError.message}`)
        } else if (Array.isArray(firstError)) {
            const subErrors = firstError.filter(Boolean)
            if (subErrors.length > 0) {
                ShowToast.error(`Validation error in ${firstErrorKey}: ${subErrors[0].message || 'Invalid item'}`)
            }
        } else {
            ShowToast.error(`Validation error in ${firstErrorKey}`)
        }
    }

    const nextStep = async () => {
        const fields = steps[currentStep].fields
        const isValid = await form.trigger(fields as any)
        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
        } else {
            const errors = form.formState.errors
            const currentStepErrors = fields.filter(field => errors[field as keyof typeof errors])
            if (currentStepErrors.length > 0) {
                const fieldName = currentStepErrors[0]
                const error = errors[fieldName as keyof typeof errors] as any
                const errorMessage = error?.message || `Please check the fields in ${steps[currentStep].title}`
                ShowToast.error(errorMessage)
            }
        }
    }

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0))
    }

    return (
        <div className="w-full min-w-[800px] max-w-[800px] p-6 space-y-4">
            <div className="border-b pb-3">
                <h2 className="text-xl font-semibold">
                    Motor Detailed Benefits
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Fill in the details below to register a motor Detailed benefits.
                </p>
            </div>
            <div className="flex justify-between items-center mb-6 px-2">
                {steps.map((step, index) => (
                    <div key={index} className="flex flex-col items-center flex-1 relative">
                        {index !== 0 && (
                            <div className={`absolute h-0.5 w-full right-1/2 top-4 -z-10 ${index <= currentStep ? 'bg-[#C20C0C]' : 'bg-gray-200'}`} />
                        )}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${index <= currentStep ? 'bg-[#C20C0C] text-white' : 'bg-gray-100 text-gray-400'}`}>
                            {index + 1}
                        </div>
                        <span className={`text-[10px] mt-2 font-medium ${index <= currentStep ? 'text-[#C20C0C]' : 'text-gray-400'}`}>
                            {step.title}
                        </span>
                    </div>
                ))}
            </div>

            <form onSubmit={form.handleSubmit(onSubmit, onFormError)} className="space-y-4">
                {currentStep === 0 && (
                    <div className="grid gap-4 animate-in fade-in duration-300">
                        <Controller
                            control={form.control}
                            name="coverfor_id"
                            rules={{ required: "Cover Class is required" }}
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
                            rules={{ required: "Cover Type is required" }}
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
                            rules={{ required: "Covering is required" }}
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
                            rules={{ required: "Vehicle Use is required" }}
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
                            rules={{ required: "Vehicle Body Type is required" }}
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
                        <div className="grid grid-cols-2 gap-4">
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
                        </div>
                    </div>
                )}
                {currentStep === 1 && (
                    <div className="grid gap-4 animate-in fade-in duration-300">
                        <div className='flex gap-2 items-end'>
                            <div className="flex-none mb-4">
                                <Controller
                                    control={form.control}
                                    name="is_all_sum"
                                    render={({ field }) => (
                                        <Field orientation="horizontal" className="items-center">
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={(checked) => {
                                                    field.onChange(checked);
                                                    if (checked) {
                                                        form.setValue("valued_from", "");
                                                        form.setValue("valued_to", "");
                                                    }
                                                }}
                                            />
                                            <FieldLabel className="mb-0">All</FieldLabel>
                                        </Field>
                                    )}
                                />
                            </div>
                            <ReuseableInput
                                control={form.control}
                                name="valued_from"
                                type='number'
                                label="Valued From"
                                disabled={form.watch("is_all_sum")}
                                className={`w-full h-[51px] rounded-[5px] border border-[#ADABAB] ${form.watch("is_all_sum") ? "bg-gray-100 opacity-60 cursor-not-allowed" : ""
                                    }`}
                            />
                            <ReuseableInput
                                control={form.control}
                                name="valued_to"
                                type='number'
                                label="Valued To"
                                disabled={form.watch("is_all_sum")}
                                className={`w-full h-[51px] rounded-[5px] border border-[#ADABAB] ${form.watch("is_all_sum") ? "bg-gray-100 opacity-10 cursor-not-allowed" : ""
                                    }`}
                            />
                        </div>

                        <div className='flex gap-2 items-end'>
                            <div className="flex-none mb-4">
                                <Controller
                                    control={form.control}
                                    name="is_all_age"
                                    render={({ field }) => (
                                        <Field orientation="horizontal" className="items-center">
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={(checked) => {
                                                    field.onChange(checked);
                                                    if (checked) {
                                                        form.setValue("age_from", "");
                                                        form.setValue("age_to", "");
                                                    }
                                                }}
                                            />
                                            <FieldLabel className="mb-0">Age</FieldLabel>
                                        </Field>
                                    )}
                                />
                            </div>
                            <ReuseableInput
                                control={form.control}
                                name="age_from"
                                type='number'
                                label="Age From"
                                disabled={form.watch("is_all_age")}
                                className={`w-full h-[51px] rounded-[5px] border border-[#ADABAB] ${form.watch("is_all_age") ? "bg-gray-100 opacity-60" : ""
                                    }`}
                            />
                            <ReuseableInput
                                control={form.control}
                                name="age_to"
                                type='number'
                                label="Age To"
                                disabled={form.watch("is_all_age")}
                                className={`w-full h-[51px] rounded-[5px] border border-[#ADABAB] ${form.watch("is_all_age") ? "bg-gray-100 opacity-60" : ""
                                    }`}
                            />
                        </div>

                        <div className='grid grid-cols-3 gap-2'>
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
                    </div>
                )}
                {currentStep === 2 && (
                    <div className="grid gap-4 animate-in fade-in duration-300">
                        <div className="space-y-3">
                            <FieldLabel className="text-sm font-semibold">Is Fleet?</FieldLabel>
                            <Controller
                                control={form.control}
                                name="is_fleet"
                                render={({ field }) => (
                                    <RadioGroup
                                        value={field.value ? "true" : "false"}
                                        onValueChange={(val) => {
                                            const isFleet = val === "true";
                                            field.onChange(isFleet);
                                            if (!isFleet) {
                                                form.setValue("min_fleet", "");
                                                form.setValue("max_fleet", "");
                                            }
                                        }}
                                        className="flex flex-col gap-3">
                                        <div className="flex items-center gap-3">
                                            <RadioGroupItem value="false" id="fleet-no" />
                                            <FieldLabel htmlFor="fleet-no" className="font-normal">
                                                No (This cover is not applied to fleet of vehicles)
                                            </FieldLabel>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <RadioGroupItem value="true" id="fleet-yes" />
                                            <FieldLabel htmlFor="fleet-yes" className="font-normal">
                                                Yes (These rates applies to fleet of vehicles)
                                            </FieldLabel>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <ReuseableInput
                                control={form.control}
                                name="min_fleet"
                                type='number'
                                label="Min Fleet"
                                disabled={!form.watch("is_fleet")}
                                className={`w-full h-[51px] rounded-[5px] border border-[#ADABAB] ${!form.watch("is_fleet") ? "bg-gray-100 opacity-60 cursor-not-allowed" : ""
                                    }`}
                            />
                            <ReuseableInput
                                control={form.control}
                                name="max_fleet"
                                type='number'
                                label="Max Fleet"
                                disabled={!form.watch("is_fleet")}
                                className={`w-full h-[51px] rounded-[5px] border border-[#ADABAB] ${!form.watch("is_fleet") ? "bg-gray-100 opacity-60 cursor-not-allowed" : ""
                                    }`}
                            />
                        </div>
                    </div>
                )}
                {currentStep === 3 && (
                    <div className="grid gap-4 animate-in fade-in duration-300">
                        <div className="grid gap-4 animate-in fade-in duration-300">

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-3">
                                    <FieldLabel className="text-sm font-semibold">Target Audience ?</FieldLabel>
                                    <Controller
                                        control={form.control}
                                        name="cover_target"
                                        render={({ field }) => (
                                            <RadioGroup
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                className="flex flex-col gap-3">
                                                {CAUDIENCE_OPTIONS.map((option) => (
                                                    <div key={option.value} className="flex items-center gap-3">
                                                        <RadioGroupItem
                                                            value={option.value}
                                                            id={`audience-${option.value}`}
                                                        />
                                                        <FieldLabel
                                                            htmlFor={`audience-${option.value}`} className="font-normal cursor-pointer">
                                                            {option.label}
                                                        </FieldLabel>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        )}
                                    />
                                </div>
                                <ReuseableInput
                                    control={form.control}
                                    name="min_age"
                                    type='number'
                                    label="Owner Min Age"
                                    className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                                />
                                <ReuseableInput
                                    control={form.control}
                                    name="max_age"
                                    type='number'
                                    label="Owner Max Age"
                                    className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <FieldLabel className="text-sm font-semibold">Existing Customer ?</FieldLabel>
                                <Controller
                                    control={form.control}
                                    name="target_audience"
                                    render={({ field }) => (
                                        <RadioGroup
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            className="flex flex-col gap-3">
                                            {TAUDIENCE_OPTIONS.map((option) => (
                                                <div key={option.value} className="flex items-center gap-3">
                                                    <RadioGroupItem
                                                        value={option.value}
                                                        id={`audience-${option.value}`}
                                                    />
                                                    <FieldLabel
                                                        htmlFor={`audience-${option.value}`} className="font-normal cursor-pointer">
                                                        {option.label}
                                                    </FieldLabel>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                )}
                {currentStep === 4 && (
                    <div className="grid gap-4 animate-in fade-in duration-300">
                        <div className="grid grid-cols-2 gap-4">
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
                        </div>
                    </div>
                )}
                {currentStep === 5 && (
                    <div className="grid gap-4 animate-in fade-in duration-300">
                        <Controller
                            control={form.control}
                            name="makemodel_offered"
                            render={({ field }) => (
                                <ReusableApiMultiSelect
                                    url="taxonomies/vehicle/search-make-model"
                                    value={Array.isArray(field.value) ? field.value.map(String) : []}
                                    onChange={(vals) => field.onChange(vals.map(Number).filter(n => !isNaN(n)))}
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
                                    value={Array.isArray(field.value) ? field.value.map(String) : []}
                                    onChange={(vals) => field.onChange(vals.map(Number).filter(n => !isNaN(n)))}
                                    label="Make and Model Not Offered (Optional)"
                                    placeholder="Select Make and Model Not Offered..."
                                />
                            )}
                        />
                    </div>
                )}

                <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 mt-8 px-0">
                    <div className="flex gap-3">
                        {currentStep === 0 ? (
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full sm:w-auto rounded-full border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
                                onClick={() => handleDialogContextSwitch({})}>
                                Cancel
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full sm:w-auto rounded-full border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
                                onClick={prevStep}>
                                Previous
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-3">
                        {currentStep < steps.length - 1 ? (
                            <Button
                                type="button"
                                className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-full hover:bg-[#C20C0C]"
                                onClick={nextStep}>
                                Next
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-full hover:bg-[#C20C0C]"
                                loading={submitMutation.isPending}>
                                Save Details
                            </Button>
                        )}
                    </div>
                </CardFooter>
            </form>
        </div>
    )
}
