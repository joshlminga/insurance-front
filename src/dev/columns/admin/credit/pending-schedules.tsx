import { CreditAmount } from "@/app/admin/credit/components/CreditAmount"
import { CreditStatusBadge } from "@/app/admin/credit/components/CreditStatusBadge"
import type { CreditTransaction } from "@/types/types"
import { formatDate } from "@/lib/format"
import type { ColumnDef } from "@tanstack/table-core"

export const CreditPendingScheduleColumns: ColumnDef<CreditTransaction>[] = [
  {
    accessorKey: "amount_used",
    header: () => <div>Amount</div>,
    cell: ({ row }) => <CreditAmount value={row.original.amount_used} className="font-medium" />,
  },
  {
    id: "invoice",
    header: () => <div>Invoice</div>,
    cell: ({ row }) => {
      const invoiceId = row.original.schedule?.invoice_id ?? row.original.transactionable_id
      return <div>{invoiceId ? `#${invoiceId}` : "—"}</div>
    },
  },
  {
    id: "schedule_status",
    header: () => <div>Status</div>,
    cell: ({ row }) => (
      <CreditStatusBadge status={row.original.schedule?.status ?? row.original.status} />
    ),
  },
  {
    id: "cover_start_date",
    header: () => <div>Cover start</div>,
    cell: ({ row }) => {
      const date = row.original.schedule?.cover_start_date
      return <div>{date ? formatDate(date) : "—"}</div>
    },
  },
  {
    accessorKey: "updated_at",
    header: () => <div>Updated</div>,
    cell: ({ row }) => {
      const date = row.original.schedule?.updated_at ?? row.original.created_at
      return <div>{date ? formatDate(date) : "—"}</div>
    },
  },
]
