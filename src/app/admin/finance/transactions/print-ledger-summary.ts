/**
 * Build a simple printable HTML page from ledger summary rows, then open the
 * browser print dialog. Same idea as echoing a Blade table and calling print.
 *
 * Row-action Print fetches the summary and prints in one window (no preview dialog).
 */
import {
  BuildFinanceTransactionsParams,
  FINANCE_TRANSACTIONS_URL,
} from '@/app/admin/finance/transactions/finance-transactions-query'
import apiClient from '@/lib/api-client'
import type {
  FinanceLedgerEntry,
  FinancePurchaseTransactionPreview,
  SubmitResponse,
} from '@/types/types'
import { ShowToast } from '@/utils/utils'
import { extractErrorMessage } from '@/utils/helpers'

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function cellAmount(value: string | number | null | undefined): string {
  if (value == null || value === '') return '-'
  const num = Number(value)
  if (!Number.isFinite(num) || num === 0) return '-'
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function printLedgerSummary(input: {
  title: string
  subtitle?: string
  rows: FinanceLedgerEntry[]
  footerNote?: string
}): void {
  if (typeof window === 'undefined') return

  const rowsHtml = input.rows
    .map((row) => {
      return `<tr>
        <td>${escapeHtml(String(row.account ?? '-'))}</td>
        <td>${escapeHtml(cellAmount(row.dr))}</td>
        <td>${escapeHtml(cellAmount(row.cr))}</td>
        <td>${escapeHtml(String(row.type ?? '-'))}</td>
      </tr>`
    })
    .join('')

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(input.title)}</title>
  <style>
    body { font-family: system-ui, sans-serif; color: #111; padding: 24px; }
    h1 { font-size: 18px; margin: 0 0 4px; }
    p { font-size: 12px; color: #555; margin: 0 0 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
    th { background: #f5f5f5; }
    td:nth-child(2), td:nth-child(3) { text-align: right; font-variant-numeric: tabular-nums; }
    .footer { margin-top: 16px; font-size: 11px; color: #666; }
  </style>
</head>
<body>
  <h1>${escapeHtml(input.title)}</h1>
  ${input.subtitle ? `<p>${escapeHtml(input.subtitle)}</p>` : ''}
  <table>
    <thead>
      <tr><th>Account</th><th>DR</th><th>CR</th><th>Type</th></tr>
    </thead>
    <tbody>
      ${rowsHtml || '<tr><td colspan="4">No ledger lines</td></tr>'}
    </tbody>
  </table>
  ${input.footerNote ? `<p class="footer">${escapeHtml(input.footerNote)}</p>` : ''}
</body>
</html>`

  const printWindow = window.open('', '_blank', 'width=900,height=700')
  if (!printWindow) {
    ShowToast.error('Pop-up blocked. Allow pop-ups, then use Print again.')
    return
  }

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  // Give the new document a tick to paint before the print dialog
  printWindow.setTimeout(() => {
    printWindow.print()
  }, 250)
}

/** Fetch invoice or purchase summary, then print — used by the row Print action. */
export async function fetchAndPrintLedgerSummary(input: {
  mode: 'invoice' | 'purchase'
  invoice_id?: number
  purchase_id?: number
  quote_code?: string | null
  title: string
  /** Purchase print uses Quotation: xxxxx under Purchase ID */
  subtitle?: string
}): Promise<void> {
  try {
    if (input.mode === 'invoice') {
      if (!input.invoice_id) {
        ShowToast.error('Missing invoice for print.')
        return
      }

      const response = await apiClient.get<SubmitResponse>(FINANCE_TRANSACTIONS_URL, {
        params: BuildFinanceTransactionsParams({
          view: 'invoice',
          invoice_id: input.invoice_id,
          pageSize: 100,
          page: 1,
        }),
      })

      const rows = (response.data?.data ?? []) as FinanceLedgerEntry[]
      if (rows.length === 0) {
        ShowToast.error('No ledger lines to print.')
        return
      }

      printLedgerSummary({
        title: input.title,
        subtitle: 'DR and CR lines for this invoice.',
        rows,
      })
      return
    }

    const response = await apiClient.get<SubmitResponse>(FINANCE_TRANSACTIONS_URL, {
      params: BuildFinanceTransactionsParams({
        view: 'purchase',
        purchase_id: input.purchase_id,
        quote_code: input.quote_code || undefined,
      }),
    })

    const preview = (response.data?.data ??
      null) as FinancePurchaseTransactionPreview | null
    const rows = (preview?.aggregated_lines ?? []) as FinanceLedgerEntry[]
    if (rows.length === 0) {
      ShowToast.error('No ledger lines to print.')
      return
    }

    const invoiceLabels = (preview?.invoices ?? [])
      .map((inv) => inv.invoice_number ?? `#${inv.invoice_id}`)
      .join(', ')

    const quote =
      preview?.quote_code?.trim() || input.quote_code?.trim() || '—'

    printLedgerSummary({
      title: input.title,
      subtitle: input.subtitle ?? `Quotation: ${quote}`,
      rows,
      footerNote: invoiceLabels ? `Invoices: ${invoiceLabels}` : undefined,
    })
  } catch (error) {
    ShowToast.error(extractErrorMessage(error) || 'Could not print ledger summary.')
  }
}
