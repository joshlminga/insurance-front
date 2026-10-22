/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Shared list for Finance → Transactions tabs.
 *
 * Per Invoice (view=invoice):
 *   Main table = invoices (search invoice # / quote code).
 *   Preview → dialog. Print → one print window (no dialog).
 *
 * Per Purchase (view=purchase):
 *   Main table = purchases (search quote code).
 *   Preview → dialog with aggregated funds. Print → one print window.
 */
import {
  BuildFinanceTransactionsParams,
  FINANCE_TRANSACTIONS_URL,
} from '@/app/admin/finance/transactions/finance-transactions-query'
import { FinanceLedgerPreviewDialog } from '@/app/admin/finance/transactions/modals/ledger-preview'
import { fetchAndPrintLedgerSummary } from '@/app/admin/finance/transactions/print-ledger-summary'
import {
  FinanceTransactionInvoiceColumns,
  FinanceTransactionPurchaseColumns,
} from '@/dev/columns/admin/finance/transactions'
import { ActionColumn } from '@/dev/columns'
import { CustomDialogComponent } from '@/dev/core'
import { CustomBaseTable, SearchTools } from '@/dev/table'
import { useCustomDialogContextFactory, useDebounce } from '@/hooks'
import { UseApiQuery } from '@/hooks/hooks'
import type {
  FinanceTransactionInvoiceRow,
  FinanceTransactionPurchaseRow,
  SingleActionsHandler,
  SubmitResponse,
  TFilterOptions,
  TPaginationFilters,
} from '@/types/types'
import { FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts'
import { useReducer } from 'react'

type LedgerListTabProps = {
  /** Maps to API `?view=invoice|purchase` */
  view: 'invoice' | 'purchase'
  title: string
}

export function FinanceLedgerListTab({ view, title }: LedgerListTabProps) {
  // Local filter state (page, pageSize, search term) — same reducer as other admin lists
  const [filter, optionsDispatcher] = useReducer(
    ReusableReducer<TPaginationFilters & TFilterOptions>,
    { ...FILTEROPTIONS, page: 1, pageSize: 15 }
  )
  const optionsDispatcherDebounce = useDebounce({
    debounceCallback: optionsDispatcher,
  })

  // Dialog factory: Preview only (Print never opens this)
  const { handleDialogContextSwitch, dialogContent, dialogOpen } =
    useCustomDialogContextFactory<{
      mode: 'invoice' | 'purchase'
      invoice_id?: number
      purchase_id?: number
      quote_code?: string | null
      title?: string
    }>()

  // List only (no invoice_id / purchase_id) — summaries for the main table
  const { data, isLoading, isError } = UseApiQuery<SubmitResponse>({
    url: FINANCE_TRANSACTIONS_URL,
    params: BuildFinanceTransactionsParams({
      view,
      page: filter.page,
      pageSize: filter.pageSize,
      term: filter.term,
    }),
  })

  const rows = data?.data ?? []

  const openInvoicePreview = (row: FinanceTransactionInvoiceRow) => {
    handleDialogContextSwitch({
      Component: FinanceLedgerPreviewDialog,
      componentProps: {
        mode: 'invoice',
        invoice_id: row.invoice_id ?? row.id,
        title: `Invoice ${row.invoice_number ?? `#${row.invoice_id ?? row.id}`}`,
      },
    })
  }

  const openPurchasePreview = (row: FinanceTransactionPurchaseRow) => {
    const id = row.purchase_id ?? row.id
    handleDialogContextSwitch({
      Component: FinanceLedgerPreviewDialog,
      componentProps: {
        mode: 'purchase',
        purchase_id: id,
        quote_code: row.quote_code,
        // Dialog builds "Purchase ID …" + "Quotation: …" itself
        title: `Purchase ID ${id}`,
      },
    })
  }

  // Print from the action menu: fetch + print in one window (no preview dialog)
  const printInvoice = (row: FinanceTransactionInvoiceRow) => {
    void fetchAndPrintLedgerSummary({
      mode: 'invoice',
      invoice_id: row.invoice_id ?? row.id,
      title: `Invoice ${row.invoice_number ?? `#${row.invoice_id ?? row.id}`}`,
    })
  }

  const printPurchase = (row: FinanceTransactionPurchaseRow) => {
    const id = row.purchase_id ?? row.id
    void fetchAndPrintLedgerSummary({
      mode: 'purchase',
      purchase_id: id,
      quote_code: row.quote_code,
      title: `Purchase ID ${id}`,
      subtitle: `Quotation: ${row.quote_code?.trim() || '—'}`,
    })
  }

  const invoiceActions: SingleActionsHandler<FinanceTransactionInvoiceRow>[] = [
    {
      label: 'Preview',
      onSelect: openInvoicePreview,
    },
    {
      label: 'Print',
      onSelect: printInvoice,
    },
  ]

  const purchaseActions: SingleActionsHandler<FinanceTransactionPurchaseRow>[] =
    [
      {
        label: 'Preview',
        onSelect: openPurchasePreview,
      },
      {
        label: 'Print',
        onSelect: printPurchase,
      },
    ]

  const columns =
    view === 'invoice'
      ? [
          ...FinanceTransactionInvoiceColumns,
          ActionColumn({ ActionsHandlerMapping: invoiceActions }),
        ]
      : [
          ...FinanceTransactionPurchaseColumns,
          ActionColumn({ ActionsHandlerMapping: purchaseActions }),
        ]

  const searchPlaceholder =
    view === 'invoice'
      ? 'Search invoice number or quote code…'
      : 'Search quotation code…'

  return (
    <div className="w-full space-y-4">
      <CustomBaseTable
        {...{
          onPageChange: (page) =>
            optionsDispatcher({
              payload: { page },
              type: 'page',
            }),
          OtherToolsProps: {
            onChange: (term: any) =>
              optionsDispatcherDebounce({
                payload: { term },
                type: 'term',
              }),
            placeholder: searchPlaceholder,
            includeFilter: true,
          },
          columns,
          OtherTools: SearchTools,
          data: rows,
          pageCount: data?.pagination?.last_page ?? filter.page,
          title,
          showPagination: true,
          setPageSize: (pageSize) =>
            optionsDispatcher({
              payload: { pageSize },
              type: 'pageSize',
            }),
          pageSize: data?.pagination?.per_page ?? filter?.pageSize,
          page: data?.pagination?.current_page ?? filter?.page,
          isLoading: isLoading,
          isError: isError,
        }}
      />

      <CustomDialogComponent
        {...{ handleDialogContextSwitch, dialogOpen }}
        className="sm:max-w-fit w-[95vw] sm:w-auto"
        title="Ledger preview"
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

export default FinanceLedgerListTab
