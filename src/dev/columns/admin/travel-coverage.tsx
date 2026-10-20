/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge"
import { ColumnDef } from "@tanstack/table-core"

/** Join zone name lists for table cells (continents / countries). */
const joinZoneNames = (zones: unknown): string => {
  if (!Array.isArray(zones) || zones.length === 0) return "—"
  return zones
    .map((zone) => {
      const row = zone as { name?: string | null }
      return row?.name?.trim() || ""
    })
    .filter(Boolean)
    .join(", ")
}

export const TravelCoverageColumns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: () => <div>Name</div>,
    cell: ({ row }) => {
      const name: string = row.getValue("name")
      return <div>{name}</div>
    },
  },
  {
    accessorKey: "description",
    header: () => <div>Description</div>,
    cell: ({ row }) => {
      const description: string | null = row.getValue("description")
      return <div className="max-w-[220px] truncate">{description || "—"}</div>
    },
  },
  {
    id: "continents",
    header: () => <div>Continents</div>,
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate">
        {joinZoneNames(row.original?.continents)}
      </div>
    ),
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
