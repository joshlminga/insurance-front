/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ReuseableInput } from "@/dev/core"
import { CREDIT_URLS, invalidateCreditAll } from "@/app/admin/credit/credit-query"
import { UseApiMutation } from "@/hooks/hooks"
import { AllocateCreditSchema } from "@/types/form-schema"
import type { AllocateCreditFormValues } from "@/types/schema"
import type { CreditUserAllocation, SubmitResponse } from "@/types/types"
import { EMETHODS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"

type AllocateCreditModalProps = {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: {
    user?: CreditUserAllocation
    refetch?: () => Promise<any>
  }
}

export default function AllocateCreditModal({
  handleDialogContextSwitch,
  componentProps,
}: AllocateCreditModalProps) {
  const queryClient = useQueryClient()
  const user = componentProps?.user
  const userId = user?.user_id ?? user?.user?.id ?? user?.id

  const form = useForm<AllocateCreditFormValues>({
    resolver: zodResolver(AllocateCreditSchema),
    values: {
      amount: user?.allocated_balance ? Number(user.allocated_balance) : 0,
      minimum_spend_threshold: user?.minimum_spend_threshold
        ? Number(user.minimum_spend_threshold)
        : 0,
    },
  })

  const allocateMutation = UseApiMutation<SubmitResponse, AllocateCreditFormValues>({
    url: CREDIT_URLS.setupUserAllocate(userId ?? ""),
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: async (response) => {
        ShowToast.success(response?.message || "Credit allocated successfully")
        form.reset()
        await Promise.all([
          componentProps?.refetch?.(),
          invalidateCreditAll(queryClient),
        ])
        handleDialogContextSwitch({ refetch: true })
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const onSubmit = (values: AllocateCreditFormValues) => {
    if (!userId) {
      ShowToast.error("Missing user ID")
      return
    }
    allocateMutation.mutate(values)
  }

  return (
    <div className="w-full min-w-120 max-w-lg p-6 space-y-6">
      <div className="border-b pb-3">
        <h2 className="text-xl font-semibold">Allocate credit</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {user?.user?.name ?? user?.user?.email ?? "User"} — set allocated balance and minimum
          spend threshold.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ReuseableInput
          control={form.control}
          name="amount"
          label="Allocated amount (KES)"
          type="number"
          required
        />
        <ReuseableInput
          control={form.control}
          name="minimum_spend_threshold"
          label="Minimum spend threshold (KES)"
          type="number"
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
          <Button type="submit" loading={allocateMutation.isPending}>
            Save allocation
          </Button>
        </div>
      </form>
    </div>
  )
}
