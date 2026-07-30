/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreditAmount } from "@/app/admin/credit/components/CreditAmount"
import { CreditStatusBadge } from "@/app/admin/credit/components/CreditStatusBadge"
import type { CreditApprovalQueueItem } from "@/types/types"
import { formatDate } from "@/lib/format"
import type { ColumnDef } from "@tanstack/table-core"

export const CreditApprovalsColumns: ColumnDef<CreditApprovalQueueItem>[] = [
  {
    accessorKey: "credit_transaction.id",
    header: () => <div>Txn ID</div>,
    cell: ({ row }) => <div>#{row.original.credit_transaction?.id ?? row.original.credit_transaction_id}</div>,
  },
  {
    id: "agent",
    header: () => <div>Agent</div>,
    cell: ({ row }) => (
      <div>
        {row.original.credit_transaction?.user?.name ??
          row.original.credit_transaction?.user?.email ??
          "—"}
      </div>
    ),
  },
  {
    id: "amount",
    header: () => <div>Amount</div>,
    cell: ({ row }) => (
      <CreditAmount
        value={row.original.credit_transaction?.amount_used}
        className="font-medium"
      />
    ),
  },
  {
    id: "reference",
    header: () => <div>Reference</div>,
    cell: ({ row }) => {
      const txn = row.original.credit_transaction
      if (!txn?.transactionable_type && !txn?.transactionable_id) {
        return <span className="text-muted-foreground">—</span>
      }
      return (
        <div className="text-sm">
          {txn.transactionable_type?.split("\\").pop() ?? "Item"}{" "}
          {txn.transactionable_id ? `#${txn.transactionable_id}` : ""}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: () => <div>Status</div>,
    cell: ({ row }) => <CreditStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "created_at",
    header: () => <div>Submitted</div>,
    cell: ({ row }) => (
      <div>{row.original.created_at ? formatDate(row.original.created_at) : "—"}</div>
    ),
  },
]
