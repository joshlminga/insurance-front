/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Button,
  ReusableSingleSelectApiInput,
  ReuseableInput,
} from "@/dev/core"
import { UseApiMutation } from "@/hooks/hooks"
import { TravelBenefitCreateSchema } from "@/types/form-schema"
import type { TravelBenefitCreateFormValues } from "@/types/schema"
import { SubmitResponse } from "@/types/types"
import { EMETHODS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import {
  buildTravelBenefitCreatePayload,
  emptyTravelBenefitCreateFormValues,
  emptyTravelBenefitRow,
} from "../travel-benefit-form-utils"

const inputClass = "w-full h-10 rounded-[5px] border border-[#ADABAB]"
const listQuery = { per_page: 100, is_active: true }

const addonSectionCardClass =
  "space-y-3 rounded-[5px] border border-[#ADABAB] bg-muted/30 p-3"

const addRowButtonClass =
  "h-10 w-10 shrink-0 p-0 rounded-sm border border-[#333333] text-[#333333] bg-transparent hover:bg-[#333333]/10"

const removeRowButtonClass =
  "h-10 w-10 shrink-0 p-0 rounded-sm border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"

/**
 * Create one or more benefit rows for the product in the URL.
 * Multiple rows go in benefits[] and share one group_number on the API.
 */
export const CreateTravelBenefitModal = ({
  handleDialogContextSwitch,
  componentProps,
}: {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: any
}) => {
  // productId comes from travel-benefits/:productId (same pattern as rates).
  const productId = componentProps?.productId
  const productName: string =
    componentProps?.productName ||
    (productId ? `Product #${productId}` : "Travel product")

  const form = useForm<TravelBenefitCreateFormValues>({
    resolver: zodResolver(TravelBenefitCreateSchema),
    defaultValues: emptyTravelBenefitCreateFormValues(),
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "benefits",
  })

  const submitMutation = UseApiMutation<
    SubmitResponse,
    ReturnType<typeof buildTravelBenefitCreatePayload>
  >({
    url: "products/travel/benefits",
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (data) => {
        ShowToast.success(data.message || "Benefit created successfully")
        form.reset()
        componentProps?.refetch?.()
        handleDialogContextSwitch({ refetch: true })
      },
      onError: (error: unknown) => {
        ShowToast.error(extractErrorMessage(error) || "Create failed")
      },
    },
  })

  const onSubmit = (values: TravelBenefitCreateFormValues) => {
    if (!productId) {
      ShowToast.error("Missing product id")
      return
    }
    submitMutation.mutate(buildTravelBenefitCreatePayload(values, productId))
  }

  return (
    <div className="w-full min-w-[560px] max-w-[720px] max-h-[85vh] overflow-y-auto p-6 space-y-6">
      <div className="border-b pb-3">
        <h2 className="text-xl font-semibold">Add Travel Benefit</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Link common / section catalogs to this product. Add multiple rows to
          share one group.
        </p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Display-only: product is fixed from the URL, not editable. */}
        <div className="space-y-2">
          <Label htmlFor="travel-benefit-create-product">Product</Label>
          <Input
            id="travel-benefit-create-product"
            value={productName}
            disabled
            className={inputClass}
          />
        </div>

        <div className={addonSectionCardClass}>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Benefit rows</p>
            <Button
              type="button"
              className={addRowButtonClass}
              onClick={() => append(emptyTravelBenefitRow())}>
              +
            </Button>
          </div>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-3 rounded-[5px] border border-[#ADABAB]/60 p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-muted-foreground">Row {index + 1}</p>
                <Button
                  type="button"
                  className={removeRowButtonClass}
                  disabled={fields.length <= 1}
                  onClick={() => remove(index)}>
                  −
                </Button>
              </div>

              <Controller
                control={form.control}
                name={`benefits.${index}.common_id`}
                render={({ field: selectField }) => (
                  <ReusableSingleSelectApiInput
                    url="travel/benefit-common"
                    queryParams={listQuery}
                    value={selectField.value}
                    onChange={selectField.onChange}
                    label="Common benefit"
                    required
                    placeholder="Select common benefit..."
                    searchPlaceholder="Search common benefits..."
                    emptyMessage="No common benefits found"
                  />
                )}
              />
              {form.formState.errors.benefits?.[index]?.common_id?.message ? (
                <p className="text-sm text-red-500">
                  {form.formState.errors.benefits[index]?.common_id?.message}
                </p>
              ) : null}

              <Controller
                control={form.control}
                name={`benefits.${index}.section_id`}
                render={({ field: selectField }) => (
                  <ReusableSingleSelectApiInput
                    url="travel/benefit-section"
                    queryParams={listQuery}
                    value={selectField.value}
                    onChange={selectField.onChange}
                    label="Section"
                    required
                    placeholder="Select section..."
                    searchPlaceholder="Search sections..."
                    emptyMessage="No sections found"
                  />
                )}
              />
              {form.formState.errors.benefits?.[index]?.section_id?.message ? (
                <p className="text-sm text-red-500">
                  {form.formState.errors.benefits[index]?.section_id?.message}
                </p>
              ) : null}

              <ReuseableInput
                control={form.control}
                name={`benefits.${index}.name`}
                label="Name override (optional)"
                className={inputClass}
              />
              <ReuseableInput
                control={form.control}
                name={`benefits.${index}.benefit`}
                type="textarea"
                label="Benefit"
                className={inputClass}
              />
              <ReuseableInput
                control={form.control}
                name={`benefits.${index}.excess`}
                label="Excess"
                className={inputClass}
              />
              {form.formState.errors.benefits?.[index]?.benefit?.message ? (
                <p className="text-sm text-red-500">
                  {form.formState.errors.benefits[index]?.benefit?.message}
                </p>
              ) : null}
            </div>
          ))}

          {form.formState.errors.benefits?.message ? (
            <p className="text-sm text-red-500">
              {form.formState.errors.benefits.message}
            </p>
          ) : null}
          {form.formState.errors.benefits?.root?.message ? (
            <p className="text-sm text-red-500">
              {form.formState.errors.benefits.root.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-2">
          <Button
            type="button"
            className="w-full sm:w-auto rounded-sm border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
            onClick={() => handleDialogContextSwitch({})}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-sm hover:bg-[#C20C0C]"
            loading={submitMutation.isPending}>
            Save
          </Button>
        </div>
      </form>
    </div>
  )
}
