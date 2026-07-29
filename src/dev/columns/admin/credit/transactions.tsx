/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreditAmount } from "@/app/admin/credit/components/CreditAmount"
import { CreditStatusBadge } from "@/app/admin/credit/components/CreditStatusBadge"
import { Checkbox } from "@/components/ui/checkbox"
import type { CreditTransaction } from "@/types/types"
import { formatDate } from "@/lib/format"
import type { ColumnDef } from "@tanstack/table-core"

type BuildCreditTransactionColumnsOptions = {
  showSelection?: boolean
  selectedIds?: Set<number>
  onToggleRow?: (row: CreditTransaction, checked: boolean) => void
  onToggleAll?: (rows: CreditTransaction[], checked: boolean) => void
}

export function buildCreditTransactionColumns(
  options: BuildCreditTransactionColumnsOptions = {}
): ColumnDef<CreditTransaction>[] {
  const { showSelection, selectedIds, onToggleRow, onToggleAll } = options
  const columns: ColumnDef<CreditTransaction>[] = []

  if (showSelection) {
    columns.push({
      id: "select",
      header: ({ table }) => {
        const approvedRows = table
          .getRowModel()
          .rows.map((row) => row.original)
          .filter((row) => row.status === "approved")
        const allSelected =
          approvedRows.length > 0 &&
          approvedRows.every((row) => selectedIds?.has(row.id))

        return (
          <Checkbox
            checked={allSelected}
            onCheckedChange={(checked) => onToggleAll?.(approvedRows, checked === true)}
            aria-label="Select all approved transactions"
          />
        )
      },
      cell: ({ row }) => {
        const txn = row.original
        if (txn.status !== "approved") return null
        return (
          <Checkbox
            checked={selectedIds?.has(txn.id) ?? false}
            onCheckedChange={(checked) => onToggleRow?.(txn, checked === true)}
            aria-label={`Select transaction ${txn.id}`}
          />
        )
      },
      enableSorting: false,
    })
  }

  columns.push(
    {
      accessorKey: "id",
      header: () => <div>ID</div>,
      cell: ({ row }) => <div>#{row.original.id}</div>,
    },
    {
      accessorKey: "amount_used",
      header: () => <div>Amount</div>,
      cell: ({ row }) => <CreditAmount value={row.original.amount_used} className="font-medium" />,
    },
    {
      accessorKey: "status",
      header: () => <div>Status</div>,
      cell: ({ row }) => <CreditStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "transactionable_type",
      header: () => <div>Reference</div>,
      cell: ({ row }) => {
        const type = row.original.transactionable_type
        const id = row.original.transactionable_id
        if (!type && !id) return <span className="text-muted-foreground">—</span>
        return (
          <div className="text-sm">
            {type ? type.split("\\").pop() : "Item"} {id ? `#${id}` : ""}
          </div>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: () => <div>Date</div>,
      cell: ({ row }) => (
        <div>{row.original.created_at ? formatDate(row.original.created_at) : "—"}</div>
      ),
    }
  )

  if (!showSelection) {
    columns.splice(1, 0, {
      accessorKey: "user",
      header: () => <div>User</div>,
      cell: ({ row }) => (
        <div>{row.original.user?.name ?? row.original.user?.email ?? "—"}</div>
      ),
    })
  }

  return columns
}

export const CreditTransactionsMineColumns = buildCreditTransactionColumns()
export const CreditTransactionsAllColumns = buildCreditTransactionColumns()
