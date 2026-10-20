/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Button,
  ReusableSelect,
  ReusableSingleSelectApiInput,
  ReuseableInput,
} from "@/dev/core"
import { UseApiMutation } from "@/hooks/hooks"
import { CreateMotorRateExcessBenefitsSchema } from "@/types/form-schema"
import type { CreateMotorRateExcessBenefitsFormValues } from "@/types/schema"
import { SubmitResponse } from "@/types/types"
import {
  DETAILEDTYPESOPTIONS,
  EMETHODS,
  HIGHLIGHTOPTIONS,
} from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import {
  buildMotorRateBenefitPayload,
  emptyMotorRateBenefitFormValues,
} from "../motor-rate-benefit-form-utils"

const inputClass = "w-full h-10 rounded-[5px] border border-[#ADABAB]"

export const EditMotorRateBenefitModal = ({
  handleDialogContextSwitch,
  componentProps,
}: {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: any
}) => {
  const detail = componentProps?.data ?? {}
  const detailId = detail?.id
  const rateId = componentProps?.rateId ?? detail?.product_rate_id
  const rateLabel: string =
    componentProps?.rateLabel || (rateId ? `Rate #${rateId}` : "Motor rate")

  const form = useForm<CreateMotorRateExcessBenefitsFormValues>({
    resolver: zodResolver(CreateMotorRateExcessBenefitsSchema),
    defaultValues: {
      ...emptyMotorRateBenefitFormValues(),
      detail_benefit_id: String(detail?.common_benefit_id ?? detail?.detail_benefit_id ?? ""),
      detail_type: detail?.detail_type ?? "Benefit",
      key: detail?.key ?? "",
      value: detail?.value ?? "",
      detail_highlight:
        detail?.detail_highlight === true || detail?.detail_highlight === 1 || detail?.detail_highlight === "1"
          ? "true"
          : "false",
      product_rate_id: rateId ? String(rateId) : "",
    },
  })

  const submitMutation = UseApiMutation<
    SubmitResponse,
    ReturnType<typeof buildMotorRateBenefitPayload>
  >({
    url: `products/motor/rate-details/${detailId}`,
    method: EMETHODS.PATCH,
    mutationOptions: {
      onSuccess: (data) => {
        ShowToast.success(data.message || "Benefit detail updated successfully")
        componentProps?.refetch?.()
        handleDialogContextSwitch({ refetch: true })
      },
      onError: (error: unknown) => {
        ShowToast.error(extractErrorMessage(error) || "Update failed")
      },
    },
  })

  const onSubmit = (values: CreateMotorRateExcessBenefitsFormValues) => {
    if (!detailId) {
      ShowToast.error("Missing detail id")
      return
    }
    submitMutation.mutate(buildMotorRateBenefitPayload(values))
  }

  const selectedBenefit =
    detail?.common_benefit?.id != null
      ? {
          value: String(detail.common_benefit.id),
          label: String(detail.common_benefit.name ?? detail.common_benefit.id),
        }
      : undefined

  return (
    <div className="w-full min-w-[560px] max-w-[640px] max-h-[85vh] overflow-y-auto p-6 space-y-6">
      <div className="border-b pb-3">
        <h2 className="text-xl font-semibold">Edit Rate Benefit</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Update the common benefit, type, key, and optional value for this rate.
        </p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="motor-rate-benefit-edit-rate">Rate</Label>
          <Input
            id="motor-rate-benefit-edit-rate"
            value={rateLabel}
            disabled
            className={inputClass}
          />
        </div>

        <Controller
          control={form.control}
          name="detail_benefit_id"
          render={({ field }) => (
            <ReusableSingleSelectApiInput
              url="motor/detail-benefit"
              queryParams={{ is_active: true, per_page: 100 }}
              value={field.value}
              onChange={field.onChange}
              label="Common benefit"
              required
              selectedOption={selectedBenefit}
              placeholder="Select common benefit..."
              searchPlaceholder="Search benefits..."
              emptyMessage="No common benefits found"
            />
          )}
        />
        {form.formState.errors.detail_benefit_id?.message ? (
          <p className="text-sm text-red-500">
            {form.formState.errors.detail_benefit_id.message}
          </p>
        ) : null}

        <ReusableSelect
          control={form.control}
          name="detail_type"
          label="Detail type"
          required
          options={DETAILEDTYPESOPTIONS}
        />
        <ReuseableInput
          control={form.control}
          name="key"
          label="Key"
          required
          className={inputClass}
        />
        <ReuseableInput
          control={form.control}
          name="value"
          label="Value (optional)"
          className={inputClass}
        />
        <ReusableSelect
          control={form.control}
          name="detail_highlight"
          label="Highlight"
          options={HIGHLIGHTOPTIONS}
        />

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
    </div>
  )
}
