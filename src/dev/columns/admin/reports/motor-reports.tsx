/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from '@/components/ui/badge'
import { ColumnDef } from '@tanstack/table-core'

export const MotorInvoiceReportColumns: ColumnDef<any>[] = [
  {
    accessorKey: 'invoice_number',
    header: () => <div>Invoice</div>,
    cell: ({ row }) => <div className="font-medium">{row.original.invoice_number ?? '—'}</div>,
  },
  {
    accessorKey: 'quotation_code',
    header: () => <div>Quote</div>,
    cell: ({ row }) => <div>{row.original.quotation_code ?? '—'}</div>,
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
    id: 'customer',
    header: () => <div>Customer</div>,
    cell: ({ row }) => {
      const c = row.original.customer
      return (
        <div className="space-y-0.5">
          <div>{c?.name ?? '—'}</div>
          <div className="text-xs text-muted-foreground">{c?.email ?? ''}</div>
        </div>
      )
    },
  },
  {
    id: 'vehicle',
    header: () => <div>Vehicle</div>,
    cell: ({ row }) => <div>{row.original.vehicle?.registration_number ?? '—'}</div>,
  },
  {
    accessorKey: 'installment_amount',
    header: () => <div>Amount</div>,
    cell: ({ row }) => <div>{row.original.installment_amount ?? row.original.gross_premium ?? '—'}</div>,
  },
  {
    accessorKey: 'due_date',
    header: () => <div>Due</div>,
    cell: ({ row }) => <div>{row.original.due_date ?? '—'}</div>,
  },
]

export const MotorReceiptReportColumns: ColumnDef<any>[] = [
  {
    accessorKey: 'receipt_number',
    header: () => <div>Receipt</div>,
    cell: ({ row }) => <div className="font-medium">{row.original.receipt_number ?? '—'}</div>,
  },
  {
    accessorKey: 'invoice_number',
    header: () => <div>Invoice</div>,
    cell: ({ row }) => <div>{row.original.invoice_number ?? '—'}</div>,
  },
  {
    accessorKey: 'quotation_code',
    header: () => <div>Quote</div>,
    cell: ({ row }) => <div>{row.original.quotation_code ?? '—'}</div>,
  },
  {
    accessorKey: 'via',
    header: () => <div>Via</div>,
    cell: ({ row }) => <div>{row.original.via ?? '—'}</div>,
  },
  {
    accessorKey: 'amount',
    header: () => <div>Amount</div>,
    cell: ({ row }) => <div>{row.original.amount ?? '—'}</div>,
  },
  {
    id: 'customer',
    header: () => <div>Customer</div>,
    cell: ({ row }) => <div>{row.original.customer?.name ?? '—'}</div>,
  },
  {
    id: 'vehicle',
    header: () => <div>Vehicle</div>,
    cell: ({ row }) => <div>{row.original.vehicle?.registration_number ?? '—'}</div>,
  },
  {
    accessorKey: 'created_at',
    header: () => <div>Created</div>,
    cell: ({ row }) => {
      const value = row.original.created_at
      if (!value) return <div>—</div>
      try {
        return <div>{new Date(value).toLocaleString()}</div>
      } catch {
        return <div>{value}</div>
      }
    },
  },
]
