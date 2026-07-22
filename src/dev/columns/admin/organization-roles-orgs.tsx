/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/table-core"

/** Columns for the organization list on the Organization Roles landing page */
export const OrganizationRolesOrgsColumns: ColumnDef<any>[] = [
  {
    id: "organization_name",
    header: () => <div>Name</div>,
    cell: ({ row }) => {
      const name =
        row.original?.organization_name ?? row.original?.organization?.name ?? "N/A"
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
]
