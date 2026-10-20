import { FieldLabel } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button, ReusableSelect, ReuseableInput } from "@/dev/core"
import type { TravelRateGroupFormValues } from "@/types/schema"
import {
  TRAVEL_AS_OPTIONS,
  TRAVEL_BILLING_OPTIONS,
  TRAVEL_CHARGED_OPTIONS,
  TRAVEL_TRIP_OPTIONS,
} from "@/utils/travel-enums"
import { Controller, useFieldArray, type Control, type UseFormReturn } from "react-hook-form"
import { emptyTravelRateRow } from "../travel-rate-form-utils"

const inputClass = "w-full h-10 rounded-[5px] border border-[#ADABAB]"

const addonSectionCardClass =
  "space-y-3 rounded-[5px] border border-[#ADABAB] bg-muted/30 p-3"

const addRowButtonClass =
  "h-10 w-10 shrink-0 p-0 rounded-sm border border-[#333333] text-[#333333] bg-transparent hover:bg-[#333333]/10"

const removeRowButtonClass =
  "h-10 w-10 shrink-0 p-0 rounded-sm border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"

const planOptions = TRAVEL_AS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))
const chargedOptions = TRAVEL_CHARGED_OPTIONS.map((o) => ({ value: o.value, label: o.label }))
const billingOptions = TRAVEL_BILLING_OPTIONS.map((o) => ({ value: o.value, label: o.label }))
const tripOptions = TRAVEL_TRIP_OPTIONS.map((o) => ({ value: o.value, label: o.label }))

function YesNoRadio({
  control,
  name,
  label,
}: {
  control: Control<TravelRateGroupFormValues>
  name: "is_maintenance" | `rates.${number}.is_active`
  label: string
}) {
  const yesId = `${String(name)}-yes`
  const noId = `${String(name)}-no`

  return (
    <div className="space-y-2">
      <FieldLabel className="text-sm font-medium">{label}</FieldLabel>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <RadioGroup
            value={field.value}
            onValueChange={field.onChange}
            className="flex flex-row flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="true" id={yesId} />
              <FieldLabel htmlFor={yesId} className="font-normal">
                Yes
              </FieldLabel>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="false" id={noId} />
              <FieldLabel htmlFor={noId} className="font-normal">
                No
              </FieldLabel>
            </div>
          </RadioGroup>
        )}
      />
    </div>
  )
}

type TravelRateFormFieldsProps = {
  form: UseFormReturn<TravelRateGroupFormValues>
}

/**
 * Shared create/edit fields for a rate group + nested day-band rows.
 * + / − on each band matches the coverage rows on the travel product form.
 */
export const TravelRateFormFields = ({ form }: TravelRateFormFieldsProps) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rates",
  })

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ReusableSelect
          control={form.control}
          name="plan"
          label="Plan"
          required
          options={planOptions}
          className="w-full"
          triggerClassName={inputClass}
        />
        <ReusableSelect
          control={form.control}
          name="charged"
          label="Charged"
          required
          options={chargedOptions}
          className="w-full"
          triggerClassName={inputClass}
        />
        <ReusableSelect
          control={form.control}
          name="billing"
          label="Billing"
          required
          options={billingOptions}
          className="w-full"
          triggerClassName={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ReuseableInput
          control={form.control}
          name="min_age"
          label="Min age"
          type="number"
          className={inputClass}
        />
        <ReuseableInput
          control={form.control}
          name="max_age"
          label="Max age"
          type="number"
          className={inputClass}
        />
        <ReuseableInput
          control={form.control}
          name="min_member"
          label="Min members"
          type="number"
          className={inputClass}
        />
        <ReuseableInput
          control={form.control}
          name="max_member"
          label="Max members"
          type="number"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ReuseableInput
          control={form.control}
          name="start_date"
          label="Start date"
          type="date"
          className={inputClass}
        />
        <ReuseableInput
          control={form.control}
          name="expiry_date"
          label="Expiry date"
          type="date"
          className={inputClass}
        />
      </div>

      <YesNoRadio control={form.control} name="is_maintenance" label="Maintenance" />

      <div className={addonSectionCardClass}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">Rate bands (days / trip / premium)</p>
          <Button
            type="button"
            className={addRowButtonClass}
            onClick={() => append(emptyTravelRateRow())}>
            +
          </Button>
        </div>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 gap-3 rounded-[5px] border border-[#ADABAB]/60 p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-muted-foreground">Band {index + 1}</p>
              <Button
                type="button"
                className={removeRowButtonClass}
                disabled={fields.length <= 1}
                onClick={() => remove(index)}>
                −
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ReuseableInput
                control={form.control}
                name={`rates.${index}.min_days`}
                label="Min days"
                type="number"
                className={inputClass}
              />
              <ReuseableInput
                control={form.control}
                name={`rates.${index}.max_days`}
                label="Max days"
                type="number"
                className={inputClass}
              />
              <ReusableSelect
                control={form.control}
                name={`rates.${index}.trip`}
                label="Trip"
                required
                options={tripOptions}
                className="w-full"
                triggerClassName={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ReuseableInput
                control={form.control}
                name={`rates.${index}.premium`}
                label="Premium"
                type="number"
                className={inputClass}
              />
              <ReuseableInput
                control={form.control}
                name={`rates.${index}.minimum`}
                label="Minimum"
                type="number"
                className={inputClass}
              />
              <ReuseableInput
                control={form.control}
                name={`rates.${index}.loading`}
                label="Loading"
                className={inputClass}
              />
            </div>

            <ReuseableInput
              control={form.control}
              name={`rates.${index}.description`}
              label="Description"
              className={inputClass}
            />

            <YesNoRadio
              control={form.control}
              name={`rates.${index}.is_active`}
              label="Rate active"
            />
          </div>
        ))}

        {form.formState.errors.rates?.message ? (
          <p className="text-sm text-red-500">{form.formState.errors.rates.message}</p>
        ) : null}
        {form.formState.errors.rates?.root?.message ? (
          <p className="text-sm text-red-500">{form.formState.errors.rates.root.message}</p>
        ) : null}
      </div>
    </div>
  )
}
