/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from '@/components/ui/badge'
import type { MotorQuoteFetchListRow } from '@/types/types'
import { ColumnDef } from '@tanstack/table-core'

const stageBadgeClass = (stage?: string) => {
  switch (stage) {
    case 'certificate':
      return 'bg-emerald-100 text-emerald-800'
    case 'payment':
      return 'bg-amber-100 text-amber-800'
    case 'kyc':
      return 'bg-sky-100 text-sky-800'
    case 'rates':
      return 'bg-violet-100 text-violet-800'
    default:
      return 'bg-slate-100 text-slate-800'
  }
}

export const MotorQuoteFetchColumns: ColumnDef<MotorQuoteFetchListRow>[] = [
  {
    accessorKey: 'quote_code',
    header: () => <div>Quote code</div>,
    cell: ({ row }) => <div className="font-medium">{row.original.quote_code ?? '—'}</div>,
  },
  {
    accessorKey: 'id',
    header: () => <div>ID</div>,
    cell: ({ row }) => <div>{row.original.id}</div>,
  },
  {
    accessorKey: 'status',
    header: () => <div>Status</div>,
    cell: ({ row }) => (
      <Badge variant="outline" className="rounded-full capitalize">
        {(row.original.status ?? '—').replaceAll('_', ' ')}
      </Badge>
    ),
  },
  {
    accessorKey: 'last_ended_stage',
    header: () => <div>Last stage</div>,
    cell: ({ row }) => (
      <Badge className={`rounded-full capitalize ${stageBadgeClass(row.original.last_ended_stage)}`}>
        {row.original.last_ended_stage ?? '—'}
      </Badge>
    ),
  },
  {
    id: 'customer',
    header: () => <div>Customer</div>,
    cell: ({ row }) => {
      const c = row.original.customer
      return (
        <div className="space-y-0.5">
          <div>{c?.name ?? '—'}</div>
          <div className="text-xs text-muted-foreground">{c?.email ?? c?.phone ?? ''}</div>
        </div>
      )
    },
  },
  {
    id: 'vehicle',
    header: () => <div>Vehicle</div>,
    cell: ({ row }) => {
      const v = row.original.vehicle
      return (
        <div className="space-y-0.5">
          <div>{v?.registration_number ?? '—'}</div>
          <div className="text-xs text-muted-foreground">{v?.chassis_number ?? ''}</div>
        </div>
      )
    },
  },
  {
    id: 'cover',
    header: () => <div>Cover</div>,
    cell: ({ row }) => <div>{row.original.cover?.cover_type ?? '—'}</div>,
  },
  {
    id: 'agency',
    header: () => <div>Agency</div>,
    cell: ({ row }) => <div>{row.original.agency?.name ?? '—'}</div>,
  },
  {
    accessorKey: 'started_at',
    header: () => <div>Started</div>,
    cell: ({ row }) => {
      const value = row.original.started_at
      if (!value) return <div>—</div>
      try {
        return <div>{new Date(value).toLocaleString()}</div>
      } catch {
        return <div>{value}</div>
      }
    },
  },
]
