/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/dev/core"
import { UseApiMutation } from "@/hooks/hooks"
import { TravelProductSchema } from "@/types/form-schema"
import type { TravelProductFormValues } from "@/types/schema"
import { SubmitResponse } from "@/types/types"
import { EMETHODS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { TravelProductFormFields } from "./travel-product-form-fields"
import {
  buildTravelProductPayload,
  emptyTravelProductFormValues,
  type TravelProductPayload,
} from "./travel-product-form-utils"

export const CreateTravelProductModal = ({ handleDialogContextSwitch, componentProps }: {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: any
}) => {
  const form = useForm<TravelProductFormValues>({
    resolver: zodResolver(TravelProductSchema),
    defaultValues: emptyTravelProductFormValues(),
  })

  const submitMutation = UseApiMutation<SubmitResponse, TravelProductPayload>({
    url: "products/travel",
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (data) => {
        ShowToast.success(data.message || "Travel product created")
        form.reset(emptyTravelProductFormValues())
        componentProps?.refetch?.()
        handleDialogContextSwitch({ refetch: true })
      },
      onError: (error: unknown) => {
        ShowToast.error(extractErrorMessage(error) || "Submission failed!")
      },
    },
  })

  const onSubmit = (data: TravelProductFormValues) => {
    submitMutation.mutate(buildTravelProductPayload(data))
  }

  return (
    <div className="w-full min-w-150 max-w-150 p-6 space-y-6">
      <div className="border-b pb-3">
        <h2 className="text-xl font-semibold">Create Travel Product</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in the details below to register a new travel product.
        </p>
      </div>

      {/* flex (not grid): fragment fields stay packed; grid was stretching rows when the dialog was tall */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <TravelProductFormFields form={form} />
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
            loading={submitMutation.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
