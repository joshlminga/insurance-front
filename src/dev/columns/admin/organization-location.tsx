/* eslint-disable @typescript-eslint/no-explicit-any */
import { isOrganizationLocationProductActive } from "@/app/admin/organization-location/organization-location-query"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ColumnDef } from "@tanstack/table-core"

const getIsDefaultFromRow = (rowData: any) => {
  if (typeof rowData?.is_default === "boolean") return rowData.is_default
  if (typeof rowData?.default === "boolean") return rowData.default
  return Boolean(rowData?.is_default)
}

const getIsActiveFromRow = (rowData: any) => {
  if (typeof rowData?.is_active === "boolean") return rowData.is_active
  if (typeof rowData?.active === "boolean") return rowData.active
  return Boolean(rowData?.is_active)
}

export const OrganizationLocationColumns: ColumnDef<any>[] = [
  {
    id: "organization_name",
    header: () => <div>Name</div>,
    cell: ({ row }) => {
      const name = row.original?.organization_name ?? row.original?.organization?.name ?? "N/A"
      return <div>{name}</div>
    },
  },
  {
    id: "organization_type",
    header: () => <div>Type</div>,
    cell: ({ row }) => {
      const type =
        row.original?.organization_type ??
        row.original?.organization?.organization_type ??
        "N/A"
      return <div>{type}</div>
    },
  },
  {
    id: "domain",
    header: () => <div>Domain</div>,
    cell: ({ row }) => {
      const domain = row.original?.domain ?? row.original?.organization?.domain ?? "N/A"
      return <div>{domain}</div>
    },
  },
  {
    id: "country",
    header: () => <div>Country</div>,
    cell: ({ row }) => {
      const value = row.original?.country?.name ?? row.original?.country_name ?? "N/A"
      return <div>{value}</div>
    },
  },
  {
    id: "products",
    header: () => <div>Products</div>,
    cell: ({ row }) => {
      const products = Array.isArray(row.original?.products)
        ? row.original.products
        : []

      if (!products.length) {
        return <div>-</div>
      }

      return (
        <div className="flex flex-wrap gap-1">
          {products.map((item: any, index: number) => {
            const isActive = isOrganizationLocationProductActive(item)

            return (
              <Badge
                key={`${item?.product ?? "product"}-${index}`}
                className={cn(
                  "rounded-lg border font-semibold",
                  isActive
                    ? "border-transparent bg-slate-100 text-slate-800"
                    : "border-red-500 bg-red-50 text-red-800"
                )}
              >
                {item?.product ?? "N/A"}
              </Badge>
            )
          })}
        </div>
      )
    },
  },
  {
    id: "default",
    header: () => <div>Default</div>,
    cell: ({ row }) => {
      const isDefault = getIsDefaultFromRow(row.original)
      return (
        <Badge
          className={`rounded-lg font-semibold ${isDefault ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
        >
          {isDefault ? "Yes" : "No"}
        </Badge>
      )
    },
  },
  {
    id: "status",
    header: () => <div>Status</div>,
    cell: ({ row }) => {
      const isActive = getIsActiveFromRow(row.original)
      return (
        <Badge
          className={`rounded-lg font-semibold ${isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-green-800"
            }`}
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
  },
]

