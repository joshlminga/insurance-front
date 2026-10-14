/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from '@/components/ui/badge'
import type { TravelQuoteFetchListRow } from '@/types/types'
import { ColumnDef } from '@tanstack/table-core'

const statusBadgeClass = (status?: string) => {
  switch (status) {
    case 'cancelled':
      return 'border border-[#C20C0C] bg-transparent text-[#C20C0C]'
    case 'calculated':
      return 'border-transparent bg-black text-white'
    case 'in_progress':
      return 'border-transparent bg-[#C20C0C] text-white'
    default:
      return 'border-transparent bg-slate-100 text-slate-800'
  }
}

const stageBadgeClass = (stage?: string) => {
  switch (stage) {
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

export const TravelQuoteFetchColumns: ColumnDef<TravelQuoteFetchListRow>[] = [
  {
    accessorKey: 'quote_code',
    header: () => <div>Quote code</div>,
    cell: ({ row }) => <div className="font-medium">{row.original.quote_code ?? '-'}</div>,
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
      <Badge
        variant="outline"
        className={`rounded-full capitalize ${statusBadgeClass(row.original.status)}`}
      >
        {(row.original.status ?? '-').replaceAll('_', ' ')}
      </Badge>
    ),
  },
  {
    accessorKey: 'last_ended_stage',
    header: () => <div>Last stage</div>,
    cell: ({ row }) => (
      <Badge className={`rounded-full capitalize ${stageBadgeClass(row.original.last_ended_stage)}`}>
        {row.original.last_ended_stage ?? '-'}
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
          <div>{c?.name ?? '-'}</div>
          <div className="text-xs text-muted-foreground">{c?.email ?? c?.phone ?? ''}</div>
        </div>
      )
    },
  },
  {
    id: 'trip',
    header: () => <div>Trip</div>,
    cell: ({ row }) => {
      const trip = row.original.trip
      const from = trip?.country_of_departure_name ?? '-'
      const to = trip?.country_of_arrival_name ?? '-'
      const travelers =
        trip?.traveler_count != null ? `${trip.traveler_count} traveler(s)` : ''
      return (
        <div className="space-y-0.5">
          <div>
            {from} → {to}
          </div>
          <div className="text-xs text-muted-foreground">
            {[trip?.bound, trip?.travel_as, travelers].filter(Boolean).join(' · ')}
          </div>
        </div>
      )
    },
  },
  {
    id: 'dates',
    header: () => <div>Travel dates</div>,
    cell: ({ row }) => {
      const trip = row.original.trip
      return (
        <div className="space-y-0.5 text-sm">
          <div>{trip?.date_of_departure ?? '-'}</div>
          <div className="text-xs text-muted-foreground">{trip?.date_of_return ?? ''}</div>
        </div>
      )
    },
  },
  {
    id: 'agency',
    header: () => <div>Agency</div>,
    cell: ({ row }) => <div>{row.original.agency?.name ?? '-'}</div>,
  },
  {
    accessorKey: 'started_at',
    header: () => <div>Started</div>,
    cell: ({ row }) => {
      const value = row.original.started_at
      if (!value) return <div>-</div>
      try {
        return <div>{new Date(value).toLocaleString()}</div>
      } catch {
        return <div>{value}</div>
      }
    },
  },
]
