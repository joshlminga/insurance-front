/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Preview dialog for Finance → Transactions.
 *
 * Per Invoice: individual DR/CR ledger lines for one invoice.
 * Per Purchase: funds rolled up by account.
 *   Title = Purchase ID; subtitle = Quotation: xxxxx
 *   Table columns omit Invoice, Purchase, and Created.
 *
 * Only a red-outline Print button (printer icon). Close via the dialog X / overlay.
 */
import {
  BuildFinanceTransactionsParams,
  FINANCE_TRANSACTIONS_URL,
} from '@/app/admin/finance/transactions/finance-transactions-query'
import { printLedgerSummary } from '@/app/admin/finance/transactions/print-ledger-summary'
import { Button } from '@/dev/core'
import {
  FinancePurchasePreviewColumns,
  FinanceTransactionsColumns,
} from '@/dev/columns/admin/finance/transactions'
import { CustomBaseTable } from '@/dev/table'
import { UseApiQuery } from '@/hooks/hooks'
import type {
  FinanceLedgerEntry,
  FinancePurchaseTransactionPreview,
  SubmitResponse,
} from '@/types/types'
import type { ColumnDef } from '@tanstack/table-core'
import { ShowToast } from '@/utils/utils'
import { Printer } from 'lucide-react'

type PreviewMode = 'invoice' | 'purchase'

type LedgerPreviewProps = {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: {
    mode: PreviewMode
    invoice_id?: number
    purchase_id?: number
    quote_code?: string | null
    title?: string
  }
}

/** Red outline Print — matches finance / travel action styling. */
const printButtonClassName =
  'border border-[#C20C0C] bg-transparent text-[#C20C0C] hover:bg-[#C20C0C]/10'

/** Small DR/CR table — invoice uses full columns; purchase omits Invoice/Purchase/Created. */
function LedgerLinesTable({
  rows,
  title,
  columns,
  isLoading,
  isError,
}: {
  rows: FinanceLedgerEntry[]
  title: string
  columns: ColumnDef<FinanceLedgerEntry>[]
  isLoading?: boolean
  isError?: boolean
}) {
  return (
    <CustomBaseTable
      columns={columns}
      data={rows}
      title={title}
      showPagination={false}
      isLoading={Boolean(isLoading)}
      isError={Boolean(isError)}
      pageCount={1}
      page={1}
      pageSize={rows.length || 10}
      onPageChange={() => undefined}
      setPageSize={() => undefined}
      OtherToolsProps={{}}
    />
  )
}

export function FinanceLedgerPreviewDialog({
  componentProps,
}: LedgerPreviewProps) {
  const mode = componentProps?.mode ?? 'invoice'
  const invoiceId = componentProps?.invoice_id
  const purchaseId = componentProps?.purchase_id
  const quoteCodeFromRow = componentProps?.quote_code?.trim() || null

  const invoiceQuery = UseApiQuery<SubmitResponse>({
    url: FINANCE_TRANSACTIONS_URL,
    params: BuildFinanceTransactionsParams({
      view: 'invoice',
      invoice_id: invoiceId,
      pageSize: 100,
      page: 1,
    }),
    queryOptions: {
      enabled: mode === 'invoice' && Boolean(invoiceId),
    },
  })

  const purchaseQuery = UseApiQuery<SubmitResponse>({
    url: FINANCE_TRANSACTIONS_URL,
    params: BuildFinanceTransactionsParams({
      view: 'purchase',
      purchase_id: purchaseId,
      quote_code: quoteCodeFromRow || undefined,
    }),
    queryOptions: {
      enabled:
        mode === 'purchase' &&
        (Boolean(purchaseId) || Boolean(quoteCodeFromRow)),
    },
  })

  const invoiceLines = (invoiceQuery.data?.data ?? []) as FinanceLedgerEntry[]
  const purchasePreview = (purchaseQuery.data?.data ??
    null) as FinancePurchaseTransactionPreview | null

  const purchaseRows = (purchasePreview?.aggregated_lines ??
    []) as FinanceLedgerEntry[]

  const invoiceLabels = (purchasePreview?.invoices ?? [])
    .map((inv) => inv.invoice_number ?? `#${inv.invoice_id}`)
    .join(', ')

  // Prefer API purchase_id / quote_code once loaded; fall back to the row we clicked
  const displayPurchaseId =
    purchasePreview?.purchase_id ?? purchaseId ?? null
  const displayQuote =
    purchasePreview?.quote_code?.trim() || quoteCodeFromRow || null

  const heading =
    mode === 'purchase'
      ? `Purchase ID ${displayPurchaseId ?? '—'}`
      : (componentProps?.title ?? 'Invoice ledger')

  const subtitle =
    mode === 'purchase'
      ? `Quotation: ${displayQuote ?? '—'}`
      : 'DR and CR lines for this invoice only.'

  const isLoading =
    mode === 'invoice' ? invoiceQuery.isLoading : purchaseQuery.isLoading
  const isError =
    mode === 'invoice' ? invoiceQuery.isError : purchaseQuery.isError
  const summaryRows = mode === 'invoice' ? invoiceLines : purchaseRows
  const canPrint = !isLoading && !isError && summaryRows.length > 0

  const runPrint = () => {
    if (!canPrint) {
      ShowToast.error('Nothing to print yet.')
      return
    }

    printLedgerSummary({
      title: heading,
      subtitle,
      rows: summaryRows,
      footerNote:
        mode === 'purchase' && invoiceLabels
          ? `Invoices: ${invoiceLabels}`
          : undefined,
    })
  }

  return (
    <div className="flex min-h-0 w-full flex-col gap-4 p-4 sm:p-6 sm:min-w-[640px] sm:max-w-[900px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{heading}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          className={printButtonClassName}
          leftIcon={<Printer className="h-4 w-4" />}
          disabled={!canPrint}
          onClick={runPrint}
        >
          Print
        </Button>
      </div>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto">
        {mode === 'invoice' ? (
          <LedgerLinesTable
            rows={invoiceLines}
            columns={FinanceTransactionsColumns}
            title="Ledger lines"
            isLoading={invoiceQuery.isLoading}
            isError={invoiceQuery.isError}
          />
        ) : (
          <>
            {purchaseQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading preview…</p>
            ) : null}
            {purchaseQuery.isError ? (
              <p className="text-sm text-destructive">
                Could not load purchase ledger preview.
              </p>
            ) : null}

            <LedgerLinesTable
              rows={purchaseRows}
              columns={FinancePurchasePreviewColumns}
              title="Purchase funds"
            />

            {(purchasePreview?.invoices?.length ?? 0) > 0 ? (
              <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
                <p className="font-medium">Invoices under this purchase</p>
                <p className="text-muted-foreground">{invoiceLabels}</p>
              </div>
            ) : null}

            {!purchaseQuery.isLoading &&
            !purchaseQuery.isError &&
            purchaseRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No ledger lines found for this purchase.
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}

export default FinanceLedgerPreviewDialog
