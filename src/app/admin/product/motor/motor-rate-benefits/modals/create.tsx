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

export const CreateMotorRateBenefitModal = ({
  handleDialogContextSwitch,
  componentProps,
}: {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: any
}) => {
  const rateId = componentProps?.rateId
  const rateLabel: string =
    componentProps?.rateLabel || (rateId ? `Rate #${rateId}` : "Motor rate")

  const form = useForm<CreateMotorRateExcessBenefitsFormValues>({
    resolver: zodResolver(CreateMotorRateExcessBenefitsSchema),
    defaultValues: {
      ...emptyMotorRateBenefitFormValues(),
      product_rate_id: rateId ? String(rateId) : "",
    },
  })

  const submitMutation = UseApiMutation<
    SubmitResponse,
    ReturnType<typeof buildMotorRateBenefitPayload>
  >({
    url: `products/motor/rate-details/${rateId}`,
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (data) => {
        ShowToast.success(data.message || "Benefit detail created successfully")
        form.reset()
        componentProps?.refetch?.()
        handleDialogContextSwitch({ refetch: true })
      },
      onError: (error: unknown) => {
        ShowToast.error(extractErrorMessage(error) || "Create failed")
      },
    },
  })

  const onSubmit = (values: CreateMotorRateExcessBenefitsFormValues) => {
    if (!rateId) {
      ShowToast.error("Missing rate id")
      return
    }
    submitMutation.mutate(buildMotorRateBenefitPayload(values))
  }

  return (
    <div className="w-full min-w-[560px] max-w-[640px] max-h-[85vh] overflow-y-auto p-6 space-y-6">
      <div className="border-b pb-3">
        <h2 className="text-xl font-semibold">Add Rate Benefit</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Attach a motor common benefit (taxonomy) to this rate with a key/value
          detail.
        </p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="motor-rate-benefit-create-rate">Rate</Label>
          <Input
            id="motor-rate-benefit-create-rate"
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
            Save
          </Button>
        </div>
      </form>
    </div>
  )
}
