/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  getModuleLabel,
  getRoleId,
  getRoleIsGeneral,
  normalizeModuleKey,
} from "@/app/admin/organization-roles/role-utils"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { ColumnDef } from "@tanstack/table-core"
import { ChevronDown } from "lucide-react"

type OrganizationRolesTableMeta = {
  expandedRoleId?: string | number | null
  onToggleExpand?: (roleId: string | number) => void
}

const getIsActiveFromRow = (rowData: any) => {
  if (typeof rowData?.is_active === "boolean") return rowData.is_active
  if (typeof rowData?.active === "boolean") return rowData.active
  return Boolean(rowData?.is_active)
}

/** Nested modules table shown in the expanded sub-row (matches settings modules-tab) */
export function RoleModulesExpandedContent({ modules }: { modules: unknown[] }) {
  return (
    <div className="rounded-md border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {modules.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} className="h-16 text-center text-muted-foreground">
                No modules assigned to this role
              </TableCell>
            </TableRow>
          ) : (
            modules.map((moduleItem: unknown, index: number) => {
              const moduleKey = normalizeModuleKey(moduleItem)
              if (!moduleKey) return null

              return (
                <TableRow key={`${moduleKey}-${index}`}>
                  <TableCell className="font-medium">{getModuleLabel(moduleItem)}</TableCell>
                  <TableCell className="font-mono text-xs">{moduleKey}</TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

/** Columns for roles listed under a specific organization location */
export const OrganizationRolesColumns: ColumnDef<any>[] = [
  {
    id: "name",
    header: () => <div>Name</div>,
    cell: ({ row }) => <div className="font-medium">{row.original?.name ?? "N/A"}</div>,
  },
  {
    id: "is_general",
    header: () => <div className="font-bold">General</div>,
    cell: ({ row }) => {
      const isGeneral = getRoleIsGeneral(row.original)

      return (
        <Badge
          variant="outline"
          className={`rounded-full px-3 py-1 border-none font-medium shadow-sm transition-colors ${
            isGeneral
              ? "bg-emerald-100 text-emerald-800"
              : "bg-indigo-100 text-indigo-800"
          }`}
        >
          {isGeneral ? "General" : "Custom"}
        </Badge>
      )
    },
  },
  {
    id: "parent_role",
    header: () => <div>Parent Role</div>,
    cell: ({ row }) => {
      const parentRoleName = row.original?.parent_role_name
      return <div>{parentRoleName ? String(parentRoleName) : "Null"}</div>
    },
  },
  {
    id: "modules",
    header: () => <div>Modules</div>,
    cell: ({ row, table }) => {
      const meta = table.options.meta as OrganizationRolesTableMeta | undefined
      const modules = Array.isArray(row.original?.modules) ? row.original.modules : []
      const roleId = getRoleId(row.original)
      const isExpanded = roleId != null && meta?.expandedRoleId === roleId
      const canExpand = modules.length > 0 && roleId != null

      if (!canExpand) return <div>-</div>

      return (
        <button
          type="button"
          className="flex items-center gap-2 text-sm text-left hover:text-primary"
          onClick={(event) => {
            event.stopPropagation()
            meta?.onToggleExpand?.(roleId)
          }}
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              isExpanded && "rotate-180"
            )}
          />
          <span>
            {modules.length} module{modules.length > 1 ? "s" : ""}
          </span>
        </button>
      )
    },
  },
  {
    id: "authority",
    header: () => <div>Authority</div>,
    cell: ({ row }) => <div>{row.original?.authority ?? "N/A"}</div>,
  },
  {
    id: "description",
    header: () => <div>Description</div>,
    cell: ({ row }) => (
      <div className="max-w-xs truncate">{row.original?.description ?? "-"}</div>
    ),
  },
  {
    id: "status",
    header: () => <div>Status</div>,
    cell: ({ row }) => {
      const isActive = getIsActiveFromRow(row.original)
      return (
        <Badge
          className={`rounded-lg font-semibold ${
            isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
  },
]
