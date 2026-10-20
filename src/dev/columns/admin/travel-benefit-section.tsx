/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge"
import { ColumnDef } from "@tanstack/table-core"

/** Columns for Travel Benefit Section (taxonomy: benefittravel_section). */
export const TravelBenefitSectionColumns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: () => <div>Name</div>,
    cell: ({ row }) => {
      const name: string = row.getValue("name")
      return <div>{name}</div>
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
