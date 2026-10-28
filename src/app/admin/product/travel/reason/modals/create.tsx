/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ReuseableInput } from "@/dev/core"
import { UseApiMutation } from "@/hooks/hooks"
import { TravelReasonSchema } from "@/types/form-schema"
import type { TravelReasonFormValues } from "@/types/schema"
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

export const CreateTravelReasonModal = ({
  handleDialogContextSwitch,
  componentProps,
}: {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: any
}) => {
  const [checking, setChecking] = useState(false)

  const form = useForm<TravelReasonFormValues>({
    resolver: zodResolver(TravelReasonSchema),
    defaultValues: {
      name: "",
    },
  })

  const submitMutation = UseApiMutation<
    SubmitResponse,
    TravelReasonFormValues
  >({
    url: "travel/travel-plan",
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (data) => {
        ShowToast.success(data.message || "Reason created successfully")
        form.reset()
        componentProps?.refetch?.()
        handleDialogContextSwitch({ refetch: true })
      },
      onError: (error: unknown) => {
        const fieldErrors = extractServerFieldErrors(error)
        fieldErrors.forEach(({ name, message }) => {
          form.setError(name as keyof TravelReasonFormValues, {
            type: "server",
            message,
          })
        })
        ShowToast.error(
          fieldErrors.length > 0
            ? "Please check the highlighted fields."
            : extractErrorMessage(error) || "Create failed"
        )
      },
    },
  })

  const onSubmit = async (values: TravelReasonFormValues) => {
    form.clearErrors("name")
    setChecking(true)
    try {
      const duplicate = await findDuplicateTaxonomyName({
        url: "travel/travel-plan",
        name: values.name,
      })
      if (duplicate) {
        form.setError("name", {
          type: "duplicate",
          message: "A reason with this name already exists.",
        })
        return
      }
    } catch {
      // Fall through — API uniqueness is still the source of truth.
    } finally {
      setChecking(false)
    }

    submitMutation.mutate(values)
  }

  return (
    <div className="w-full min-w-150 max-w-150 p-6 space-y-6">
      <div className="border-b pb-3">
        <h2 className="text-xl font-semibold">Create Reason</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Reasons appear as “Reason for Travel” options on travel quotes (e.g.
          Leisure, Business).
        </p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <ReuseableInput
          control={form.control}
          name="name"
          label="Reason Name"
          required
          className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
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
            Save
          </Button>
        </div>
      </form>
    </div>
  )
}
