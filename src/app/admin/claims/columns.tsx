import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import type { ClaimListRow } from '@/utils/claims'
import { claimsDetailPath } from '@/utils/enums'
import { ColumnDef } from '@tanstack/table-core'
import { Link } from 'react-router-dom'
import { ClaimTatBadge } from './claim-ui'

export const claimColumns: ColumnDef<ClaimListRow>[] = [
  {
    accessorKey: 'claim_number',
    header: () => <div>Claim number</div>,
    cell: ({ row }) => (
      <Link
        className="font-medium text-primary underline-offset-4 hover:underline"
        to={claimsDetailPath(row.original.uuid)}
      >
        {row.original.claim_number}
      </Link>
    ),
  },
  {
    accessorKey: 'insurer_claim_number',
    header: () => <div>Insurer number</div>,
    cell: ({ row }) => <div>{row.original.insurer_claim_number || '—'}</div>,
  },
  {
    accessorKey: 'registration_number',
    header: () => <div>Registration</div>,
    cell: ({ row }) => <div>{row.original.registration_number || '—'}</div>,
  },
  {
    accessorKey: 'policy_number',
    header: () => <div>Policy</div>,
    cell: ({ row }) => <div>{row.original.policy_number || '—'}</div>,
  },
  {
    accessorKey: 'status_label',
    header: () => <div>Status</div>,
    cell: ({ row }) => (
      <Badge className="rounded-lg bg-gray-100 font-semibold text-gray-800">
        {row.original.status_label}
      </Badge>
    ),
  },
  {
    id: 'tat_badge',
    header: () => <div>TAT</div>,
    cell: ({ row }) => <ClaimTatBadge badge={row.original.tat_badge} />,
  },
  {
    accessorKey: 'claimant_name',
    header: () => <div>Claimant</div>,
    cell: ({ row }) => <div>{row.original.claimant_name || '—'}</div>,
  },
  {
    accessorKey: 'handler_name',
    header: () => <div>Handler</div>,
    cell: ({ row }) => <div>{row.original.handler_name || '—'}</div>,
  },
  {
    id: 'open',
    header: () => <div>Action</div>,
    cell: ({ row }) => (
      <Link
        className={buttonVariants({ variant: 'outline', size: 'sm' })}
        to={claimsDetailPath(row.original.uuid)}
      >
        Open
      </Link>
    ),
  },
]
