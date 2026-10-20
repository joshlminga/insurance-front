/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ReuseableInput } from "@/dev/core"
import { UseApiMutation } from "@/hooks/hooks"
import { TravelBenefitSectionSchema } from "@/types/form-schema"
import type { TravelBenefitSectionFormValues } from "@/types/schema"
import { SubmitResponse } from "@/types/types"
import { EMETHODS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import {
  extractServerFieldErrors,
  findDuplicateTaxonomyName,
} from "../../taxonomy-uniqueness"

export const EditTravelBenefitSectionModal = ({
  handleDialogContextSwitch,
  componentProps,
}: {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: any
}) => {
  const sectionId = componentProps?.data?.id
  const [checking, setChecking] = useState(false)

  const form = useForm<TravelBenefitSectionFormValues>({
    resolver: zodResolver(TravelBenefitSectionSchema),
    defaultValues: {
      name: componentProps?.data?.name ?? "",
    },
  })

  const submitMutation = UseApiMutation<
    SubmitResponse,
    TravelBenefitSectionFormValues
  >({
    url: `travel/benefit-section/${sectionId}`,
    method: EMETHODS.PATCH,
    mutationOptions: {
      onSuccess: (data) => {
        ShowToast.success(data.message || "Section updated successfully")
        form.reset()
        componentProps?.refetch?.()
        handleDialogContextSwitch({ refetch: true })
      },
      onError: (error: unknown) => {
        const fieldErrors = extractServerFieldErrors(error)
        fieldErrors.forEach(({ name, message }) => {
          form.setError(name as keyof TravelBenefitSectionFormValues, {
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

  const onSubmit = async (values: TravelBenefitSectionFormValues) => {
    form.clearErrors("name")
    setChecking(true)
    try {
      const duplicate = await findDuplicateTaxonomyName({
        url: "travel/benefit-section",
        name: values.name,
        ignoreId: sectionId,
      })
      if (duplicate) {
        form.setError("name", {
          type: "duplicate",
          message: "A section with this name already exists.",
        })
        return
      }
    } catch {
      // Fall through to API uniqueness.
    } finally {
      setChecking(false)
    }

    submitMutation.mutate(values)
  }

  return (
    <div className="w-full min-w-[600px] max-w-[600px] p-6 space-y-6">
      <div className="border-b pb-3">
        <h2 className="text-xl font-semibold">Edit Benefit Section</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Update the section name used when grouping product benefits.
        </p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <ReuseableInput
          control={form.control}
          name="name"
          label="Section Name"
          required
          className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
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
