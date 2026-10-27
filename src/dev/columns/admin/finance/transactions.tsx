import { formatDate, formatNumber, parseMoneyString } from '@/lib/format'
import type {
  FinanceLedgerEntry,
  FinanceTransactionInvoiceRow,
  FinanceTransactionPurchaseRow,
} from '@/types/types'
import type { ColumnDef } from '@tanstack/table-core'

/** Show money or a dash when zero / empty (ledger lines need 2 decimal places). */
function FormatLedgerAmount(value: string | number | null | undefined) {
  const amount = parseMoneyString(value)
  if (!amount) {
    return <span className="text-muted-foreground">-</span>
  }
  return <div className="font-medium tabular-nums">{formatNumber(amount, 2)}</div>
}

/**
 * Columns for Per Invoice preview (full DR/CR detail).
 */
export const FinanceTransactionsColumns: ColumnDef<FinanceLedgerEntry>[] = [
  {
    accessorKey: 'account',
    header: () => <div>Account</div>,
    cell: ({ row }) => (
      <div className="max-w-[220px] truncate" title={row.original.account ?? undefined}>
        {row.original.account || '-'}
      </div>
    ),
  },
  {
    accessorKey: 'dr',
    header: () => <div>DR</div>,
    cell: ({ row }) => FormatLedgerAmount(row.original.dr),
  },
  {
    accessorKey: 'cr',
    header: () => <div>CR</div>,
    cell: ({ row }) => FormatLedgerAmount(row.original.cr),
  },
  {
    accessorKey: 'type',
    header: () => <div>Type</div>,
    cell: ({ row }) => <div className="capitalize">{row.original.type || '-'}</div>,
  },
  {
    accessorKey: 'entry_type',
    header: () => <div>Entry type</div>,
    cell: ({ row }) => {
      const kind = row.original.entry_type
      if (!kind) {
        return <span className="text-muted-foreground">-</span>
      }
      return <div className="capitalize">{kind}</div>
    },
  },
  {
    id: 'invoice_ref',
    header: () => <div>Invoice</div>,
    cell: ({ row }) => {
      const id = row.original.invoice_id
      const number = row.original.invoice?.invoice_number
      if (!id && !number) {
        return <span className="text-muted-foreground">-</span>
      }
      return <div className="text-sm">{number ? number : `#${id}`}</div>
    },
  },
  {
    id: 'purchase_ref',
    header: () => <div>Purchase</div>,
    cell: ({ row }) => {
      const id = row.original.purchase_id
      const reference =
        row.original.purchase?.quote_code ?? row.original.purchase?.reference
      if (!id && !reference) {
        return <span className="text-muted-foreground">-</span>
      }
      return <div className="text-sm">{reference ? reference : `#${id}`}</div>
    },
  },
  {
    accessorKey: 'created_at',
    header: () => <div>Created</div>,
    cell: ({ row }) => (
      <div>
        {row.original.created_at ? formatDate(row.original.created_at) : '-'}
      </div>
    ),
  },
]

/**
 * Per Purchase preview — Account / DR / CR / Type only.
 * No Invoice, Purchase, or Created (those belong on Per Invoice).
 */
export const FinancePurchasePreviewColumns: ColumnDef<FinanceLedgerEntry>[] = [
  {
    accessorKey: 'account',
    header: () => <div>Account</div>,
    cell: ({ row }) => (
      <div className="max-w-[220px] truncate" title={row.original.account ?? undefined}>
        {row.original.account || '-'}
      </div>
    ),
  },
  {
    accessorKey: 'dr',
    header: () => <div>DR</div>,
    cell: ({ row }) => FormatLedgerAmount(row.original.dr),
  },
  {
    accessorKey: 'cr',
    header: () => <div>CR</div>,
    cell: ({ row }) => FormatLedgerAmount(row.original.cr),
  },
  {
    accessorKey: 'type',
    header: () => <div>Type</div>,
    cell: ({ row }) => <div className="capitalize">{row.original.type || '-'}</div>,
  },
  {
    accessorKey: 'entry_type',
    header: () => <div>Entry type</div>,
    cell: ({ row }) => {
      const kind = row.original.entry_type
      if (!kind) {
        return <span className="text-muted-foreground">-</span>
      }
      return <div className="capitalize">{kind}</div>
    },
  },
]

/** Main table — Per Invoice tab (searchable invoices, then Preview). */
export const FinanceTransactionInvoiceColumns: ColumnDef<FinanceTransactionInvoiceRow>[] =
  [
    {
      accessorKey: 'invoice_number',
      header: () => <div>Invoice</div>,
      cell: ({ row }) => (
        <div className="font-medium">{row.original.invoice_number ?? '-'}</div>
      ),
    },
    {
      accessorKey: 'quote_code',
      header: () => <div>Quote</div>,
      cell: ({ row }) => <div>{row.original.quote_code ?? '-'}</div>,
    },
    {
      accessorKey: 'status',
      header: () => <div>Status</div>,
      cell: ({ row }) => (
        <div className="capitalize">{row.original.status ?? '-'}</div>
      ),
    },
    {
      accessorKey: 'installment_amount',
      header: () => <div>Amount</div>,
      cell: ({ row }) => FormatLedgerAmount(row.original.installment_amount),
    },
    {
      accessorKey: 'ledger_lines_count',
      header: () => <div>Lines</div>,
      cell: ({ row }) => (
        <div className="tabular-nums">{row.original.ledger_lines_count ?? 0}</div>
      ),
    },
    {
      accessorKey: 'created_at',
      header: () => <div>Created</div>,
      cell: ({ row }) => (
        <div>
          {row.original.created_at ? formatDate(row.original.created_at) : '-'}
        </div>
      ),
    },
  ]

/** Main table — Per Purchase tab (Purchase ID first; Quotation for search context). */
export const FinanceTransactionPurchaseColumns: ColumnDef<FinanceTransactionPurchaseRow>[] =
  [
    {
      accessorKey: 'purchase_id',
      header: () => <div>Purchase ID</div>,
      cell: ({ row }) => (
        <div className="font-medium tabular-nums">
          {row.original.purchase_id ?? row.original.id ?? '-'}
        </div>
      ),
    },
    {
      accessorKey: 'quote_code',
      header: () => <div>Quotation</div>,
      cell: ({ row }) => <div>{row.original.quote_code ?? '-'}</div>,
    },
    {
      accessorKey: 'product',
      header: () => <div>Product</div>,
      cell: ({ row }) => (
        <div className="capitalize">{row.original.product ?? '-'}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: () => <div>Status</div>,
      cell: ({ row }) => (
        <div className="capitalize">{row.original.status ?? '-'}</div>
      ),
    },
    {
      accessorKey: 'total_premium',
      header: () => <div>Total Premium</div>,
      cell: ({ row }) => FormatLedgerAmount(row.original.total_premium),
    },
    {
      accessorKey: 'invoices_count',
      header: () => <div>Invoices</div>,
      cell: ({ row }) => (
        <div className="tabular-nums">{row.original.invoices_count ?? 0}</div>
      ),
    },
  ]
