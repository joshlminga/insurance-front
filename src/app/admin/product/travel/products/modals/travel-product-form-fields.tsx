import { FieldLabel } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Button,
  ReusableSelect,
  ReusableSingleSelectApiInput,
  ReuseableInput,
} from "@/dev/core"
import type { TravelProductFormValues } from "@/types/schema"
import { EORGANIZATIONTYPES } from "@/utils/constatnts"
import { TRAVEL_BOUND, TRAVEL_BOUND_OPTIONS } from "@/utils/travel-enums"
import { Controller, useFieldArray, type Control, type UseFormReturn } from "react-hook-form"
import type { TravelProductSelectLabels } from "./travel-product-form-utils"

/** Static Inbound/Outbound options for the product coverage Bound select. */
const boundSelectOptions = TRAVEL_BOUND_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}))

const inputClass = "w-full h-10 rounded-[5px] border border-[#ADABAB]"

/** Card around sections that grow with + / − rows so they read as one block. */
const addonSectionCardClass =
  "space-y-3 rounded-[5px] border border-[#ADABAB] bg-muted/30 p-3"

/** Primary add action (e.g. Add organization) — red outline so it stands out. */
const addActionButtonClass =
  "rounded-sm border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"

/** + adds another row — dark outline. */
const addRowButtonClass =
  "h-10 w-10 shrink-0 p-0 rounded-sm border border-[#333333] text-[#333333] bg-transparent hover:bg-[#333333]/10"

/** − removes a row — red outline. */
const removeRowButtonClass =
  "h-10 w-10 shrink-0 p-0 rounded-sm border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"

const listQuery = { per_page: 100 }

type TravelProductFormFieldsProps = {
  form: UseFormReturn<TravelProductFormValues>
  selected?: TravelProductSelectLabels
}

