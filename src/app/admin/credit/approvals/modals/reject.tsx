/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ReuseableInput } from "@/dev/core"
import { CREDIT_URLS } from "@/app/admin/credit/credit-query"
import { UseApiMutation } from "@/hooks/hooks"
import { RejectApprovalSchema } from "@/types/form-schema"
import type { RejectApprovalFormValues } from "@/types/schema"
import type { SubmitResponse } from "@/types/types"
import { EMETHODS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

type RejectApprovalModalProps = {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: {
    transactionId?: number
    refetch?: () => Promise<any>
  }
}

export default function RejectApprovalModal({
  handleDialogContextSwitch,
  componentProps,
}: RejectApprovalModalProps) {
  const transactionId = componentProps?.transactionId

  const form = useForm<RejectApprovalFormValues>({
    resolver: zodResolver(RejectApprovalSchema),
    defaultValues: {
      reason: "",
    },
  })

  const rejectMutation = UseApiMutation<SubmitResponse, RejectApprovalFormValues>({
    url: CREDIT_URLS.approvalReject(transactionId ?? ""),
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response?.message || "Transaction rejected")
        form.reset()
        componentProps?.refetch?.()
        handleDialogContextSwitch({ refetch: true })
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const onSubmit = (values: RejectApprovalFormValues) => {
    if (!transactionId) {
      ShowToast.error("Missing transaction ID")
      return
    }
    rejectMutation.mutate(values)
  }

  return (
    <div className="w-full min-w-120 max-w-lg p-6 space-y-6">
      <div className="border-b pb-3">
        <h2 className="text-xl font-semibold">Reject credit spend</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Provide a reason so the agent understands why this was blocked.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ReuseableInput
          control={form.control}
          name="reason"
          label="Rejection reason"
          placeholder="Explain why this spend cannot be approved"
          required
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleDialogContextSwitch({ refetch: false })}
          >
            Cancel
          </Button>
          <Button type="submit" loading={rejectMutation.isPending}>
            Reject transaction
          </Button>
        </div>
      </form>
    </div>
  )
}
