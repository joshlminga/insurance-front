/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from "@/components/shared"
import { Button, CustomDialogComponent } from "@/dev/core"
import { CustomBaseTable, SearchTools } from "@/dev/table"
import { buildCreditTransactionColumns, getCreditOutstanding } from "@/dev/columns/admin/credit/transactions"
import { useCan } from "@/auth/useCan"
import { MODULES } from "@/auth/module-keys"
import { CREDIT_URLS } from "@/app/admin/credit/credit-query"
import { useCustomDialogContextFactory, useDebounce } from "@/hooks"
import { UseApiQuery } from "@/hooks/hooks"
import type { CreditTransaction, SubmitResponse, TPaginationFilters, TFilterOptions } from "@/types/types"
import { FILTEROPTIONS, ReusableReducer } from "@/utils/constatnts"
import { formatCurrency } from "@/lib/format"
import { useReducer, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import SettlementModal from "./modals/settlement"

export function CreditTransactionsPage() {
  const { canModuleAction } = useCan()
  const canListAll = canModuleAction(MODULES.FINANCE_CONTROL, "list")
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get("view") === "all" && canListAll ? "all" : "mine"

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  const [filter, optionsDispatcher] = useReducer(
    ReusableReducer<TPaginationFilters & TFilterOptions & { status?: string; user_id?: string }>,
    { ...FILTEROPTIONS, page: 1, pageSize: 15, status: "", user_id: "" }
  )

  const optionsDispatcherDebounce = useDebounce({
    debounceCallback: optionsDispatcher,
  })

  const { handleDialogContextSwitch, dialogContent, dialogOpen } =
    useCustomDialogContextFactory<{
      refetch?: () => Promise<any>
      selectedTransactions?: CreditTransaction[]
    }>()

  const mineQuery = UseApiQuery<SubmitResponse>({
    url: CREDIT_URLS.transactionsMine,
    params: {
      page: filter.page,
      per_page: filter.pageSize,
      term: filter.term,
    },
    queryOptions: {
      enabled: activeTab === "mine",
    },
  })

  const allQuery = UseApiQuery<SubmitResponse>({
    url: CREDIT_URLS.transactions,
    params: {
      page: filter.page,
      per_page: filter.pageSize,
      term: filter.term,
      status: filter.status || undefined,
      user_id: filter.user_id || undefined,
    },
    queryOptions: {
      enabled: activeTab === "all" && canListAll,
    },
  })

  const activeQuery = activeTab === "all" ? allQuery : mineQuery
  const { data, isLoading, refetch } = activeQuery

  const transactions: CreditTransaction[] =
    data?.data?.transactions ??
    data?.data?.credit_transactions ??
    data?.data?.data ??
    (Array.isArray(data?.data) ? data.data : [])

  const selectedTransactions = transactions.filter((txn) => selectedIds.has(txn.id))
  const selectedTotal = selectedTransactions.reduce(
    (sum, txn) => sum + getCreditOutstanding(txn),
    0
  )

  const toggleRow = (row: CreditTransaction, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(row.id)
      else next.delete(row.id)
      return next
    })
  }

  const toggleAll = (rows: CreditTransaction[], checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      rows.forEach((row) => {
        if (checked) next.add(row.id)
        else next.delete(row.id)
      })
      return next
    })
  }

  const columns = buildCreditTransactionColumns({
    showSelection: activeTab === "mine",
    selectedIds,
    onToggleRow: toggleRow,
    onToggleAll: toggleAll,
  })

  const handleTabChange = (value: string) => {
    setSelectedIds(new Set())
    if (value === "all") {
      setSearchParams({ view: "all" })
    } else {
      setSearchParams({})
    }
    optionsDispatcher({ type: "page", payload: { page: 1 } })
  }

  const tableProps = {
    onPageChange: (page: number) =>
      optionsDispatcher({ payload: { page }, type: "page" }),
    OtherToolsProps: {
      onChange: (term: string) =>
        optionsDispatcherDebounce({ payload: { term }, type: "term" }),
      placeholder: "Search transactions",
      includeFilter: true,
    },
    columns,
    OtherTools: SearchTools,
    data: transactions,
    pageCount: data?.data?.pagination?.last_page ?? data?.pagination?.last_page ?? 1,
    pageSize: filter.pageSize,
    page: filter.page,
    isLoading,
    showPagination: true,
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Credit Transactions"
        description="Review credit usage and recharge approved transactions."
        actions={
          activeTab === "mine" && selectedIds.size > 0
            ? [
                {
                  label: `Recharge selected (${selectedIds.size}) — ${formatCurrency(selectedTotal)}`,
                  onClick: () =>
                    handleDialogContextSwitch({
                      Component: SettlementModal,
                      componentProps: {
                        selectedTransactions,
                        refetch: async () => {
                          await refetch()
                          setSelectedIds(new Set())
                        },
                      },
                    }),
                },
              ]
            : undefined
        }
      />

      {activeTab === "mine" && selectedIds.size > 0 ? (
        <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
          <p className="text-sm">
            {selectedIds.size} transaction(s) selected — total{" "}
            <span className="font-semibold">{formatCurrency(selectedTotal)}</span>
          </p>
          <Button
            type="button"
            onClick={() =>
              handleDialogContextSwitch({
                Component: SettlementModal,
                componentProps: {
                  selectedTransactions,
                  refetch: async () => {
                    await refetch()
                    setSelectedIds(new Set())
                  },
                },
              })
            }
          >
            Recharge selected
          </Button>
        </div>
      ) : null}

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="mine">My transactions</TabsTrigger>
          {canListAll ? <TabsTrigger value="all">All transactions</TabsTrigger> : null}
        </TabsList>

        <TabsContent value="mine" className="mt-4">
          <CustomBaseTable {...tableProps} />
        </TabsContent>

        {canListAll ? (
          <TabsContent value="all" className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-3">
              <Select
                value={filter.status || "all"}
                onValueChange={(value) =>
                  optionsDispatcher({
                    type: "status",
                    payload: { status: value === "all" ? "" : value, page: 1 },
                  })
                }
              >
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending_approval">Pending approval</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CustomBaseTable {...tableProps} />
          </TabsContent>
        ) : null}
      </Tabs>

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

export default CreditTransactionsPage