/** Yes/No radio that keeps form values as "true" / "false" strings. */
function YesNoRadio({
  control,
  name,
  label,
}: {
  control: Control<TravelProductFormValues>
  name:
    | "for_public"
    | "levy_applied"
    | "has_rules"
    | "quotation_api"
    | "policy_api"
    | "payment_api"
    | "certificate_api"
  label: string
}) {
  const yesId = `${name}-yes`
  const noId = `${name}-no`

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

export const TravelProductFormFields = ({
  form,
  selected,
}: TravelProductFormFieldsProps) => {
  const { fields: coverageFields, append: appendCoverage, remove: removeCoverage } =
    useFieldArray({
      control: form.control,
      name: "coverages",
    })

  const { fields: targetFields, append: appendTarget, remove: removeTarget } =
    useFieldArray({
      control: form.control,
      name: "organization_location_ids",
    })

  // for_public "true" means everyone can see the product (public).
  // "false" means private: we optionally ask which organizations can see it.
  const isPublicProduct = form.watch("for_public") === "true"

  // Parent question. The four API radios below only render when this is Yes.
  // When it is No, those inputs stay in the form but are not shown, and the
  // submit helper sends has_rules: false plus all four API flags as false.
  const productHasRules = form.watch("has_rules") === "true"

  const targetListError = form.formState.errors.organization_location_ids?.message
    ?? form.formState.errors.organization_location_ids?.root?.message
  const coverageListError = form.formState.errors.coverages?.message
    ?? form.formState.errors.coverages?.root?.message

  return (
    <>
      <Controller
        control={form.control}
        name="organization_location_id"
        render={({ field }) => (
          <ReusableSingleSelectApiInput
            url="organization-location"
            queryParams={{
              organization_type: EORGANIZATIONTYPES.INSURER,
              ...listQuery,
            }}
            value={field.value}
            onChange={field.onChange}
            valueKey="organization_location_id"
            labelKey="organization_name"
            label="Insurer Name"
            required
            placeholder="Select insurer..."
            searchPlaceholder="Search insurer..."
            emptyMessage="No insurers found"
            selectedOption={selected?.insurer}
          />
        )}
      />
      {form.formState.errors.organization_location_id?.message ? (
        <p className="text-sm text-red-500">
          {form.formState.errors.organization_location_id.message}
        </p>
      ) : null}

      <ReuseableInput
        control={form.control}
        name="name"
        label="Product Name"
        required
        className={inputClass}
      />
      <ReuseableInput
        control={form.control}
        name="officename"
        label="Office Name (optional)"
        className={inputClass}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <YesNoRadio
          control={form.control}
          name="for_public"
          label="Public Product (Accessible by All)"
        />
        <YesNoRadio
          control={form.control}
          name="levy_applied"
          label="Levy Applied"
        />
      </div>

      {!isPublicProduct ? (
        <div className={addonSectionCardClass}>
          <p className="text-sm font-medium">Target Organizations</p>
          <p className="text-xs text-muted-foreground">
            Optional. Leave empty for none. Insurers are not listed here.
          </p>
          {targetFields.length === 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={addActionButtonClass}
              onClick={() => appendTarget({ organization_location_id: "" })}>
              + Add organization
            </Button>
          ) : null}
          {targetFields.map((item, index) => (
            <div key={item.id} className="flex items-end gap-2">
              <div className="flex-1">
                <Controller
                  control={form.control}
                  name={`organization_location_ids.${index}.organization_location_id`}
                  render={({ field }) => (
                    <ReusableSingleSelectApiInput
                      url="organization-location"
                      queryParams={{
                        exclude_organization_type: EORGANIZATIONTYPES.INSURER,
                        ...listQuery,
                      }}
                      value={field.value}
                      onChange={field.onChange}
                      valueKey="organization_location_id"
                      labelKey="organization_name"
                      label={index === 0 ? undefined : `Organization ${index + 1}`}
                      placeholder="Select organization..."
                      searchPlaceholder="Search organization..."
                      emptyMessage="No organizations found"
                      selectedOption={
                        field.value && selected?.targets[field.value]
                          ? { value: field.value, label: selected.targets[field.value] }
                          : undefined
                      }
                    />
                  )}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={addRowButtonClass}
                onClick={() => appendTarget({ organization_location_id: "" })}>
                +
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={removeRowButtonClass}
                onClick={() => removeTarget(index)}>
                -
              </Button>
            </div>
          ))}
          {targetListError ? (
            <p className="text-sm text-red-500">{targetListError}</p>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Controller
          control={form.control}
          name="currency"
          render={({ field }) => (
            <ReusableSingleSelectApiInput
              url="atu/multicurrency/currencies"
              queryParams={listQuery}
              value={field.value}
              onChange={field.onChange}
              valueKey="id"
              labelKey="code"
              label="Currency"
              placeholder="Select currency..."
              searchPlaceholder="Search currency..."
              emptyMessage="No currencies found"
              selectedOption={selected?.currency}
            />
          )}
        />
        <ReuseableInput
          control={form.control}
          name="start_date"
          label="Start Date"
          type="date"
          className={inputClass}
        />
        <ReuseableInput
          control={form.control}
          name="expiry_date"
          label="Expiry Date"
          type="date"
          className={inputClass}
        />
      </div>

      <div className={addonSectionCardClass}>
        <p className="text-sm font-medium">
          Coverages
          <span className="ml-1 text-red-500">*</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Add at least one coverage and whether it is Inbound or Outbound.
        </p>
        {coverageFields.map((item, index) => (
          <div key={item.id} className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <Controller
                control={form.control}
                name={`coverages.${index}.coverage_id`}
                render={({ field }) => (
                  <ReusableSingleSelectApiInput
                    url="travel/coverage"
                    queryParams={listQuery}
                    value={field.value}
                    onChange={field.onChange}
                    valueKey="id"
                    labelKey="name"
                    label={index === 0 ? "Coverage" : `Coverage ${index + 1}`}
                    required
                    placeholder="Select coverage..."
                    searchPlaceholder="Search coverage..."
                    emptyMessage="No coverages found"
                    selectedOption={
                      field.value && selected?.coverages[field.value]
                        ? { value: field.value, label: selected.coverages[field.value] }
                        : undefined
                    }
                  />
                )}
              />
              {form.formState.errors.coverages?.[index]?.coverage_id?.message ? (
                <p className="mt-1 text-sm text-red-500">
                  {form.formState.errors.coverages[index]?.coverage_id?.message}
                </p>
              ) : null}
            </div>
            <div className="w-40 shrink-0">
              {/* Bound is a fixed enum (Inbound | Outbound), not an API lookup. */}
              <ReusableSelect
                control={form.control}
                name={`coverages.${index}.bound_type`}
                label={index === 0 ? "Bound" : " "}
                required
                placeholder="Select bound..."
                options={boundSelectOptions}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={addRowButtonClass}
              onClick={() =>
                appendCoverage({ coverage_id: "", bound_type: TRAVEL_BOUND.Outbound })
              }>
              +
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={coverageFields.length === 1}
              className={removeRowButtonClass}
              onClick={() => removeCoverage(index)}>
              -
            </Button>
          </div>
        ))}
        {coverageListError ? (
          <p className="text-sm text-red-500">{coverageListError}</p>
        ) : null}
      </div>

      <YesNoRadio
        control={form.control}
        name="has_rules"
        label="Does Product Have Rules?"
      />
      <p className="text-xs text-muted-foreground">
        Yes means this product uses the insurer APIs. No keeps those questions hidden.
      </p>

      {productHasRules ? (
        <div className="space-y-4 rounded-[5px] border border-[#ADABAB] p-3">
          <p className="text-xs text-muted-foreground">
            Choose which insurer APIs this product uses. No means that API is not used.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <YesNoRadio
              control={form.control}
              name="quotation_api"
              label="Quotation API"
            />
            <YesNoRadio
              control={form.control}
              name="policy_api"
              label="Policy API"
            />
            <YesNoRadio
              control={form.control}
              name="payment_api"
              label="Payment API"
            />
            <YesNoRadio
              control={form.control}
              name="certificate_api"
              label="Certificate API"
            />
          </div>
        </div>
      ) : null}
    </>
  )
}
