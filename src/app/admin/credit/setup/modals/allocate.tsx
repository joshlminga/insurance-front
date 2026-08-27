/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ReuseableInput, ReusableSelect } from "@/dev/core"
import { CREDIT_URLS, invalidateCreditAll } from "@/app/admin/credit/credit-query"
import { UseApiMutation, UseApiQuery } from "@/hooks/hooks"
import { AllocateCreditSchema, AllocateNewCreditSchema } from "@/types/form-schema"
import type { CreditUserAllocation, SubmitResponse } from "@/types/types"
import { EMETHODS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"

/** Shared form shape: user_id only required for first-time allocate. */
type AllocateFormValues = {
  user_id?: string | number
  amount: number
  minimum_spend_threshold: number
}

type AllocatePayload = {
  amount: number
  minimum_spend_threshold: number
}

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
  // Existing row edit: user already known. New allocation: pick from eligible list.
  const existingUserId = user?.user_id ?? user?.user?.id ?? user?.id
  const isNewAllocation = existingUserId == null

  const eligibleUsersQuery = UseApiQuery<SubmitResponse>({
    url: CREDIT_URLS.setupEligibleUsers,
    params: { page: 1, per_page: 100 },
    queryOptions: { enabled: isNewAllocation },
  })

  const eligibleUsers: CreditUserAllocation[] = Array.isArray(eligibleUsersQuery.data?.data)
    ? eligibleUsersQuery.data.data
    : []

  const userOptions = eligibleUsers
    .map((entry) => {
      const id = entry.user_id ?? entry.user?.id
      if (id == null || id === "") return null
      const labelParts = [
        entry.user?.name ?? entry.user?.email ?? `User ${id}`,
        entry.has_wallet ? "(has wallet)" : null,
      ].filter(Boolean)
      return {
        label: labelParts.join(" "),
        value: String(id),
      }
    })
    .filter(Boolean) as Array<{ label: string; value: string }>

  // New allocate uses defaultValues so picking a user is not wiped on re-render.
  // Edit allocate uses values so the form stays synced to the selected row.
  const form = useForm<AllocateFormValues>({
    resolver: zodResolver(isNewAllocation ? AllocateNewCreditSchema : AllocateCreditSchema),
    ...(isNewAllocation
      ? {
          defaultValues: {
            user_id: undefined,
            amount: 0,
            minimum_spend_threshold: 0,
          },
        }
      : {
          values: {
            amount: user?.allocated_balance ? Number(user.allocated_balance) : 0,
            minimum_spend_threshold: user?.minimum_spend_threshold
              ? Number(user.minimum_spend_threshold)
              : 0,
          },
        }),
  })

  const selectedUserId = form.watch("user_id")
  const allocateTargetId = existingUserId ?? selectedUserId

  const allocateMutation = UseApiMutation<SubmitResponse, AllocatePayload>({
    url: CREDIT_URLS.setupUserAllocate(String(allocateTargetId ?? "")),
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

  const onSubmit = (values: AllocateFormValues) => {
    const targetUserId = existingUserId ?? values.user_id

    if (targetUserId == null || String(targetUserId).trim() === "") {
      ShowToast.error("Select a user to allocate credit")
      return
    }

    allocateMutation.mutate({
      amount: values.amount,
      minimum_spend_threshold: values.minimum_spend_threshold,
    })
  }

  return (
    <div className="w-full min-w-120 max-w-lg p-6 space-y-6">
      <div className="border-b pb-3">
        <h2 className="text-xl font-semibold">
          {isNewAllocation ? "Allocate credit" : "Update allocation"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isNewAllocation
            ? "Pick an eligible location member, then set their allocated balance and minimum spend threshold."
            : `${user?.user?.name ?? user?.user?.email ?? "User"} — set allocated balance and minimum spend threshold.`}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Eligibility: the user must belong to this organization location and have any
          active role other than <code className="text-xs">member</code> — including
          built-in roles and custom org roles (for example{" "}
          <code className="text-xs">sales</code>). Users with only the{" "}
          <code className="text-xs">member</code> role cannot receive credit. Allocating
          requires <code className="text-xs">finance-control.create</code>.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {isNewAllocation && (
          <div className="space-y-1.5">
            <ReusableSelect
              control={form.control}
              name="user_id"
              label="User"
              placeholder={
                eligibleUsersQuery.isLoading
                  ? "Loading users…"
                  : userOptions.length === 0
                    ? "No eligible users found"
                    : "Select eligible user"
              }
              options={userOptions}
              required
              disabled={eligibleUsersQuery.isLoading || userOptions.length === 0}
            />
            {!eligibleUsersQuery.isLoading && userOptions.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No eligible users at this location. Assign them any active role other than{" "}
                <code className="text-xs">member</code> (built-in or custom), ensure they
                belong to this location, then try again.
              </p>
            )}
          </div>
        )}

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
