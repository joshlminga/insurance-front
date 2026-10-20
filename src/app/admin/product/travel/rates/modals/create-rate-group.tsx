/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/dev/core"
import { UseApiMutation } from "@/hooks/hooks"
import { TravelRateGroupSchema } from "@/types/form-schema"
import type { TravelRateGroupFormValues } from "@/types/schema"
import { SubmitResponse } from "@/types/types"
import { EMETHODS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  buildTravelRateGroupPayload,
  emptyTravelRateGroupFormValues,
} from "../travel-rate-form-utils"
import { TravelRateFormFields } from "./travel-rate-form-fields"

export const CreateTravelRateGroupModal = ({
  handleDialogContextSwitch,
  componentProps,
}: {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: any
}) => {
  // productId comes from the rates page (route param).
  const productId = componentProps?.productId

  const form = useForm<TravelRateGroupFormValues>({
    resolver: zodResolver(TravelRateGroupSchema),
    defaultValues: emptyTravelRateGroupFormValues(),
  })

  const submitMutation = UseApiMutation<
    SubmitResponse,
    ReturnType<typeof buildTravelRateGroupPayload>
  >({
    url: `products/travel/rates/${productId}`,
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (data) => {
        ShowToast.success(data.message || "Rate group created successfully")
        form.reset()
        componentProps?.refetch?.()
        handleDialogContextSwitch({ refetch: true })
      },
      onError: (error: unknown) => {
        ShowToast.error(extractErrorMessage(error) || "Create failed")
      },
    },
  })

  const onSubmit = (values: TravelRateGroupFormValues) => {
    if (!productId) {
      ShowToast.error("Missing product id")
      return
    }
    submitMutation.mutate(buildTravelRateGroupPayload(values))
  }

  return (
    <div className="w-full min-w-[640px] max-w-[820px] max-h-[85vh] overflow-y-auto p-6 space-y-6">
      <div className="border-b pb-3">
        <h2 className="text-xl font-semibold">Add Rate Group</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Set plan / billing for the group, then add one or more day-band rates.
        </p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <TravelRateFormFields form={form} />
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
