/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from "@/components/shared"
import { CREDIT_URLS, invalidateCreditAll } from "@/app/admin/credit/credit-query"
import { PoolSettingsForm } from "@/app/admin/credit/components/PoolSettingsForm"
import { extractRolesFromResponse } from "@/app/admin/organization-roles/role-utils"
import { UseApiMutation, UseApiQuery } from "@/hooks/hooks"
import type { CreditPool, SubmitResponse } from "@/types/types"
import { PoolSettingsSchema } from "@/types/form-schema"
import type { PoolSettingsFormValues } from "@/types/schema"
import { EMETHODS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"

export function CreditSetupPoolPage() {
  const queryClient = useQueryClient()

  const poolQuery = UseApiQuery<SubmitResponse>({
    url: CREDIT_URLS.setupPool,
    queryOptions: { enabled: true },
  })

  const rolesQuery = UseApiQuery<SubmitResponse>({
    url: "roles",
    params: { page: 1, pageSize: 100 },
    queryOptions: { enabled: true },
  })

  const pool = (poolQuery.data?.data?.pool ?? poolQuery.data?.data) as CreditPool | undefined
  const roles = extractRolesFromResponse(rolesQuery.data).map((role) => ({
    label: role.display_name ?? role.name ?? `Role ${role.id}`,
    value: String(role.id),
  }))

  const form = useForm<PoolSettingsFormValues>({
    resolver: zodResolver(PoolSettingsSchema),
    values: {
      total_available: pool?.total_available ? Number(pool.total_available) : 0,
      requires_approval: pool?.requires_approval ?? false,
      auto_approve_threshold: pool?.auto_approve_threshold
        ? Number(pool.auto_approve_threshold)
        : null,
      finance_can_override_without_payment: pool?.finance_can_override_without_payment ?? false,
      finance_role_id: pool?.finance_role_id ? String(pool.finance_role_id) : undefined,
      overall_manager_role_id: pool?.overall_manager_role_id
        ? String(pool.overall_manager_role_id)
        : undefined,
    },
  })

  const requiresApproval = form.watch("requires_approval")

  const savePoolMutation = UseApiMutation<SubmitResponse, Partial<PoolSettingsFormValues>>({
    url: CREDIT_URLS.setupPool,
    method: EMETHODS.PATCH,
    mutationOptions: {
      onSuccess: async (response) => {
        ShowToast.success(response?.message || "Pool settings saved")
        await Promise.all([poolQuery.refetch(), invalidateCreditAll(queryClient)])
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const onSavePool = (values: PoolSettingsFormValues) => {
    savePoolMutation.mutate({
      ...values,
      finance_role_id: values.finance_role_id ? Number(values.finance_role_id) : null,
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

      <section className="rounded-xl border p-6 space-y-5">
        <PoolSettingsForm
          control={form.control}
          requiresApproval={requiresApproval}
          roleOptions={roles}
          isSaving={savePoolMutation.isPending}
          isLoading={poolQuery.isLoading}
          onSubmit={form.handleSubmit(onSavePool)}
        />
      </section>
    </div>
  )
}

export default CreditSetupPoolPage
