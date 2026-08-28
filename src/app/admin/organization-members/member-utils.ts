/* eslint-disable @typescript-eslint/no-explicit-any */
export const getMemberUserId = (rowData: Record<string, any>) =>
  rowData?.id ?? rowData?.user_id ?? rowData?.userId

export const getMemberLabel = (rowData: Record<string, any>) =>
  rowData?.name ?? rowData?.email ?? "N/A"

export const getMemberIsActive = (rowData: Record<string, any>) =>
  Boolean(rowData?.is_active)

export const getMemberRoles = (row: Record<string, any>) =>
  Array.isArray(row?.roles) ? row.roles : []

export const getMemberRoleLabel = (role: {
  display_name?: string | null
  name?: string | null
}) => role?.display_name ?? role?.name ?? "N/A"

export const extractMembersFromResponse = (data: any): any[] => {
  const payload = data?.data ?? data
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.users)) return payload.users
  if (Array.isArray(payload?.members)) return payload.members
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

export const extractMemberFromResponse = (data: any): Record<string, any> => {
  const payload = data?.data ?? data
  if (!payload || typeof payload !== "object") return {}
  return payload?.user ?? payload?.member ?? payload
}

export const isAssignableRole = (role: Record<string, any>) => {
  const isActive = Boolean(role?.is_active)
  const isSystemRole = role?.organization_location_id == null && !role?.is_general
  return isActive && !isSystemRole
}

export const roleValuesToIds = (values: string[]): number[] =>
  values
    .map((value) => Number(value))
    .filter((id) => Number.isFinite(id) && id > 0)
