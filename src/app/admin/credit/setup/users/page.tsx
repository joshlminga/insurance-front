/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader, EmptyState } from "@/components/shared"
import { ActionColumn } from "@/dev/columns"
import { CustomDialogComponent } from "@/dev/core"
import {
  CustomBaseTable,
  SearchTools,
} from "@/dev/table"
import { CreditUserAllocationsColumns } from "@/dev/columns/admin/credit/user-allocations"
import { CREDIT_URLS, creditSetupUsersKey } from "@/app/admin/credit/credit-query"
import { CreditSetupOrgPicker } from "@/app/admin/credit/setup/credit-setup-org-picker"
import { useCreditSetupOrg } from "@/app/admin/credit/setup/use-credit-setup-org"
import { useCustomDialogContextFactory, useDebounce } from "@/hooks"
import { useCan } from "@/auth/useCan"
import { UseApiQuery } from "@/hooks/hooks"
import type {
  CreditUserAllocation,
  SingleActionsHandler,
  SubmitResponse,
  TPaginationFilters,
  TFilterOptions,
} from "@/types/types"
import { FILTEROPTIONS, ReusableReducer } from "@/utils/constatnts"
import { Building2, Coins, Plus } from "lucide-react"
import { useReducer } from "react"
import { Card } from "@/components/ui/card"
import AllocateCreditModal from "../modals/allocate"

function resolveAllocationUserId(user?: CreditUserAllocation) {
  return user?.user_id ?? user?.user?.id ?? user?.id
}

export function CreditSetupUsersPage() {
  const { can } = useCan()
  const canAllocate = can("finance-control.create")
  const {
    isBypass,
    selectedLocationId,
    setLocationId,
    orgContextHeaders,
    canFetchCreditSetup,
  } = useCreditSetupOrg()

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
      orgContextHeaders?: Record<string, string>
    }>()

  const listParams = {
    page: filter.page,
    per_page: filter.pageSize,
    term: filter.term,
  }

  const usersQuery = UseApiQuery<SubmitResponse>({
    url: CREDIT_URLS.setupUsers,
    queryKey: creditSetupUsersKey(listParams, selectedLocationId || null),
    params: listParams,
    config: orgContextHeaders ? { headers: orgContextHeaders } : undefined,
    queryOptions: { enabled: canFetchCreditSetup },
  })

  const users: CreditUserAllocation[] =
    usersQuery.data?.data?.users ??
    usersQuery.data?.data?.user_credits ??
    usersQuery.data?.data?.data ??
    (Array.isArray(usersQuery.data?.data) ? usersQuery.data.data : [])

  const openAllocateModal = (user?: CreditUserAllocation) => {
    handleDialogContextSwitch({
      Component: AllocateCreditModal,
      componentProps: {
        user,
        refetch: usersQuery.refetch,
        orgContextHeaders,
      },
    })
  }

  const ActionsHandlerMapping: SingleActionsHandler<CreditUserAllocation>[] =
    canAllocate
      ? [
          {
            label: "Allocate / Adjust",
            onSelect: (rowUser) => openAllocateModal(rowUser),
            conditional: (rowUser) =>
              Boolean(resolveAllocationUserId(rowUser)),
          },
        ]
      : []

  const showEmptyState = canFetchCreditSetup && !usersQuery.isLoading && users.length === 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Allocations"
        description="Assign credit balances and minimum spend thresholds per user. Allocating requires finance-control.create (and finance-control.list to view this page). Recipients must belong to this location and have any active role other than member — including built-in and custom org roles such as sales. Member-only users are not eligible."
        actions={
          canAllocate && canFetchCreditSetup
            ? [
                {
                  icon: Plus,
                  label: "Allocate credit",
                  variant: "default",
                  onClick: () => openAllocateModal(),
                },
              ]
            : undefined
        }
      />

      {isBypass ? (
        <Card className="shadow-none p-6">
          <CreditSetupOrgPicker
            value={selectedLocationId}
            onChange={setLocationId}
          />
        </Card>
      ) : null}

      {!canFetchCreditSetup ? (
        <EmptyState
          icon={Building2}
          title="Select an organization location"
          description="Choose a Company, Organization, or Partner location above to view and manage user credit allocations."
        />
      ) : showEmptyState ? (
        <EmptyState
          icon={Coins}
          title="No credit wallets yet"
          description="Eligible users do not appear here until they have a wallet. Use Allocate credit to assign credit the first time. Any location member with an active role other than member (including custom org roles) is eligible."
          action={
            canAllocate
              ? {
                  label: "Allocate credit",
                  onClick: () => openAllocateModal(),
                }
              : undefined
          }
        />
      ) : (
        <CustomBaseTable
          onPageChange={(page) =>
            optionsDispatcher({ payload: { page }, type: "page" })
          }
          OtherToolsProps={{
            onChange: (term: string) =>
              optionsDispatcherDebounce({ payload: { term }, type: "term" }),
            placeholder: "Search users",
            includeFilter: true,
          }}
          columns={[
            ...CreditUserAllocationsColumns,
            ...(ActionsHandlerMapping.length > 0
              ? [ActionColumn({ ActionsHandlerMapping })]
              : []),
          ]}
          OtherTools={SearchTools}
          data={users}
          pageCount={
            usersQuery.data?.data?.pagination?.last_page ??
            usersQuery.data?.pagination?.last_page ??
            1
          }
          pageSize={
            usersQuery.data?.data?.pagination?.per_page ??
            usersQuery.data?.pagination?.per_page ??
            filter.pageSize
          }
          page={
            usersQuery.data?.data?.pagination?.current_page ??
            usersQuery.data?.pagination?.current_page ??
            filter.page
          }
          setPageSize={(pageSize) =>
            optionsDispatcher({ payload: { pageSize }, type: "pageSize" })
          }
          isLoading={usersQuery.isLoading}
          showPagination
        />
      )}

      <CustomDialogComponent
        {...{ handleDialogContextSwitch, dialogOpen }}
        className="sm:max-w-fit w-[95vw] sm:w-auto p-4 sm:p-6"
      >
        {dialogContent?.Component && (
          <dialogContent.Component
            {...{
              componentProps: dialogContent.componentProps,
              handleDialogContextSwitch,
            }}
          />
        )}
      </CustomDialogComponent>
    </div>
  )
}

export default CreditSetupUsersPage
