/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreditAmount } from "@/app/admin/credit/components/CreditAmount"
import type { CreditUserAllocation } from "@/types/types"
import type { ColumnDef } from "@tanstack/table-core"

export const CreditUserAllocationsColumns: ColumnDef<CreditUserAllocation>[] = [
  {
    accessorKey: "user",
    header: () => <div>User</div>,
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.user?.name ?? "—"}</p>
        <p className="text-xs text-muted-foreground">{row.original.user?.email ?? ""}</p>
      </div>
    ),
  },
  {
    accessorKey: "allocated_balance",
    header: () => <div>Allocated</div>,
    cell: ({ row }) => <CreditAmount value={row.original.allocated_balance} />,
  },
  {
    accessorKey: "available_balance",
    header: () => <div>Available</div>,
    cell: ({ row }) => <CreditAmount value={row.original.available_balance} />,
  },
  {
    accessorKey: "pending_balance",
    header: () => <div>Pending</div>,
    cell: ({ row }) => <CreditAmount value={row.original.pending_balance} />,
  },
  {
    accessorKey: "minimum_spend_threshold",
    header: () => <div>Min. threshold</div>,
    cell: ({ row }) => <CreditAmount value={row.original.minimum_spend_threshold} />,
  },
]
