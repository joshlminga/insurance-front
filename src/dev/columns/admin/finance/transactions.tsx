import { formatDate, formatNumber, parseMoneyString } from '@/lib/format'
import type { FinanceLedgerEntry } from '@/types/types'
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
 * Columns for Finance → Transactions (Per Invoice / Per Purchase).
 * Mirrors LedgerEntry fields from the API.
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
      return (
        <div className="text-sm">
          {number ? number : `#${id}`}
        </div>
      )
    },
  },
  {
    id: 'purchase_ref',
    header: () => <div>Purchase</div>,
    cell: ({ row }) => {
      const id = row.original.purchase_id
      const reference = row.original.purchase?.reference
      if (!id && !reference) {
        return <span className="text-muted-foreground">-</span>
      }
      return (
        <div className="text-sm">
          {reference ? reference : `#${id}`}
        </div>
      )
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
  {
    accessorKey: 'updated_at',
    header: () => <div>Updated</div>,
    cell: ({ row }) => (
      <div>
        {row.original.updated_at ? formatDate(row.original.updated_at) : '-'}
      </div>
    ),
  },
]
