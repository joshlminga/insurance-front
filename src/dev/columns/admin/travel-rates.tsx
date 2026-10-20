/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge"
import { ColumnDef } from "@tanstack/table-core"

/** Age / member range helper for table cells. */
const formatRange = (min: unknown, max: unknown): string => {
  const hasMin = min !== null && min !== undefined && min !== ""
  const hasMax = max !== null && max !== undefined && max !== ""
  if (!hasMin && !hasMax) return "—"
  if (hasMin && hasMax) return `${min} – ${max}`
  if (hasMin) return `${min}+`
  return `≤ ${max}`
}

export const TravelRateColumns: ColumnDef<any>[] = [
  {
    accessorKey: "plan",
    header: () => <div>Plan</div>,
    cell: ({ row }) => <div>{row.getValue("plan") || "—"}</div>,
  },
  {
    accessorKey: "charged",
    header: () => <div>Charged</div>,
    cell: ({ row }) => <div>{row.getValue("charged") || "—"}</div>,
  },
  {
    accessorKey: "billing",
    header: () => <div>Billing</div>,
    cell: ({ row }) => <div>{row.getValue("billing") || "—"}</div>,
  },
  {
    id: "age_range",
    header: () => <div>Age range</div>,
    cell: ({ row }) => (
      <div>{formatRange(row.original?.min_age, row.original?.max_age)}</div>
    ),
  },
  {
    id: "members",
    header: () => <div>Members</div>,
    cell: ({ row }) => (
      <div>{formatRange(row.original?.min_member, row.original?.max_member)}</div>
    ),
  },
  {
    id: "rate_bands",
    header: () => <div>Rate bands</div>,
    cell: ({ row }) => {
      const rates = Array.isArray(row.original?.rates) ? row.original.rates : []
      return <div>{rates.length}</div>
    },
  },
  {
    accessorKey: "is_active",
    header: () => <div>Status</div>,
    cell: ({ row }) => {
      const isActive: boolean = row.getValue("is_active")
      return (
        <Badge
          className={`rounded-lg font-semibold ${
            isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
  },
]
