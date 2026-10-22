/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from '@/components/ui/badge'
import { ColumnDef } from '@tanstack/table-core'

/** Columns for Finance > Invoices > Travel (no vehicle column). */
export const TravelInvoiceReportColumns: ColumnDef<any>[] = [
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
    id: 'customer',
    header: () => <div>Customer</div>,
    cell: ({ row }) => {
      const c = row.original.customer
      return (
        <div className="space-y-0.5">
          <div>{c?.name ?? '-'}</div>
          <div className="text-xs text-muted-foreground">{c?.email ?? ''}</div>
        </div>
      )
    },
  },
  {
    accessorKey: 'cover_start_date',
    header: () => <div>Cover start</div>,
    cell: ({ row }) => <div>{row.original.cover_start_date ?? '-'}</div>,
  },
  {
    id: 'amount',
    header: () => <div>Amount</div>,
    cell: ({ row }) => {
      // Payment currency (KES today) — never invent USD from config
      const currency =
        row.original.payment_currency ?? row.original.currency ?? ''
      const amount =
        row.original.installment_amount ?? row.original.gross_premium ?? '-'
      return (
        <div>
          {currency ? `${currency} ` : ''}
          {amount}
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: () => <div>Status</div>,
    cell: ({ row }) => {
      const status = String(row.original.status ?? '').toLowerCase()
      const label = row.original.status ?? '—'

      if (status === 'paid') {
        return (
          <Badge className="rounded-full border-transparent bg-black text-white hover:bg-black">
            {label}
          </Badge>
        )
      }

      if (status === 'pending') {
        return (
          <Badge
            variant="outline"
            className="rounded-full border-[#BF162E] bg-transparent text-black"
          >
            {label}
          </Badge>
        )
      }

      return (
        <Badge variant="outline" className="rounded-full">
          {label}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'due_date',
    header: () => <div>Due</div>,
    cell: ({ row }) => <div>{row.original.due_date ?? '-'}</div>,
  },
]
