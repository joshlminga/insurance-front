/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge"
import { ColumnDef } from "@tanstack/table-core"
import {
  travelBenefitShowInLabel,
  travelBenefitTypeLabel,
} from "@/utils/travel-enums"

export const TravelBenefitCommonColumns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: () => <div>Short Title</div>,
    cell: ({ row }) => {
      const name: string = row.getValue("name")
      return <div>{name}</div>
    },
  },
  {
    id: "title",
    header: () => <div>Full Benefit Title</div>,
    cell: ({ row }) => {
      const title =
        (row.original?.title as string | null | undefined) ??
        (row.original?.meta?.title as string | null | undefined)
      return (
        <div className="max-w-[240px] truncate">{title?.trim() || "—"}</div>
      )
    },
  },
  {
    id: "type",
    header: () => <div>Benefit Type</div>,
    cell: ({ row }) => (
      <div>{travelBenefitTypeLabel(row.original?.type as string)}</div>
    ),
  },
  {
    id: "group",
    header: () => <div>Show In</div>,
    cell: ({ row }) => (
      <div>{travelBenefitShowInLabel(row.original?.group as string)}</div>
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
