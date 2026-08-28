/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from "@/components/shared"
import { CREDIT_URLS } from "@/app/admin/credit/credit-query"
import { UseApiMutation, UseApiQuery } from "@/hooks/hooks"
import type { CreditPool, SubmitResponse } from "@/types/types"
import { PoolSettingsSchema } from "@/types/form-schema"
import type { PoolSettingsFormValues } from "@/types/schema"
import { EMETHODS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button, ReusableSingleSelectApiInput, ReuseableInput } from "@/dev/core"
import z from "zod"

export function CreditSetupPoolPage() {

  const { data: poolQuery, refetch: PoolQueryRefetch } = UseApiQuery<SubmitResponse>({
    url: CREDIT_URLS.setupPool,
    queryOptions: {
      enabled: true,
    },
  })
  const pool = (poolQuery?.data?.pool ?? poolQuery?.data) as CreditPool | undefined

  // const form = useForm<PoolSettingsFormValues>({
  //   resolver: zodResolver(PoolSettingsSchema),
  //   values: {
  //     total_available: pool?.total_available ? Number(pool.total_available) : 0,
  //     requires_approval: pool?.requires_approval ?? false,
  //     auto_approve_threshold: pool?.auto_approve_threshold
  //       ? Number(pool.auto_approve_threshold)
  //       : null,
  //     finance_can_override_without_payment:
  //       pool?.finance_can_override_without_payment ?? false,
  //     finance_role_id: pool?.finance_role_id
  //       ? String(pool.finance_role_id)
  //       : undefined,
  //     overall_manager_role_id: pool?.overall_manager_role_id
  //       ? String(pool.overall_manager_role_id)
  //       : undefined,
  //   },
  // })
  const form = useForm<
    z.input<typeof PoolSettingsSchema>,
    any,
    PoolSettingsFormValues
  >({
    resolver: zodResolver(PoolSettingsSchema),
    values: {
      total_available: Number(pool?.total_available ?? 0),

      requires_approval:
        pool?.requires_approval ?? false,

      auto_approve_threshold:
        pool?.auto_approve_threshold != null
          ? Number(pool.auto_approve_threshold)
          : null,

      finance_can_override_without_payment:
        pool?.finance_can_override_without_payment ?? false,

      finance_role_id:
        pool?.finance_role_id != null
          ? String(pool.finance_role_id)
          : undefined,

      overall_manager_role_id:
        pool?.overall_manager_role_id != null
          ? String(pool.overall_manager_role_id)
          : undefined,
    },
  })

  const requiresApproval = form.watch("requires_approval")

  const savePoolMutation = UseApiMutation<SubmitResponse, Partial<PoolSettingsFormValues>>({
    url: CREDIT_URLS.setupPool,
    method: EMETHODS.PATCH,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response?.message || "Pool settings saved")
        PoolQueryRefetch();
        // await Promise.all([poolQuery.refetch(), invalidateCreditAll(queryClient)])
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const onSavePool = (values: PoolSettingsFormValues) => {
    savePoolMutation.mutate({
      ...values,
      finance_role_id: values.finance_role_id
        ? Number(values.finance_role_id)
        : null,
      overall_manager_role_id: values.overall_manager_role_id
        ? Number(values.overall_manager_role_id)
        : null,
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pool Settings"
        description="Configure org credit pool rules and finance governance for this location."
      />
      <Card className="shadow-none p-6 space-y-5">
        <form onSubmit={form.handleSubmit(onSavePool)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <ReuseableInput
              control={form.control}
              name="total_available"
              label="Pool ceiling (KES)"
              type="number"
              required
            />
            {requiresApproval ? (
              <ReuseableInput
                control={form.control}
                name="auto_approve_threshold"
                label="Auto-approve threshold (KES)"
                type="number"
              />
            ) : null}
            <Controller
              control={form.control}
              name="finance_role_id"
              render={({ field }) => (
                <ReusableSingleSelectApiInput
                  url="roles"
                  value={String(field.value)}
                  onChange={field.onChange}
                  label="Finance role"
                  required
                  placeholder="Select role"
                />
              )}
            />
            <Controller
              control={form.control}
              name="overall_manager_role_id"
              render={({ field }) => (
                <ReusableSingleSelectApiInput
                  url="roles"
                  value={String(field.value)}
                  onChange={field.onChange}
                  label="Overall manager role"
                  required
                  placeholder="Select role"
                />
              )}
            />

          </div>

          <div className="flex flex-wrap gap-6">
            <Controller
              name="requires_approval"
              control={form.control}
              render={({ field }) => (
                <div className="flex items-center gap-3">
                  <Switch checked={field.value} onCheckedChange={field.onChange} id="requires_approval" />
                  <Label htmlFor="requires_approval">Require approval before deduction</Label>
                </div>
              )}
            />
            <Controller
              name="finance_can_override_without_payment"
              control={form.control}
              render={({ field }) => (
                <div className="flex items-center gap-3">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="finance_override"
                  />
                  <Label htmlFor="finance_override">Finance can override without payment</Label>
                </div>
              )}
            />
          </div>

          <Button type="submit"
            loading={savePoolMutation.isPending}>
            Save pool settings
          </Button>
        </form>

      </Card>
    </div>
  )
}

export default CreditSetupPoolPage
