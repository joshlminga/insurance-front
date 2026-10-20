/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ReusableSelect, ReuseableInput } from "@/dev/core"
import { UseApiMutation } from "@/hooks/hooks"
import { TravelBenefitCommonSchema } from "@/types/form-schema"
import type { TravelBenefitCommonFormValues } from "@/types/schema"
import { SubmitResponse } from "@/types/types"
import { EMETHODS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import {
  TRAVEL_BENEFIT_SHOW_IN_OPTIONS,
  TRAVEL_BENEFIT_TYPE_OPTIONS,
} from "@/utils/travel-enums"
import { ShowToast } from "@/utils/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import {
  extractServerFieldErrors,
  findDuplicateTaxonomyName,
  findDuplicateTaxonomyTitle,
} from "../../taxonomy-uniqueness"
import {
  buildTravelBenefitCommonPayload,
  emptyTravelBenefitCommonFormValues,
  mapTravelBenefitCommonToFormValues,
} from "../travel-benefit-common-form-utils"

const typeSelectOptions = TRAVEL_BENEFIT_TYPE_OPTIONS.map((o) => ({
  value: o.value,
  label: o.label,
}))

const showInSelectOptions = TRAVEL_BENEFIT_SHOW_IN_OPTIONS.map((o) => ({
  value: o.value,
  label: o.label,
}))

const inputClass = "w-full h-10 rounded-[5px] border border-[#ADABAB]"

export const EditTravelBenefitCommonModal = ({
  handleDialogContextSwitch,
  componentProps,
}: {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: any
}) => {
  const row = (componentProps?.data ?? {}) as Record<string, unknown>
  const commonId = row?.id
  const [checking, setChecking] = useState(false)

  const form = useForm<TravelBenefitCommonFormValues>({
    resolver: zodResolver(TravelBenefitCommonSchema),
    defaultValues: {
      ...emptyTravelBenefitCommonFormValues(),
      ...mapTravelBenefitCommonToFormValues(row),
    },
  })

  const submitMutation = UseApiMutation<
    SubmitResponse,
    ReturnType<typeof buildTravelBenefitCommonPayload>
  >({
    url: `travel/benefit-common/${commonId}`,
    method: EMETHODS.PATCH,
    mutationOptions: {
      onSuccess: (data) => {
        ShowToast.success(data.message || "Common benefit updated successfully")
        form.reset()
        componentProps?.refetch?.()
        handleDialogContextSwitch({ refetch: true })
      },
      onError: (error: unknown) => {
        const fieldErrors = extractServerFieldErrors(error)
        fieldErrors.forEach(({ name, message }) => {
          form.setError(name as keyof TravelBenefitCommonFormValues, {
            type: "server",
            message,
          })
        })
        ShowToast.error(
          fieldErrors.length > 0
            ? "Please check the highlighted fields."
            : extractErrorMessage(error) || "Update failed"
        )
      },
    },
  })

  const onSubmit = async (values: TravelBenefitCommonFormValues) => {
    form.clearErrors(["name", "title"])
    setChecking(true)
    try {
      const nameTaken = await findDuplicateTaxonomyName({
        url: "travel/benefit-common",
        name: values.name,
        ignoreId: commonId as string | number | undefined,
      })
      if (nameTaken) {
        form.setError("name", {
          type: "duplicate",
          message: "A common benefit with this short title already exists.",
        })
        return
      }

      if (values.title?.trim()) {
        const titleTaken = await findDuplicateTaxonomyTitle({
          url: "travel/benefit-common",
          title: values.title,
          ignoreId: commonId as string | number | undefined,
        })
        if (titleTaken) {
          form.setError("title", {
            type: "duplicate",
            message: "A common benefit with this full title already exists.",
          })
          return
        }
      }
    } catch {
      // Fall through — API uniqueness remains source of truth.
    } finally {
      setChecking(false)
    }

    submitMutation.mutate(buildTravelBenefitCommonPayload(values))
  }

  return (
    <div className="w-full min-w-150 max-w-150 p-6 space-y-6">
      <div className="border-b pb-3">
        <h2 className="text-xl font-semibold">Edit Common Benefit</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Update type, show-in, and titles for this catalog benefit.
        </p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <ReusableSelect
          control={form.control}
          name="type"
          label="Benefit Type"
          required
          placeholder="Select benefit type"
          options={typeSelectOptions}
        />
        <ReusableSelect
          control={form.control}
          name="group"
          label="Show In"
          required
          placeholder="Select where to show"
          options={showInSelectOptions}
        />
        <ReuseableInput
          control={form.control}
          name="name"
          label="Short Title"
          required
          className={inputClass}
        />
        <ReuseableInput
          control={form.control}
          name="title"
          label="Full Benefit Title"
          className={inputClass}
        />

        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-2 px-0">
          <Button
            type="button"
            className="w-full sm:w-auto rounded-sm border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
            onClick={() => handleDialogContextSwitch({})}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-sm hover:bg-[#C20C0C]"
            loading={checking || submitMutation.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
