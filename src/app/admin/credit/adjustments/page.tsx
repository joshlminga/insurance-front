/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from "@/components/shared"
import { Button, ReuseableInput, ReusableSelect } from "@/dev/core"
import { CREDIT_URLS, invalidateCreditAll } from "@/app/admin/credit/credit-query"
import { UseApiMutation, UseApiQuery } from "@/hooks/hooks"
import { AdjustmentSchema } from "@/types/form-schema"
import type { AdjustmentFormValues } from "@/types/schema"
import type { SubmitResponse } from "@/types/types"
import { EMETHODS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"

const ADJUSTMENT_TYPES = [
  { label: "Refund", value: "refund" },
  { label: "Write off", value: "write_off" },
  { label: "Manual charge", value: "manual_charge" },
  { label: "Correction", value: "correction" },
]

export function CreditAdjustmentsPage() {
  const queryClient = useQueryClient()

  const usersQuery = UseApiQuery<SubmitResponse>({
    url: CREDIT_URLS.setupUsers,
    params: { page: 1, per_page: 100 },
    queryOptions: { enabled: true },
  })

  const users =
    usersQuery.data?.data?.users ??
    usersQuery.data?.data?.user_credits ??
    usersQuery.data?.data?.data ??
    (Array.isArray(usersQuery.data?.data) ? usersQuery.data.data : [])

  const userOptions = users
    .map((entry: any) => {
      const userId = entry.user_id ?? entry.user?.id
      if (userId == null || userId === "") return null
      return {
        label: entry.user?.name ?? entry.user?.email ?? `User ${userId}`,
        value: String(userId),
      }
    })
    .filter(Boolean) as Array<{ label: string; value: string }>

  const form = useForm<AdjustmentFormValues>({
    resolver: zodResolver(AdjustmentSchema),
    defaultValues: {
      user_id: undefined,
      amount: undefined,
      type: "correction",
      reason: "",
    },
  })

  const adjustMutation = UseApiMutation<
    SubmitResponse,
    AdjustmentFormValues & { user_id: number }
  >({
    url: CREDIT_URLS.adjustments,
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: async (response) => {
        ShowToast.success(response?.message || "Adjustment applied")
        form.reset({
          user_id: undefined,
          amount: undefined,
          type: "correction",
          reason: "",
        })
        await invalidateCreditAll(queryClient)
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const onSubmit = (values: AdjustmentFormValues) => {
    adjustMutation.mutate({
      ...values,
      user_id: Number(values.user_id),
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Credit Adjustments"
        description="Apply manual corrections, refunds, or write-offs to user credit balances."
      />

      <section className="max-w-2xl rounded-xl border p-6 space-y-4">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <ReusableSelect
            control={form.control}
            name="user_id"
            label="User"
            placeholder="Select user"
            options={userOptions}
            required
          />

          <ReusableSelect
            control={form.control}
            name="type"
            label="Adjustment type"
            options={ADJUSTMENT_TYPES}
            required
          />

          <ReuseableInput
            control={form.control}
            name="amount"
            label="Amount (positive adds credit, negative deducts)"
            type="number"
            required
          />

          <ReuseableInput
            control={form.control}
            name="reason"
            label="Reason"
            placeholder="Explain this adjustment for the audit trail"
            required
          />

          <Button type="submit" loading={adjustMutation.isPending}>
            Apply adjustment
          </Button>
        </form>
      </section>
    </div>
  )
}

export default CreditAdjustmentsPage
