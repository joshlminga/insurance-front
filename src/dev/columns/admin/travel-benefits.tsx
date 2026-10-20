/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge"
import { ColumnDef } from "@tanstack/table-core"

/** Prefer benefitToArray shape (common/section) then Eloquent relation names. */
const taxonomyName = (row: any, key: "common" | "section"): string => {
  const shaped = row?.[key]
  if (shaped?.name) return shaped.name
  const camel = key === "common" ? row?.commonTaxonomy : row?.sectionTaxonomy
  if (camel?.name) return camel.name
  const snake = key === "common" ? row?.common_taxonomy : row?.section_taxonomy
  if (snake?.name) return snake.name
  return "—"
}

export const TravelBenefitsColumns: ColumnDef<any>[] = [
  {
    id: "benefit_label",
    header: () => <div>Benefit</div>,
    cell: ({ row }) => {
      const name = row.original?.name
      const benefit = row.original?.benefit
      const label = name?.trim() || benefit || "—"
      return <div className="max-w-[260px] truncate">{label}</div>
    },
  },
  {
    id: "section",
    header: () => <div>Section</div>,
    cell: ({ row }) => <div>{taxonomyName(row.original, "section")}</div>,
  },
  {
    id: "common",
    header: () => <div>Common</div>,
    cell: ({ row }) => <div>{taxonomyName(row.original, "common")}</div>,
  },
  {
    id: "excess",
    header: () => <div>Excess</div>,
    cell: ({ row }) => {
      const excess = row.original?.excess
      return (
        <div className="max-w-[160px] truncate">
          {typeof excess === "string" && excess.trim() ? excess : "—"}
        </div>
      )
    },
  },
  {
    accessorKey: "is_active",
    header: () => <div>Status</div>,
    cell: ({ row }) => {
      const isActive: boolean = Boolean(row.getValue("is_active"))
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
