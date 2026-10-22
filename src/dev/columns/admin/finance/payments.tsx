/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from '@tanstack/table-core'

/** Columns for Finance > Payments (successful gateway / credit charges). */
export const FinancePaymentColumns: ColumnDef<any>[] = [
  {
    accessorKey: 'invoice_number',
    header: () => <div>Invoice</div>,
    cell: ({ row }) => (
      <div className="font-medium">{row.original.invoice_number ?? '-'}</div>
    ),
  },
  {
    accessorKey: 'quotation_code',
    header: () => <div>Quote</div>,
    cell: ({ row }) => <div>{row.original.quotation_code ?? '-'}</div>,
  },
  {
    id: 'amount',
    header: () => <div>Amount</div>,
    cell: ({ row }) => {
      const currency =
        row.original.payment_currency ?? row.original.currency ?? ''
      return (
        <div>
          {currency ? `${currency} ` : ''}
          {row.original.amount ?? '-'}
        </div>
      )
    },
  },
  {
    accessorKey: 'channel_label',
    header: () => <div>Channel</div>,
    cell: ({ row }) => (
      <div>{row.original.channel_label ?? row.original.channel ?? '-'}</div>
    ),
  },
  {
    accessorKey: 'reference',
    header: () => <div>Reference</div>,
    cell: ({ row }) => <div>{row.original.reference ?? '-'}</div>,
  },
  {
    accessorKey: 'paid_at',
    header: () => <div>Paid at</div>,
    cell: ({ row }) => {
      const value = row.original.paid_at
      if (!value) return <div>-</div>
      try {
        return <div>{new Date(value).toLocaleString()}</div>
      } catch {
        return <div>{value}</div>
      }
    },
  },
]
