/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Helpers for the Organization Members feature (staff users at a location).
 * Organization-location helpers (getOrgLocationId, extractOrgLocationsFromResponse)
 * are reused from the Organization Roles feature — same API shapes.
 */

/** Resolve the user id from a member row returned by the API */
export const getMemberUserId = (rowData: Record<string, any>) =>
  rowData?.id ?? rowData?.user_id ?? rowData?.userId

/** Display name for a member row */
export const getMemberLabel = (rowData: Record<string, any>) =>
  rowData?.name ?? rowData?.email ?? "N/A"

/** Whether the member's user account is active */
export const getMemberIsActive = (rowData: Record<string, any>) =>
  Boolean(rowData?.is_active)

/** Active role assignments returned on each member row from the list API */
export const getMemberRoles = (row: Record<string, any>) =>
  Array.isArray(row?.roles) ? row.roles : []

/** Human-readable label for a role badge (display_name preferred over slug name) */
export const getMemberRoleLabel = (role: {
  display_name?: string | null
  name?: string | null
}) => role?.display_name ?? role?.name ?? "N/A"

/** Extract member rows from list API response (handles multiple shapes) */
export const extractMembersFromResponse = (data: any): any[] => {
  const payload = data?.data ?? data
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.users)) return payload.users
  if (Array.isArray(payload?.members)) return payload.members
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

/** Extract a single member object from show/create/update API responses */
export const extractMemberFromResponse = (data: any): Record<string, any> => {
  const payload = data?.data ?? data
  if (!payload || typeof payload !== "object") return {}
  return payload?.user ?? payload?.member ?? payload
}

/**
 * A role can be assigned to a member only when it is active and NOT a system
 * role (system = no organization_location_id and not general) — same rule
 * the API enforces, mirrored here so the picker never offers invalid roles.
 */
export const isAssignableRole = (role: Record<string, any>) => {
  const isActive = Boolean(role?.is_active)
  const isSystemRole = role?.organization_location_id == null && !role?.is_general
  return isActive && !isSystemRole
}

/** Convert the string values from the roles multi-select into numeric ids for the API */
export const roleValuesToIds = (values: string[]): number[] =>
  values
    .map((value) => Number(value))
    .filter((id) => Number.isFinite(id) && id > 0)
