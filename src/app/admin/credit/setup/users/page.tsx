/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from "@/components/shared"
import { ActionColumn } from "@/dev/columns"
import { CustomDialogComponent } from "@/dev/core"
import { CustomBaseTable, SearchTools } from "@/dev/table"
import { CreditUserAllocationsColumns } from "@/dev/columns/admin/credit/user-allocations"
import { CREDIT_URLS } from "@/app/admin/credit/credit-query"
import { useCustomDialogContextFactory, useDebounce } from "@/hooks"
import { UseApiQuery } from "@/hooks/hooks"
import type {
  CreditUserAllocation,
  SingleActionsHandler,
  SubmitResponse,
  TPaginationFilters,
  TFilterOptions,
} from "@/types/types"
import { FILTEROPTIONS, ReusableReducer } from "@/utils/constatnts"
import { useReducer } from "react"
import AllocateCreditModal from "../modals/allocate"

function resolveAllocationUserId(user?: CreditUserAllocation) {
  return user?.user_id ?? user?.user?.id ?? user?.id
}

export function CreditSetupUsersPage() {
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

  const usersQuery = UseApiQuery<SubmitResponse>({
    url: CREDIT_URLS.setupUsers,
    params: {
      page: filter.page,
      pageSize: filter.pageSize,
      term: filter.term,
    },
    queryOptions: { enabled: true },
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
      conditional: (user) => Boolean(resolveAllocationUserId(user)),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Allocations"
        description="Assign credit balances and minimum spend thresholds per user."
      />

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

      <CustomDialogComponent
        handleDialogContextSwitch={handleDialogContextSwitch}
        dialogOpen={dialogOpen}
        className="sm:max-w-fit w-[95vw] sm:w-auto"
      >
        {dialogContent?.Component && (
          <dialogContent.Component
            componentProps={dialogContent.componentProps}
            handleDialogContextSwitch={handleDialogContextSwitch}
          />
        )}
      </CustomDialogComponent>
    </div>
  )
}

export default CreditSetupUsersPage
