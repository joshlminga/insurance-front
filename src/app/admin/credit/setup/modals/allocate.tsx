/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ReuseableInput, ReusableSingleSelectApiInput } from "@/dev/core"
import { CREDIT_URLS, invalidateCreditAll } from "@/app/admin/credit/credit-query"
import { UseApiMutation } from "@/hooks/hooks"
import { AllocateCreditSchema, AllocateNewCreditSchema } from "@/types/form-schema"
import type { CreditUserAllocation, SubmitResponse } from "@/types/types"
import { EMETHODS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import type { Resolver } from "react-hook-form"

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
    /** Per-request org header for super-admin credit setup (not global session). */
    orgContextHeaders?: Record<string, string>
  }
}

export default function AllocateCreditModal({
  handleDialogContextSwitch,
  componentProps,
}: AllocateCreditModalProps) {
  const queryClient = useQueryClient()
  const user = componentProps?.user
  const orgContextHeaders = componentProps?.orgContextHeaders
  // Existing row edit: user already known. New allocation: pick from eligible list.
  const existingUserId = user?.user_id ?? user?.user?.id ?? user?.id
  const isNewAllocation = existingUserId == null

  // New allocate uses defaultValues so picking a user is not wiped on re-render.
  // Edit allocate uses values so the form stays synced to the selected row.
  const form = useForm<AllocateFormValues>({
    resolver: zodResolver(
      isNewAllocation ? AllocateNewCreditSchema : AllocateCreditSchema
    ) as Resolver<AllocateFormValues>,
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
    config: orgContextHeaders ? { headers: orgContextHeaders } : undefined,
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
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {isNewAllocation && (
          <Controller
            control={form.control}
            name="user_id"
            render={({ field }) => (
              <div>
                <ReusableSingleSelectApiInput
                  url={CREDIT_URLS.setupEligibleUsers}
                  value={field.value != null ? String(field.value) : ""}
                  onChange={field.onChange}
                  label="User"
                  required
                  placeholder="Select eligible user..."
                  labelKey="user.name"
                  valueKey="user_id"
                  emptyMessage="No eligible users found"
                  config={orgContextHeaders ? { headers: orgContextHeaders } : undefined}
                  className={
                    form.formState.errors.user_id
                      ? "**:data-[slot=select-trigger]:border-red-500 **:data-[slot=select-trigger]:focus-visible:ring-red-500"
                      : ""
                  }
                />
                {form.formState.errors.user_id?.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(form.formState.errors.user_id.message)}
                  </p>
                )}
              </div>
            )}
          />
        )}

        <ReuseableInput
          control={form.control}
          name="amount"
          label="Allocated amount (KES)"
          type="text"
          thousandsSeparator
          required
        />
        <ReuseableInput
          control={form.control}
          name="minimum_spend_threshold"
          label="Minimum spend threshold (KES)"
          type="text"
          thousandsSeparator
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
