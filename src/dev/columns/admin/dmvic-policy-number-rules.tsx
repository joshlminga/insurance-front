/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from '@/components/ui/badge'
import type { DmvicPolicyNumberRuleRow } from '@/app/admin/dmvic-stock/dmvic-stock-query'
import { ColumnDef } from '@tanstack/table-core'

export const DmvicPolicyNumberRuleColumns: ColumnDef<DmvicPolicyNumberRuleRow>[] = [
  {
    accessorKey: 'template',
    header: () => <div>Template</div>,
    cell: ({ row }) => (
      <div className="max-w-xs truncate" title={row.getValue('template') as string}>
        {row.getValue('template')}
      </div>
    ),
  },
  {
    accessorKey: 'series',
    header: () => <div>Series</div>,
    cell: ({ row }) => <div>{row.getValue('series')}</div>,
  },
  {
    accessorKey: 'sequence_start',
    header: () => <div>Sequence</div>,
    cell: ({ row }) => (
      <div>
        {row.original.sequence_start} – {row.original.sequence_end}
        <span className="text-muted-foreground text-xs block">
          Next: {row.original.sequence_next}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'stock',
    header: () => <div>Batch Size</div>,
    cell: ({ row }) => <div>{row.getValue('stock')}</div>,
  },
  {
    accessorKey: 'maintain_policy_number',
    header: () => <div>Renewal</div>,
    cell: ({ row }) => (
      <div>{row.getValue('maintain_policy_number') ? 'Keep number' : 'New number'}</div>
    ),
  },
  {
    accessorKey: 'effective_from',
    header: () => <div>Effective</div>,
    cell: ({ row }) => (
      <div className="text-sm">
        <div>{row.original.effective_from}</div>
        {row.original.effective_until ? (
          <div className="text-muted-foreground">until {row.original.effective_until}</div>
        ) : null}
      </div>
    ),
  },
  {
    accessorKey: 'is_active',
    header: () => <div>Status</div>,
    cell: ({ row }) => {
      const isActive = Boolean(row.getValue('is_active'))
      return (
        <Badge
          className={`rounded-lg font-semibold ${
            isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
  },
]
