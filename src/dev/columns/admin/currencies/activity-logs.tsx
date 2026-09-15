/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/table-core"

export type ConversionLogRow = {
  id: number
  entity_type?: string | null
  entity_id?: number | string | null
  context?: string | null
  base_currency_code?: string | null
  target_currency_code?: string | null
  base_amount?: string | number | null
  converted_amount?: string | number | null
  rate_used?: string | number | null
  fee_applied?: string | number | null
  rate_source?: string | null
  occurred_at?: string | null
  user?: { id?: number; name?: string | null; email?: string | null } | null
}

export const CurrenciesActivityLogsColumns: ColumnDef<ConversionLogRow>[] = [
  {
    accessorKey: "id",
    header: () => <div>#ID</div>,
    cell: ({ row }) => <div>{row.getValue("id")}</div>,
  },
  {
    id: "from",
    header: () => <div>From</div>,
    cell: ({ row }) => <div>{row.original.base_currency_code ?? "—"}</div>,
  },
  {
    id: "to",
    header: () => <div>To</div>,
    cell: ({ row }) => <div>{row.original.target_currency_code ?? "—"}</div>,
  },
  {
    accessorKey: "base_amount",
    header: () => <div>Base Amount</div>,
    cell: ({ row }) => {
      const value = row.getValue("base_amount")
      if (value === null || value === undefined || value === "") return <div>—</div>
      return <div>{Number(value).toLocaleString()}</div>
    },
  },
  {
    accessorKey: "converted_amount",
    header: () => <div>Converted</div>,
    cell: ({ row }) => {
      const value = row.getValue("converted_amount")
      if (value === null || value === undefined || value === "") return <div>—</div>
      return <div>{Number(value).toLocaleString()}</div>
    },
  },
  {
    accessorKey: "rate_used",
    header: () => <div>Rate</div>,
    cell: ({ row }) => {
      const value = row.getValue("rate_used")
      if (value === null || value === undefined || value === "") return <div>—</div>
      return <div>{Number(value)}</div>
    },
  },
  {
    accessorKey: "fee_applied",
    header: () => <div>Fee</div>,
    cell: ({ row }) => {
      const value = row.getValue("fee_applied")
      if (value === null || value === undefined || value === "") return <div>—</div>
      return <div>{Number(value)}</div>
    },
  },
  {
    accessorKey: "rate_source",
    header: () => <div>Source</div>,
    cell: ({ row }) => <div>{(row.getValue("rate_source") as string) ?? "—"}</div>,
  },
  {
    accessorKey: "occurred_at",
    header: () => <div>Occurred At</div>,
    cell: ({ row }) => <div>{(row.getValue("occurred_at") as string) ?? "—"}</div>,
  },
  {
    id: "user",
    header: () => <div>User</div>,
    cell: ({ row }) => {
      const user = row.original.user
      return <div>{user?.name ?? user?.email ?? "—"}</div>
    },
  },
]
