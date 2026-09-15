/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge"
import { ColumnDef } from "@tanstack/table-core"

export type CurrencyRow = {
  id: number
  code?: string | null
  symbol?: string | null
  name?: string | null
  rate?: number | string | null
  rate_mode?: string | null
  is_auto?: boolean
  fee?: number | string | null
  country?: string | null
  country_id?: number | null
  is_default?: boolean
  is_active?: boolean
  status?: string | null
}

export const CurrenciesAvailableColumns: ColumnDef<CurrencyRow>[] = [
  {
    accessorKey: "id",
    header: () => <div>#ID</div>,
    cell: ({ row }) => <div>{row.getValue("id")}</div>,
  },
  {
    accessorKey: "code",
    header: () => <div>Code</div>,
    cell: ({ row }) => {
      const code = row.getValue("code") as string | null
      const isDefault = row.original.is_default
      return (
        <div className="flex items-center gap-2">
          <span>{code ?? "—"}</span>
          {isDefault ? (
            <Badge className="rounded-md bg-blue-100 text-blue-800 font-medium">
              Default
            </Badge>
          ) : null}
        </div>
      )
    },
  },
  {
    accessorKey: "symbol",
    header: () => <div>Symbol</div>,
    cell: ({ row }) => <div>{(row.getValue("symbol") as string) ?? "—"}</div>,
  },
  {
    accessorKey: "rate",
    header: () => <div>Rate</div>,
    cell: ({ row }) => {
      const rate = row.getValue("rate")
      if (rate === null || rate === undefined || rate === "") return <div>—</div>
      return <div>{Number(rate)}</div>
    },
  },
  {
    id: "type",
    header: () => <div>Type</div>,
    cell: ({ row }) => {
      const mode =
        row.original.rate_mode ??
        (row.original.is_auto ? "Auto" : "Manual")
      return <div>{mode}</div>
    },
  },
  {
    accessorKey: "fee",
    header: () => <div>Fee</div>,
    cell: ({ row }) => {
      const fee = row.getValue("fee")
      if (fee === null || fee === undefined || fee === "") return <div>—</div>
      return <div>{Number(fee)}</div>
    },
  },
  {
    accessorKey: "country",
    header: () => <div>Country</div>,
    cell: ({ row }) => <div>{(row.getValue("country") as string) ?? "—"}</div>,
  },
  {
    accessorKey: "status",
    header: () => <div>Status</div>,
    cell: ({ row }) => {
      const status =
        (row.getValue("status") as string) ??
        (row.original.is_active ? "Active" : "Inactive")
      const isActive = status === "Active" || row.original.is_active === true
      return (
        <Badge
          className={`rounded-lg font-semibold ${
            isActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {status}
        </Badge>
      )
    },
  },
]
