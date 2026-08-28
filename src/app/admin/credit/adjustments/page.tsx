/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from "@/components/shared"
import { Button, ReuseableInput, ReusableSelect } from "@/dev/core"
import { CREDIT_URLS } from "@/app/admin/credit/credit-query"
import { useCan } from "@/auth/useCan"
import { UseApiMutation, UseApiQuery } from "@/hooks/hooks"
import { AdjustmentSchema } from "@/types/form-schema"
import type { AdjustmentFormValues } from "@/types/schema"
import type { SubmitResponse } from "@/types/types"
import { ADJUSTMENT_TYPES, EMETHODS } from "@/utils/constatnts"
import { EROUTES } from "@/utils/enums"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Card } from "@/components/ui/card"
import z from "zod"
import { Link } from "react-router-dom"

function parseWalletUsers(response?: SubmitResponse): any[] {
  const payload = response?.data
  if (Array.isArray(payload)) {
    return payload
  }
  if (!payload || typeof payload !== "object") {
    return []
  }
  if (Array.isArray(payload.users)) {
    return payload.users
  }
  if (Array.isArray(payload.user_credits)) {
    return payload.user_credits
  }
  if (Array.isArray(payload.data)) {
    return payload.data
  }
  return []
}

export function CreditAdjustmentsPage() {
  const { can } = useCan()
  const canListUsers = can("finance-control.list")

  const usersQuery = UseApiQuery<SubmitResponse>({
    url: CREDIT_URLS.setupUsers,
    params: { page: 1, per_page: 100 },
    queryOptions: { enabled: canListUsers },
  })

  const users = parseWalletUsers(usersQuery.data)

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

  const form = useForm<
    z.input<typeof AdjustmentSchema>,
    any,
    AdjustmentFormValues
  >({
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
      onSuccess: (response) => {
        ShowToast.success(response?.message || "Adjustment applied")
        form.reset()
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

  const usersLoading = canListUsers && usersQuery.isLoading
  const usersError =
    canListUsers && usersQuery.isError
      ? extractErrorMessage(usersQuery.error)
      : null
  const usersEmpty =
    canListUsers && !usersLoading && !usersError && userOptions.length === 0

  let userPlaceholder = "Select user"
  if (!canListUsers) {
    userPlaceholder = "Missing permission to load users"
  } else if (usersLoading) {
    userPlaceholder = "Loading users…"
  } else if (usersEmpty) {
    userPlaceholder = "No users with credit wallets"
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Credit Adjustments"
        description="Apply manual corrections, refunds, or write-offs to user credit balances. Requires finance-control.adjust to apply and finance-control.list to load users."
      />

      <Card className="max-w-7xl shadow-none p-6 space-y-4">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <ReusableSelect
              control={form.control}
              name="user_id"
              label="User"
              placeholder={userPlaceholder}
              options={userOptions}
              required
              disabled={!canListUsers || usersLoading || userOptions.length === 0}
            />

            {!canListUsers && (
              <p className="text-sm text-muted-foreground">
                Your role needs{" "}
                <code className="text-xs">finance-control.list</code> to load
                users for this dropdown, and{" "}
                <code className="text-xs">finance-control.adjust</code> to apply
                an adjustment.
              </p>
            )}

            {usersError && (
              <p className="text-sm text-destructive">{usersError}</p>
            )}

            {usersEmpty && (
              <p className="text-sm text-muted-foreground">
                No credit wallets found yet. Allocate credit first under{" "}
                <Link
                  to={EROUTES.CREDIT_SETUP_USERS}
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  User Allocations
                </Link>
                .
              </p>
            )}
          </div>

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
            type="text"
            thousandsSeparator
            required
          />

          <ReuseableInput
            control={form.control}
            type="textarea"
            rows={4}
            name="reason"
            label="Reason"
            placeholder="Explain this adjustment for the audit trail"
            required
          />
          <Button type="submit" loading={adjustMutation.isPending}>
            Apply adjustment
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default CreditAdjustmentsPage
