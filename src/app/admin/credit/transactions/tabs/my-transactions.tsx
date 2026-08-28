/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionColumn } from "@/dev/columns"
import { Button, CustomDialogComponent } from "@/dev/core"
import { CustomBaseTable, SearchTools } from "@/dev/table"
import { useCustomDialogContextFactory, useDebounce } from "@/hooks"
import { UseApiQuery } from "@/hooks/hooks"
import { formatCurrency } from "@/lib/format"
import { ECREDITTRANSACTIONS } from "@/types/enums"
import type {
  CreditTransaction,
  SingleActionsHandler,
  SubmitResponse,
  TFilterOptions,
  TPaginationFilters,
} from "@/types/types"
import { FILTEROPTIONS, ReusableReducer } from "@/utils/constatnts"
import { useCallback, useMemo, useReducer, useState } from "react"
import { useCan } from "@/auth/useCan"
import { MODULES } from "@/auth/module-keys"
import SettlementModal from "@/app/admin/credit/transactions/modals/settlement"
import {
  BuildCreditTransactionColumns,
  GetCreditOutstanding,
  IsCreditTransactionSelectable,
} from "@/dev/columns/admin/credit/transactions"
import { CREDIT_URLS } from "../../credit-query"

const MyTransactionsPage = () => {
  const { canModuleAction } = useCan()
  const canSettle = canModuleAction(MODULES.FINANCE_CONTROL, "action")

  const [filter, optionsDispatcher] = useReducer(
    ReusableReducer<TPaginationFilters & TFilterOptions>,
    { ...FILTEROPTIONS, page: 1, pageSize: 15 }
  )
  const optionsDispatcherDebounce = useDebounce({
    debounceCallback: optionsDispatcher,
  })

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  const { handleDialogContextSwitch, dialogContent, dialogOpen } =
    useCustomDialogContextFactory<{
      refetch?: () => Promise<any>
      selectedTransactions?: CreditTransaction[]
    }>()

  const { data, isLoading, isError, refetch } = UseApiQuery<SubmitResponse>({
    url: CREDIT_URLS.transactionsMine,
    params: {
      page: filter.page,
      pageSize: filter.pageSize,
      term: filter.term,
    },
    queryOptions: {
      enabled: ECREDITTRANSACTIONS.MY_TRANSACTION === "mine",
    },
  })

  const transactions = (data?.data ?? []) as CreditTransaction[]

  const selectedTransactions = useMemo(
    () => transactions.filter((txn) => selectedIds.has(txn.id)),
    [transactions, selectedIds]
  )

  const selectedTotal = useMemo(
    () =>
      selectedTransactions.reduce(
        (sum, txn) => sum + GetCreditOutstanding(txn),
        0
      ),
    [selectedTransactions]
  )

  const toggleRow = useCallback((row: CreditTransaction, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(row.id)
      else next.delete(row.id)
      return next
    })
  }, [])

  const toggleAll = useCallback((rows: CreditTransaction[], checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      rows.forEach((row) => {
        if (checked) next.add(row.id)
        else next.delete(row.id)
      })
      return next
    })
  }, [])

  const columns = useMemo(
    () =>
      BuildCreditTransactionColumns({
        showSelection: canSettle,
        selectedIds,
        onToggleRow: toggleRow,
        onToggleAll: toggleAll,
      }),
    [canSettle, selectedIds, toggleRow, toggleAll]
  )

  const openSettlementModal = () => {
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

  const settleableTransactions = useMemo(
    () => transactions.filter(IsCreditTransactionSelectable),
    [transactions]
  )

  const ActionsHandlerMapping: SingleActionsHandler<any>[] = []

  return (
    <div className="w-full space-y-4">
      {canSettle ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3">
          <p className="text-sm">
            {selectedIds.size > 0 ? (
              <>
                {selectedIds.size} transaction(s) selected — total{" "}
                <span className="font-semibold">
                  {formatCurrency(selectedTotal)}
                </span>
              </>
            ) : settleableTransactions.length > 0 ? (
              <>
                Select approved outstanding transactions below, then pay to
                restore credit.
              </>
            ) : (
              <>
                Recharge credit is available here. After you use credit,
                approved outstanding transactions will appear for payment.
              </>
            )}
          </p>
          <Button
            type="button"
            onClick={openSettlementModal}
            disabled={selectedIds.size === 0}
          >
            Recharge credit
          </Button>
        </div>
      ) : null}

      <CustomBaseTable
        onPageChange={(page) =>
          optionsDispatcher({
            payload: { page },
            type: "page",
          })
        }
        OtherToolsProps={{
          onChange: (term: any) =>
            optionsDispatcherDebounce({
              payload: { term },
              type: "term",
            }),
          placeholder: "Search",
          includeFilter: true,
        }}
        columns={[...columns, ActionColumn({ ActionsHandlerMapping })]}
        OtherTools={SearchTools}
        data={transactions}
        pageCount={data?.pagination?.last_page ?? filter.page}
        title="My transactions"
        showPagination
        setPageSize={(pageSize) =>
          optionsDispatcher({
            payload: { pageSize },
            type: "pageSize",
          })
        }
        pageSize={data?.pagination?.per_page ?? filter?.pageSize}
        page={data?.pagination?.current_page ?? filter?.page}
        isLoading={isLoading}
        isError={isError}
      />

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

export default MyTransactionsPage
