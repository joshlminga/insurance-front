import type { ColumnDef } from '@tanstack/table-core'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { CopyCell } from '@/dev/columns'
import { formatDate } from '@/lib/format'
import type {
  FailedMotorCertificateRow,
  MotorCertificateRow,
} from '@/app/admin/motor-certificates/motor-certificates-query'

type IssuedColumnsOptions = {
  showDownload?: boolean
}

/** Show CopyCell when there is a real value; otherwise a plain dash. */
function copyOrDash(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  if (trimmed === '') {
    return <div>-</div>
  }
  return <CopyCell value={trimmed} />
}

export function BuildMotorCertificateColumns(
  _options: IssuedColumnsOptions = {}
): ColumnDef<MotorCertificateRow>[] {
  return [
    {
      accessorKey: 'invoice_number',
      header: () => <div>Invoice</div>,
      cell: ({ row }) => {
        const value =
          row.original.invoice_number?.trim() ||
          `#${row.original.invoice_id}`
        return (
          <div className="text-sm font-medium">
            <CopyCell value={value} />
          </div>
        )
      },
    },
    {
      accessorKey: 'registration_number',
      header: () => <div>Registration</div>,
      cell: ({ row }) => copyOrDash(row.original.registration_number),
    },
    {
      accessorKey: 'certificate_number',
      header: () => <div>Certificate</div>,
      cell: ({ row }) => {
        const status = row.original.policy_allocation_status
          ?.toString()
          .toLowerCase()
        const isCancelled = status === 'cancelled'
        const certNumber = row.original.certificate_number?.trim() ?? ''

        return (
          <div className="space-y-1">
            {certNumber !== '' ? (
              <CopyCell value={certNumber} />
            ) : (
              <div>-</div>
            )}
            {/* Only Cancelled needs to stand out for the user */}
            {isCancelled ? (
              <Badge variant="destructive">Cancelled</Badge>
            ) : null}
          </div>
        )
      },
    },
    {
      accessorKey: 'policy_number',
      header: () => <div>Policy</div>,
      cell: ({ row }) => copyOrDash(row.original.policy_number),
    },
    {
      accessorKey: 'customer',
      header: () => <div>Customer</div>,
      cell: ({ row }) => (
        <div className="text-sm">
          <div>{row.original.customer?.name ?? '-'}</div>
          <div className="text-muted-foreground">
            {row.original.customer?.email ?? ''}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'issued_date',
      header: () => <div>Issued</div>,
      cell: ({ row }) => (
        <div>
          {row.original.issued_date
            ? formatDate(row.original.issued_date)
            : '-'}
        </div>
      ),
    },
    {
      accessorKey: 'expiry_date',
      header: () => <div>Expiry</div>,
      cell: ({ row }) => (
        <div>
          {row.original.expiry_date
            ? formatDate(row.original.expiry_date)
            : '-'}
        </div>
      ),
    },
  ]
}

type FailedColumnsOptions = {
  showSelection?: boolean
  selectedIds?: Set<number>
  onToggleRow?: (row: FailedMotorCertificateRow, checked: boolean) => void
  onToggleAll?: (rows: FailedMotorCertificateRow[], checked: boolean) => void
}

export function BuildFailedMotorCertificateColumns(
  options: FailedColumnsOptions = {}
): ColumnDef<FailedMotorCertificateRow>[] {
  const { showSelection, selectedIds, onToggleRow, onToggleAll } = options
  const columns: ColumnDef<FailedMotorCertificateRow>[] = []

  if (showSelection) {
    columns.push({
      id: 'select',
      header: ({ table }) => {
        const rows = table.getRowModel().rows.map((row) => row.original)
        const allSelected =
          rows.length > 0 &&
          rows.every((row) => selectedIds?.has(row.invoice_id))

        return (
          <Checkbox
            checked={allSelected}
            onCheckedChange={(checked) =>
              onToggleAll?.(rows, checked === true)
            }
            aria-label="Select all failed invoices"
          />
        )
      },
      cell: ({ row }) => (
        <Checkbox
          checked={selectedIds?.has(row.original.invoice_id) ?? false}
          onCheckedChange={(checked) =>
            onToggleRow?.(row.original, checked === true)
          }
          aria-label={`Select invoice ${row.original.invoice_id}`}
        />
      ),
      enableSorting: false,
    })
  }

  columns.push(
    {
      accessorKey: 'invoice_number',
      header: () => <div>Invoice</div>,
      cell: ({ row }) => {
        const value =
          row.original.invoice_number?.trim() ||
          `#${row.original.invoice_id}`
        return (
          <div className="text-sm font-medium">
            <CopyCell value={value} />
          </div>
        )
      },
    },
    {
      accessorKey: 'registration_number',
      header: () => <div>Registration</div>,
      cell: ({ row }) => copyOrDash(row.original.registration_number),
    },
    {
      accessorKey: 'customer',
      header: () => <div>Customer</div>,
      cell: ({ row }) => (
        <div className="text-sm">
          <div>{row.original.customer?.name ?? '-'}</div>
          <div className="text-muted-foreground">
            {row.original.customer?.email ?? ''}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'dmvic_issuance_failed_at',
      header: () => <div>Failed at</div>,
      cell: ({ row }) => (
        <div>
          {row.original.dmvic_issuance_failed_at
            ? formatDate(row.original.dmvic_issuance_failed_at)
            : '-'}
        </div>
      ),
    },
    {
      accessorKey: 'paid_at_hint',
      header: () => <div>Paid</div>,
      cell: ({ row }) => (
        <div>
          {row.original.paid_at_hint
            ? formatDate(row.original.paid_at_hint)
            : '-'}
        </div>
      ),
    }
  )

  return columns
}
