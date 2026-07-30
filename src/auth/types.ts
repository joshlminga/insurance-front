/**
 * RBAC auth types — aligned with Acensure API login / check-auth responses.
 * Think of `abilities` as a cached Spatie permissions snapshot for the SPA session.
 */

export interface AuthUser {
  id: number
  name: string
  email: string
  username: string | null
  slug: string | null
  phone: string | null
  is_active: boolean
  is_general: boolean
  avatar?: string
}

export interface AbilityScope {
  organization_id: number
  organization_location_id: number | null
  role: string
  role_id: number
}

export interface AbilityContext {
  organization_id: number
  organization_location_id: number
  role: string | null
  role_id: number | null
  permissions: string[]
}

export interface Abilities {
  is_general: boolean
  roles: string[]
  permissions: string[]
  modules: string[]
  scopes: AbilityScope[]
  context?: AbilityContext
}

/** Flat login / refresh response from the API */
export interface AuthSessionPayload {
  access_token: string
  token_type?: 'bearer' | string
  expires_in: number
  user: AuthUser
  is_general: boolean
  abilities: Abilities
}

/** Login endpoint may also include message / NOT_VERIFIED wrapper fields */
export interface LoginResponse extends AuthSessionPayload {
  message?: string
  status?: string
  data?: {
    status?: string
    guest?: unknown
  }
}

export interface ApiSuccess<T> {
  success: boolean
  message: string
  data: T
}

export interface CheckAuthData {
  is_logged: boolean
  user: AuthUser | null
  is_general?: boolean
  abilities?: Abilities
}

export interface AbilitiesData {
  user: AuthUser
  is_general: boolean
  abilities: Abilities
}

/** Response from GET /auth/org — tenant resolved from browser Origin */
export interface OrgResolveData {
  origin: string
  location_code: string | null
  country_id: number | null
  organization_location_id: number | null
  organization_name?: string | null
  location_name?: string | null
  logo?: string | null
  logo_url?: string | null
}

/** Outcome of GET /auth/org during app boot */
export type OrgResolveStatus = 'idle' | 'resolved' | 'not_found' | 'failed'

export interface LocationOption {
  organizationId: number
  locationId: number
  role: string
  roleId: number
  label: string
}

export interface CanAccessOptions {
  module?: string
  permission?: string
  /** When true (default), both module and permission must pass */
  requireAll?: boolean
}
