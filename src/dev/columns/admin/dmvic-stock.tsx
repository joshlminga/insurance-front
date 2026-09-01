/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DmvicBrokerStockRow } from '@/app/admin/dmvic-stock/dmvic-stock-query'
import { Badge } from '@/components/ui/badge'
import { dmvicCertificateTypeLabel } from '@/utils/constatnts'
import { ColumnDef } from '@tanstack/table-core'

export type DmvicStockTableRow = DmvicBrokerStockRow

export const DmvicStockColumns: ColumnDef<DmvicStockTableRow>[] = [
  {
    id: 'organization_name',
    header: () => <div>Organization</div>,
    cell: ({ row }) => (
      <div>{row.original.organization_location?.organization_name ?? '-'}</div>
    ),
  },
  {
    id: 'location',
    header: () => <div>Location</div>,
    cell: ({ row }) => <div>{row.original.organization_location?.location?.name ?? '-'}</div>,
  },
  {
    accessorKey: 'product_type',
    header: () => <div>Product</div>,
    cell: ({ row }) => <div>{row.getValue('product_type') ?? 'Motor'}</div>,
  },
  {
    accessorKey: 'type_of_certificate',
    header: () => <div>Certificate Type</div>,
    cell: ({ row }) => (
      <div>{dmvicCertificateTypeLabel(row.getValue('type_of_certificate') as string)}</div>
    ),
  },
  {
    accessorKey: 'stock',
    header: () => <div>Remaining Stock</div>,
    cell: ({ row }) => <div>{row.getValue('stock') ?? 0}</div>,
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
