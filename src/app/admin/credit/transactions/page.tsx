/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from "@/components/shared"
import { CustomDialogComponent, ReusableTabComponent } from "@/dev/core"
import { useCan } from "@/auth/useCan"
import { MODULES } from "@/auth/module-keys"
import { useCustomDialogContextFactory } from "@/hooks"
import type { CreditTransaction } from "@/types/types"
import { CreditTransactionTabs } from "@/dev/tabs"
import { ECREDITTRANSACTIONS } from "@/types/enums"

export function CreditTransactionsPage() {
  const { canModuleAction } = useCan()
  const canListAll = canModuleAction(MODULES.FINANCE_CONTROL, "list")

  // const optionsDispatcherDebounce = useDebounce({
  //   debounceCallback: optionsDispatcher,
  // })

  const { handleDialogContextSwitch, dialogContent, dialogOpen } =
    useCustomDialogContextFactory<{
      refetch?: () => Promise<any>
      selectedTransactions?: CreditTransaction[]
    }>()

  // const toggleRow = (row: CreditTransaction, checked: boolean) => {
  //   setSelectedIds((prev) => {
  //     const next = new Set(prev)
  //     if (checked) next.add(row.id)
  //     else next.delete(row.id)
  //     return next
  //   })
  // }

  // const toggleAll = (rows: CreditTransaction[], checked: boolean) => {
  //   setSelectedIds((prev) => {
  //     const next = new Set(prev)
  //     rows.forEach((row) => {
  //       if (checked) next.add(row.id)
  //       else next.delete(row.id)
  //     })
  //     return next
  //   })
  // }

  // const columns = BuildCreditTransactionColumns({
  //   showSelection: activeTab === "mine",
  //   selectedIds,
  //   onToggleRow: toggleRow,
  //   onToggleAll: toggleAll,
  // })


  // const tableProps = {
  //   onPageChange: (page: number) =>
  //     optionsDispatcher({ payload: { page }, type: "page" }),
  //   OtherToolsProps: {
  //     onChange: (term: string) =>
  //       optionsDispatcherDebounce({ payload: { term }, type: "term" }),
  //     placeholder: "Search transactions",
  //     includeFilter: true,
  //   },
  //   columns,
  //   OtherTools: SearchTools,
  //   data: transactions,
  //   pageCount: data?.data?.pagination?.last_page ?? data?.pagination?.last_page ?? 1,
  //   pageSize: filter.pageSize,
  //   page: filter.page,
  //   isLoading,
  //   showPagination: true,
  // }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Credit Transactions"
        description="Review credit usage and recharge approved transactions."
        // actions={
        //   activeTab === "mine" && selectedIds.size > 0
        //     ? [
        //       {
        //         label: `Recharge selected (${selectedIds.size}) — ${formatCurrency(selectedTotal)}`,
        //         onClick: () =>
        //           handleDialogContextSwitch({
        //             Component: SettlementModal,
        //             componentProps: {
        //               selectedTransactions,
        //               refetch: async () => {
        //                 await refetch()
        //                 setSelectedIds(new Set())
        //               },
        //             },
        //           }),
        //       },
        //     ]
        //     : undefined
        // }
      />

      <div className="w-full">
        <ReusableTabComponent
          tabs={CreditTransactionTabs}
          defaultTab={ECREDITTRANSACTIONS.MY_TRANSACTION}
          tabProps={{
            canListAll:canListAll
            }}
        />
      </div>

      {/* {activeTab === "mine" && selectedIds.size > 0 ? (
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
      ) : null} */}


      <CustomDialogComponent
        {...{ handleDialogContextSwitch, dialogOpen }}
        className='sm:max-w-fit w-[95vw] sm:w-auto p-4 sm:p-6'>
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

export default CreditTransactionsPage
