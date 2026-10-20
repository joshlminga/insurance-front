/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Button,
  ReusableSingleSelectApiInput,
  ReuseableInput,
} from "@/dev/core"
import { UseApiMutation, UseApiQuery } from "@/hooks/hooks"
import { TravelBenefitSchema } from "@/types/form-schema"
import type { TravelBenefitFormValues } from "@/types/schema"
import { SubmitResponse } from "@/types/types"
import { EMETHODS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import {
  buildTravelBenefitUpdatePayload,
  emptyTravelBenefitFormValues,
  mapTravelBenefitSelectLabels,
  mapTravelBenefitToFormValues,
} from "../travel-benefit-form-utils"

const inputClass = "w-full h-10 rounded-[5px] border border-[#ADABAB]"
const listQuery = { per_page: 100, is_active: true }

/**
 * Edit a single benefit for the product in the URL.
 * product_travel_ids is always [productId] — no product multi-select.
 */
export const EditTravelBenefitModal = ({
  handleDialogContextSwitch,
  componentProps,
}: {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: any
}) => {
  const benefitId = componentProps?.data?.id
  const productId = componentProps?.productId
  const productName: string =
    componentProps?.productName ||
    (productId ? `Product #${productId}` : "Travel product")

  const form = useForm<TravelBenefitFormValues>({
    resolver: zodResolver(TravelBenefitSchema),
    defaultValues: emptyTravelBenefitFormValues(),
  })

  const { data, isLoading } = UseApiQuery<SubmitResponse>({
    url: `products/travel/benefits/${benefitId}`,
    queryOptions: {
      enabled: Boolean(benefitId),
    },
  })

  // Show returns benefitToArray at data root (not nested under data.benefit).
  const benefitRow = useMemo(() => {
    if (data?.data && typeof data.data === "object" && data.data.id != null) {
      return data.data as Record<string, unknown>
    }
    return (componentProps?.data ?? null) as Record<string, unknown> | null
  }, [data, componentProps?.data])

  const selected = benefitRow ? mapTravelBenefitSelectLabels(benefitRow) : {}

  useEffect(() => {
    if (benefitRow) {
      form.reset(mapTravelBenefitToFormValues(benefitRow))
    }
  }, [benefitRow, form])

  const submitMutation = UseApiMutation<
    SubmitResponse,
    ReturnType<typeof buildTravelBenefitUpdatePayload>
  >({
    url: `products/travel/benefits/${benefitId}`,
    method: EMETHODS.PATCH,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response.message || "Benefit updated successfully")
        componentProps?.refetch?.()
        handleDialogContextSwitch({ refetch: true })
      },
      onError: (error: unknown) => {
        ShowToast.error(extractErrorMessage(error) || "Update failed")
      },
    },
  })

  const onSubmit = (values: TravelBenefitFormValues) => {
    if (!benefitId) {
      ShowToast.error("Missing benefit id")
      return
    }
    if (!productId) {
      ShowToast.error("Missing product id")
      return
    }
    submitMutation.mutate(buildTravelBenefitUpdatePayload(values, productId))
  }

  return (
    <div className="w-full min-w-[560px] max-w-[640px] max-h-[85vh] overflow-y-auto p-6 space-y-6">
      <div className="border-b pb-3">
        <h2 className="text-xl font-semibold">Edit Travel Benefit</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Update benefit / excess text for this product. Provide at least one.
        </p>
      </div>
      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading benefit...</div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          {/* Display-only: product is fixed from the URL, not editable. */}
          <div className="space-y-2">
            <Label htmlFor="travel-benefit-edit-product">Product</Label>
            <Input
              id="travel-benefit-edit-product"
              value={productName}
              disabled
              className={inputClass}
            />
          </div>

          <Controller
            control={form.control}
            name="common_id"
            render={({ field }) => (
              <ReusableSingleSelectApiInput
                url="travel/benefit-common"
                queryParams={listQuery}
                value={field.value}
                onChange={field.onChange}
                label="Common benefit"
                required
                selectedOption={selected.common}
                placeholder="Select common benefit..."
                searchPlaceholder="Search common benefits..."
                emptyMessage="No common benefits found"
              />
            )}
          />
          {form.formState.errors.common_id?.message ? (
            <p className="text-sm text-red-500">{form.formState.errors.common_id.message}</p>
          ) : null}

          <Controller
            control={form.control}
            name="section_id"
            render={({ field }) => (
              <ReusableSingleSelectApiInput
                url="travel/benefit-section"
                queryParams={listQuery}
                value={field.value}
                onChange={field.onChange}
                label="Section"
                required
                selectedOption={selected.section}
                placeholder="Select section..."
                searchPlaceholder="Search sections..."
                emptyMessage="No sections found"
              />
            )}
          />
          {form.formState.errors.section_id?.message ? (
            <p className="text-sm text-red-500">{form.formState.errors.section_id.message}</p>
          ) : null}

          <ReuseableInput
            control={form.control}
            name="name"
            label="Name override (optional)"
            className={inputClass}
          />
          <ReuseableInput
            control={form.control}
            name="benefit"
            type="textarea"
            label="Benefit"
            className={inputClass}
          />
          <ReuseableInput
            control={form.control}
            name="excess"
            label="Excess"
            className={inputClass}
          />
          {form.formState.errors.benefit?.message ? (
            <p className="text-sm text-red-500">{form.formState.errors.benefit.message}</p>
          ) : null}

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
              Save changes
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
