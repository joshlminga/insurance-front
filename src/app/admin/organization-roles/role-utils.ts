/* eslint-disable @typescript-eslint/no-explicit-any */
import { ROLE_GUARD_NAME, type RbacPermission, type RbacRole } from "@/types/rbac-roles"

export const ROLE_PERMISSIONS_PAGE_SIZE = 100

export const buildRolePermissionsParams = ({
  organizationLocationId,
  modules,
  page,
}: {
  organizationLocationId?: number | string | null
  modules: string
  page: number
}) => ({
  ...(organizationLocationId != null && organizationLocationId !== ""
    ? { organization_location_id: organizationLocationId }
    : {}),
  modules,
  guard_name: ROLE_GUARD_NAME,
  per_page: ROLE_PERMISSIONS_PAGE_SIZE,
  page,
  sort_by: "name",
  direction: "asc",
})

/** Read pagination metadata from list API responses */
export const extractPaginationFromResponse = (data: any) => {
  return data?.pagination ?? data?.data?.pagination ?? null
}

/** Merge permission rows by id (used when loading additional pages) */
export const mergePermissionsById = (
  existing: RbacPermission[],
  incoming: RbacPermission[]
): RbacPermission[] => {
  const map = new Map(existing.map((permission) => [permission.id, permission]))
  incoming.forEach((permission) => map.set(permission.id, permission))
  return Array.from(map.values())
}

/** Resolve organization location id from API row or route param */
export const getOrgLocationId = (rowData: Record<string, any>) =>
  rowData?.organization_location_id ?? rowData?.organizationLocationId ?? rowData?.id

/** Resolve role id from API row */
export const getRoleId = (rowData: Record<string, any>) =>
  rowData?.id ?? rowData?.role_id ?? rowData?.roleId

/** Human-readable role label — org roles use display_name; global/system use name */
export const getRoleLabel = (
  rowData: Record<string, any>,
  rolesBasePath = "roles"
) =>
  rolesBasePath === "roles"
    ? (rowData?.display_name ?? "N/A")
    : (rowData?.name ?? "N/A")

/** Whether a role row is active */
export const getRoleIsActive = (rowData: Record<string, any>) => {
  if (typeof rowData?.is_active === "boolean") return rowData.is_active
  if (typeof rowData?.active === "boolean") return rowData.active
  return Boolean(rowData?.is_active)
}

/** Whether a role is a general (system) role */
export const getRoleIsGeneral = (rowData: Record<string, any>) =>
  Boolean(rowData?.is_general)

/** Whether a role can be edited; defaults to true when field is absent */
export const getRoleIsEditable = (rowData: Record<string, any>) => {
  const value = rowData?.is_editable ?? rowData?.isEditable
  if (typeof value === "boolean") return value
  if (value === 0 || value === "0" || value === "false") return false
  if (value === 1 || value === "1" || value === "true") return true
  return true
}

/** Extract roles array from list API response (handles multiple shapes) */
export const extractRolesFromResponse = (data: any): RbacRole[] => {
  const payload = data?.data ?? data
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.roles)) return payload.roles
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

/** Extract organization locations from list API response */
export const extractOrgLocationsFromResponse = (data: any): any[] => {
  const payload = data?.data ?? data
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.organization_locations)) return payload.organization_locations
  if (Array.isArray(payload?.organization_location)) return payload.organization_location
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

/** Whether a permission is already assigned (synced) to the role */
export const getPermissionIsSynchronized = (permission: Record<string, any>) => {
  if (typeof permission?.is_synchronized === "boolean") return permission.is_synchronized
  if (typeof permission?.is_synced === "boolean") return permission.is_synced
  if (typeof permission?.synchronized === "boolean") return permission.synchronized
  return false
}

/** Permission ids that are already synchronized to the role */
export const extractInitialSelectedPermissionIds = (permissions: RbacPermission[]) =>
  permissions.filter((permission) => getPermissionIsSynchronized(permission)).map((p) => p.id)

/** Extract permissions from permissions API response */
export const extractPermissionsFromResponse = (data: any): RbacPermission[] => {
  const payload = data?.data ?? data
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.permissions)) return payload.permissions
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

/** Extract assigned permission ids from role permissions API response */
export const extractAssignedPermissionIds = (data: any): number[] => {
  const payload = data?.data ?? data
  if (Array.isArray(payload?.permission_ids)) return payload.permission_ids
  if (Array.isArray(payload?.permissions)) {
    return payload.permissions
      .map((item: any) => item?.id ?? item?.permission_id)
      .filter((id: unknown) => typeof id === "number")
  }
  if (Array.isArray(payload)) {
    return payload
      .map((item: any) => item?.id ?? item?.permission_id)
      .filter((id: unknown) => typeof id === "number")
  }
  return []
}

/** Group permissions by module key for checkbox UI */
export const groupPermissionsByModule = (permissions: RbacPermission[]) => {
  const groups = new Map<string, RbacPermission[]>()

  permissions.forEach((permission) => {
    const moduleKey = permission.module ?? "general"
    const existing = groups.get(moduleKey) ?? []
    existing.push(permission)
    groups.set(moduleKey, existing)
  })

  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b))
}

/** API may return module as a string key or { key, label } object */
export const normalizeModuleKey = (item: unknown): string | null => {
  if (typeof item === "string" && item.trim().length > 0) return item
  if (item && typeof item === "object" && "key" in item) {
    const key = (item as { key?: unknown }).key
    if (typeof key === "string" && key.trim().length > 0) return key
  }
  return null
}

/** Display label for a module entry (string key or { key, label }) */
export const getModuleLabel = (item: unknown): string => {
  if (item && typeof item === "object" && "label" in item) {
    const label = (item as { label?: unknown }).label
    if (typeof label === "string" && label.trim().length > 0) return label
  }
  return normalizeModuleKey(item) ?? "N/A"
}

/** Normalize mixed module arrays to string keys for API payloads */
export const normalizeModuleKeys = (items: unknown[]): string[] =>
  items.map(normalizeModuleKey).filter((key): key is string => Boolean(key))

