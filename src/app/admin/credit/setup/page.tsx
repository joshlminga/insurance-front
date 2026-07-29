/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from "@/components/shared"
import { ActionColumn } from "@/dev/columns"
import { CustomDialogComponent } from "@/dev/core"
import { CustomBaseTable, SearchTools } from "@/dev/table"
import { CreditUserAllocationsColumns } from "@/dev/columns/admin/credit/user-allocations"
import { CREDIT_URLS, invalidateCreditAll } from "@/app/admin/credit/credit-query"
import { useCustomDialogContextFactory, useDebounce } from "@/hooks"
import { UseApiMutation, UseApiQuery } from "@/hooks/hooks"
import type {
  CreditPool,
  CreditUserAllocation,
  SingleActionsHandler,
  SubmitResponse,
  TPaginationFilters,
  TFilterOptions,
} from "@/types/types"
import { PoolSettingsSchema } from "@/types/form-schema"
import type { PoolSettingsFormValues } from "@/types/schema"
import { EMETHODS, FILTEROPTIONS, ReusableReducer } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import { useReducer } from "react"
import { extractRolesFromResponse } from "@/app/admin/organization-roles/role-utils"
import AllocateCreditModal from "./modals/allocate"
import { PoolSettingsForm } from "../components/PoolSettingsForm"

export function CreditSetupPage() {
  const queryClient = useQueryClient()

  const [filter, optionsDispatcher] = useReducer(
    ReusableReducer<TPaginationFilters & TFilterOptions>,
    { ...FILTEROPTIONS, page: 1, pageSize: 15 }
  )

  const optionsDispatcherDebounce = useDebounce({
    debounceCallback: optionsDispatcher,
  })

  const { handleDialogContextSwitch, dialogContent, dialogOpen } =
    useCustomDialogContextFactory<{
      refetch?: () => Promise<any>
      user?: CreditUserAllocation
    }>()

  const poolQuery = UseApiQuery<SubmitResponse>({
    url: CREDIT_URLS.setupPool,
    queryOptions: { enabled: true },
  })

  const rolesQuery = UseApiQuery<SubmitResponse>({
    url: "roles",
    params: { page: 1, pageSize: 100 },
    queryOptions: { enabled: true },
  })

  const usersQuery = UseApiQuery<SubmitResponse>({
    url: CREDIT_URLS.setupUsers,
    params: {
      page: filter.page,
      pageSize: filter.pageSize,
      term: filter.term,
    },
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
        await Promise.all([
          poolQuery.refetch(),
          invalidateCreditAll(queryClient),
        ])
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const users: CreditUserAllocation[] =
    usersQuery.data?.data?.users ??
    usersQuery.data?.data?.user_credits ??
    usersQuery.data?.data?.data ??
    (Array.isArray(usersQuery.data?.data) ? usersQuery.data.data : [])

  const ActionsHandlerMapping: SingleActionsHandler<CreditUserAllocation>[] = [
    {
      label: "Allocate / Adjust",
      onSelect: (user) =>
        handleDialogContextSwitch({
          Component: AllocateCreditModal,
          componentProps: { user, refetch: usersQuery.refetch },
        }),
    },
  ]

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
    <div className="space-y-8">
      <PageHeader
        title="Credit Setup"
        description="Configure org credit pool rules and assign balances to users."
      />

      <section className="rounded-xl border p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold">Pool settings</h2>
          <p className="text-sm text-muted-foreground">
            Control approval rules and finance governance for this location.
          </p>
        </div>

        <PoolSettingsForm
          control={form.control}
          requiresApproval={requiresApproval}
          roleOptions={roles}
          isSaving={savePoolMutation.isPending}
          isLoading={poolQuery.isLoading}
          onSubmit={form.handleSubmit(onSavePool)}
        />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">User allocations</h2>
          <p className="text-sm text-muted-foreground">
            Assign credit balances and minimum spend thresholds per user.
          </p>
        </div>

        <CustomBaseTable
          onPageChange={(page) => optionsDispatcher({ payload: { page }, type: "page" })}
          OtherToolsProps={{
            onChange: (term: string) =>
              optionsDispatcherDebounce({ payload: { term }, type: "term" }),
            placeholder: "Search users",
            includeFilter: true,
          }}
          columns={[...CreditUserAllocationsColumns, ActionColumn({ ActionsHandlerMapping })]}
          OtherTools={SearchTools}
          data={users}
          pageCount={
            usersQuery.data?.data?.pagination?.last_page ??
            usersQuery.data?.pagination?.last_page ??
            1
          }
          pageSize={filter.pageSize}
          page={filter.page}
          isLoading={usersQuery.isLoading}
          showPagination
        />
      </section>

      <CustomDialogComponent
        handleDialogContextSwitch={handleDialogContextSwitch}
        dialogOpen={dialogOpen}
        dialogContent={dialogContent}
      />
    </div>
  )
}

export default CreditSetupPage
