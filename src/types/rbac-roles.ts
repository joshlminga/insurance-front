/** Role and permission types for organization-scoped RBAC */

export interface RbacRole {
  id: number
  name: string
  display_name?: string | null
  description?: string | null
  authority?: string | null
  modules?: string[] | null
  org_id?: number | null
  organization_location_id?: number | null
  parent_role_id?: number | null
  parent_role_name?: string | null
  is_active?: boolean | null
  is_general?: boolean | null
  is_editable?: boolean | null
  guard_name?: string | null
}

export interface RbacPermission {
  id: number
  name: string
  guard_name?: string | null
  module?: string | null
  action?: string | null
  description?: string | null
  super_admin?: boolean | null
  organization_location_id?: number | null
  is_synchronized?: boolean | null
}

export interface RbacRolePermissionsData {
  permission_ids?: number[]
  permissions?: RbacPermission[]
}

export interface RbacRolesListData {
  roles?: RbacRole[]
  data?: RbacRole[]
  pagination?: {
    current_page?: number
    last_page?: number
    per_page?: number
    total?: number
  }
}

export interface RbacPermissionsListData {
  permissions?: RbacPermission[]
  data?: RbacPermission[]
}

export const ROLE_AUTHORITY_DEFAULT = "comp" as const

export const ROLE_GUARD_NAME = "api" as const
