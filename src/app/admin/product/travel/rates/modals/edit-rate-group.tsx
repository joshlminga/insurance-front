/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/dev/core"
import { UseApiMutation, UseApiQuery } from "@/hooks/hooks"
import { TravelRateGroupSchema } from "@/types/form-schema"
import type { TravelRateGroupFormValues } from "@/types/schema"
import { SubmitResponse } from "@/types/types"
import { EMETHODS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import {
  buildTravelRateGroupPayload,
  emptyTravelRateGroupFormValues,
  mapTravelRateGroupToFormValues,
} from "../travel-rate-form-utils"
import { TravelRateFormFields } from "./travel-rate-form-fields"

export const EditTravelRateGroupModal = ({
  handleDialogContextSwitch,
  componentProps,
}: {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: any
}) => {
  const productId = componentProps?.productId
  const groupId = componentProps?.data?.id

  const form = useForm<TravelRateGroupFormValues>({
    resolver: zodResolver(TravelRateGroupSchema),
    defaultValues: emptyTravelRateGroupFormValues(),
  })

  // Load full group so nested rates include ids for sync-on-update.
  const { data, isLoading } = UseApiQuery<SubmitResponse>({
    url: `products/travel/rates/${productId}/${groupId}`,
    queryOptions: {
      enabled: Boolean(productId) && Boolean(groupId),
    },
  })

  useEffect(() => {
    const group = data?.data?.group ?? componentProps?.data
    if (group) {
      form.reset(mapTravelRateGroupToFormValues(group))
    }
  }, [data, componentProps?.data, form])

  const submitMutation = UseApiMutation<
    SubmitResponse,
    ReturnType<typeof buildTravelRateGroupPayload>
  >({
    url: `products/travel/rates/${productId}/${groupId}`,
    method: EMETHODS.PATCH,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response.message || "Rate group updated successfully")
        componentProps?.refetch?.()
        handleDialogContextSwitch({ refetch: true })
      },
      onError: (error: unknown) => {
        ShowToast.error(extractErrorMessage(error) || "Update failed")
      },
    },
  })

  const onSubmit = (values: TravelRateGroupFormValues) => {
    if (!productId || !groupId) {
      ShowToast.error("Missing product or group id")
      return
    }
    submitMutation.mutate(buildTravelRateGroupPayload(values))
  }

  return (
    <div className="w-full min-w-[640px] max-w-[820px] max-h-[85vh] overflow-y-auto p-6 space-y-6">
      <div className="border-b pb-3">
        <h2 className="text-xl font-semibold">Edit Rate Group</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Update group settings and day-band rates. Rates with an id are updated; new rows are created.
        </p>
      </div>
      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading rate group...</div>
      ) : (
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
              Save changes
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
