/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from '@/components/ui/badge'
import { CopyCell } from '@/dev/columns'
import { ColumnDef } from '@tanstack/table-core'

/**
 * Quote belongs to agency_location when that is set.
 * When agency is missing, it belongs to processed_by_location.
 * The badge only shows when that owner is not the report location, and it shows the owner name.
 */
function quoteOwnerLocation(row: any) {
  return row?.agency_location ?? row?.processed_by_location ?? null
}

const CrossOrgBadge = ({ row }: { row: any }) => {
  if (!row?.processed_by_other_organization) return null
  const ownerName = quoteOwnerLocation(row)?.name?.trim() || 'Other org'
  return (
    <Badge
      variant="outline"
      className="rounded-full border-amber-500 text-amber-700"
    >
      {ownerName}
    </Badge>
  )
}

/** Show CopyCell when there is a real value; otherwise a plain dash. */
function copyOrDash(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  if (trimmed === '') {
    return <div>-</div>
  }
  return <CopyCell value={trimmed} />
}

export const OrganizationCustomerReportColumns: ColumnDef<any>[] = [
  {
    accessorKey: 'name',
    header: () => <div>Name</div>,
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="font-medium">{row.original.name ?? '-'}</div>
        {row.original.is_admin_also ? (
          <Badge
            variant="outline"
            className="rounded-full border-sky-500 text-sky-700"
          >
            Also admin
          </Badge>
        ) : null}
      </div>
    ),
  },
  {
    accessorKey: 'email',
    header: () => <div>Email</div>,
    cell: ({ row }) => <div>{row.original.email ?? '-'}</div>,
  },
  {
    accessorKey: 'phone',
    header: () => <div>Phone</div>,
    cell: ({ row }) => <div>{row.original.phone ?? '-'}</div>,
  },
  {
    accessorKey: 'joined_at',
    header: () => <div>Joined</div>,
    cell: ({ row }) => (
      <div>
        {row.original.joined_at
          ? new Date(row.original.joined_at).toLocaleDateString()
          : '-'}
      </div>
    ),
  },
]

export const OrganizationMotorVehicleReportColumns: ColumnDef<any>[] = [
  {
    accessorKey: 'registration_number',
    header: () => <div>Registration</div>,
    cell: ({ row }) => copyOrDash(row.original.registration_number),
  },
  {
    accessorKey: 'chassis_number',
    header: () => <div>Chassis</div>,
    cell: ({ row }) => copyOrDash(row.original.chassis_number),
  },
  {
    accessorKey: 'make',
    header: () => <div>Make</div>,
    cell: ({ row }) => <div>{row.original.make ?? '-'}</div>,
  },
  {
    accessorKey: 'model',
    header: () => <div>Model</div>,
    cell: ({ row }) => <div>{row.original.model ?? '-'}</div>,
  },
  {
    accessorKey: 'body_type',
    header: () => <div>Body</div>,
    cell: ({ row }) => <div>{row.original.body_type ?? '-'}</div>,
  },
  {
    accessorKey: 'color',
    header: () => <div>Color</div>,
    cell: ({ row }) => <div>{row.original.color ?? '-'}</div>,
  },
  {
    accessorKey: 'year',
    header: () => <div>Year</div>,
    cell: ({ row }) => <div>{row.original.year ?? '-'}</div>,
  },
]

/** Shared quotation report columns (motor + travel). Motor rows may include vehicle. */
export const OrganizationQuotationReportColumns: ColumnDef<any>[] = [
  {
    accessorKey: 'quote_code',
    header: () => <div>Quote</div>,
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="font-medium">{row.original.quote_code ?? '-'}</div>
        {/* Motor list rows already include vehicle — show reg under the quote code */}
        {row.original.vehicle?.registration_number ? (
          <div className="text-xs text-muted-foreground">
            {row.original.vehicle.registration_number}
          </div>
        ) : null}
        <CrossOrgBadge row={row.original} />
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: () => <div>Status</div>,
    cell: ({ row }) => <div>{row.original.status ?? '-'}</div>,
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
    id: 'agent',
    header: () => <div>Agent</div>,
    cell: ({ row }) => <div>{row.original.agent?.name ?? '-'}</div>,
  },
  {
    id: 'insurer',
    header: () => <div>Insurer</div>,
    cell: ({ row }) => <div>{row.original.insurer?.name ?? '-'}</div>,
  },
  {
    accessorKey: 'started_at',
    header: () => <div>Started</div>,
    cell: ({ row }) => (
      <div>
        {row.original.started_at
          ? new Date(row.original.started_at).toLocaleDateString()
          : '-'}
      </div>
    ),
  },
  {
    id: 'successful',
    header: () => <div>Purchased</div>,
    cell: ({ row }) => (
      <div>{row.original.is_successful_purchase ? 'Yes' : 'No'}</div>
    ),
  },
  {
    id: 'issue_reason',
    header: () => <div>Issue Reason</div>,
    cell: ({ row }) => {
      const label = row.original.issue_reason_label
      const other = row.original.other_reason
      if (!label) {
        return <div>-</div>
      }
      return (
        <div className="space-y-0.5">
          <div>{label}</div>
          {other ? (
            <div className="text-xs text-muted-foreground">{other}</div>
          ) : null}
        </div>
      )
    },
  },
]

export const OrganizationCertificateReportColumns: ColumnDef<any>[] = [
  {
    accessorKey: 'certificate_number',
    header: () => <div>Certificate</div>,
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="font-medium">{row.original.certificate_number ?? '-'}</div>
        <CrossOrgBadge row={row.original} />
      </div>
    ),
  },
  {
    accessorKey: 'policy_number',
    header: () => <div>Policy</div>,
    cell: ({ row }) => <div>{row.original.policy_number ?? '-'}</div>,
  },
  {
    accessorKey: 'registration_number',
    header: () => <div>Registration</div>,
    cell: ({ row }) => <div>{row.original.registration_number ?? '-'}</div>,
  },
  {
    id: 'insurer',
    header: () => <div>Insurer</div>,
    cell: ({ row }) => <div>{row.original.insurer?.name ?? '-'}</div>,
  },
  {
    accessorKey: 'issued_date',
    header: () => <div>Issued</div>,
    cell: ({ row }) => <div>{row.original.issued_date ?? '-'}</div>,
  },
  {
    accessorKey: 'expiry_date',
    header: () => <div>Expiry</div>,
    cell: ({ row }) => <div>{row.original.expiry_date ?? '-'}</div>,
  },
]
