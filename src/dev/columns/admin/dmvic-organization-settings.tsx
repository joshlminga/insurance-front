import { Badge } from '@/components/ui/badge'
import type { DmvicOrganizationSettingRow } from '@/types/types'
import { ColumnDef } from '@tanstack/table-core'

export const DmvicOrganizationSettingColumns: ColumnDef<DmvicOrganizationSettingRow>[] = [
  {
    accessorKey: 'product',
    header: () => <div>Product</div>,
    cell: ({ row }) => <div>{row.getValue('product') ?? '-'}</div>,
  },
  {
    id: 'mode',
    header: () => <div>Mode</div>,
    cell: ({ row }) => {
      const isSelf = Boolean(row.original.is_self)
      return (
        <Badge
          className={`rounded-lg font-semibold ${
            isSelf ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
          }`}
        >
          {isSelf ? 'Self' : 'Delegated'}
        </Badge>
      )
    },
  },
  {
    id: 'use_dmvic_of',
    header: () => <div>Use DMVIC of</div>,
    cell: ({ row }) => {
      if (row.original.is_self) {
        return <div>Own organization</div>
      }
      return (
        <div>
          {row.original.use_dmvic_of_organization?.organization_name ??
            row.original.use_dmvic_of_organization_id ??
            '-'}
        </div>
      )
    },
  },
]
