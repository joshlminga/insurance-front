/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/format'
import { ColumnDef } from '@tanstack/table-core'

const statusBadgeClass = (status?: string) => {
  switch (status) {
    case 'cancelled':
      return 'border border-[#C20C0C] bg-transparent text-[#C20C0C]'
    case 'converted_to_policy':
      return 'border-transparent bg-emerald-100 text-emerald-800'
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

export type CustomerQuotationRow = {
  id: number
  quote_code?: string
  status?: string
  last_ended_stage?: string
  started_at?: string
  last_activity_at?: string
  vehicle?: { registration_number?: string; make?: string; model?: string } | null
  trip?: {
    country_of_arrival_name?: string | null
    date_of_departure?: string | null
    traveler_count?: number
  } | null
  cover_type?: string | null
}

export const CustomerMotorQuotationsColumns: ColumnDef<CustomerQuotationRow>[] = [
  {
    accessorKey: 'quote_code',
    header: () => <div>Quote code</div>,
    cell: ({ row }) => <div className="font-medium">{row.original.quote_code ?? '-'}</div>,
  },
  {
    id: 'vehicle',
    header: () => <div>Vehicle</div>,
    cell: ({ row }) => {
      const v = row.original.vehicle
      const label = [v?.make, v?.model].filter(Boolean).join(' ')
      return (
        <div className="space-y-0.5">
          <div>{v?.registration_number ?? '-'}</div>
          {label ? <div className="text-xs text-muted-foreground">{label}</div> : null}
        </div>
      )
    },
  },
  {
    accessorKey: 'cover_type',
    header: () => <div>Cover</div>,
    cell: ({ row }) => <div>{row.original.cover_type ?? '-'}</div>,
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
    header: () => <div>Stage</div>,
    cell: ({ row }) => (
      <Badge className={`rounded-full capitalize ${stageBadgeClass(row.original.last_ended_stage)}`}>
        {row.original.last_ended_stage ?? '-'}
      </Badge>
    ),
  },
  {
    accessorKey: 'last_activity_at',
    header: () => <div>Last activity</div>,
    cell: ({ row }) => (
      <div>{formatDate(row.original.last_activity_at ?? row.original.started_at ?? '')}</div>
    ),
  },
]

export const CustomerTravelQuotationsColumns: ColumnDef<CustomerQuotationRow>[] = [
  {
    accessorKey: 'quote_code',
    header: () => <div>Quote code</div>,
    cell: ({ row }) => <div className="font-medium">{row.original.quote_code ?? '-'}</div>,
  },
  {
    id: 'trip',
    header: () => <div>Trip</div>,
    cell: ({ row }) => {
      const trip = row.original.trip
      return (
        <div className="space-y-0.5">
          <div>{trip?.country_of_arrival_name ?? '-'}</div>
          <div className="text-xs text-muted-foreground">
            {[trip?.date_of_departure, trip?.traveler_count != null ? `${trip.traveler_count} traveller(s)` : null]
              .filter(Boolean)
              .join(' · ') || ''}
          </div>
        </div>
      )
    },
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
    header: () => <div>Stage</div>,
    cell: ({ row }) => (
      <Badge className={`rounded-full capitalize ${stageBadgeClass(row.original.last_ended_stage)}`}>
        {row.original.last_ended_stage ?? '-'}
      </Badge>
    ),
  },
  {
    accessorKey: 'last_activity_at',
    header: () => <div>Last activity</div>,
    cell: ({ row }) => (
      <div>{formatDate(row.original.last_activity_at ?? row.original.started_at ?? '')}</div>
    ),
  },
]
