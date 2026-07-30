import type { Abilities, AuthSessionPayload, LoginResponse } from './types'

function fallbackAbilities(isGeneral: boolean): Abilities {
  return {
    is_general: isGeneral,
    roles: [],
    permissions: [],
    modules: [],
    scopes: [],
  }
}

/** Normalize a login / refresh API response into a store-ready session payload */
export function normalizeLoginResponse(data: LoginResponse): AuthSessionPayload {
  return {
    access_token: data.access_token,
    token_type: data.token_type ?? 'bearer',
    expires_in: data.expires_in ?? 3600,
    user: data.user,
    is_general: data.is_general,
    abilities: data.abilities ?? fallbackAbilities(data.is_general),
  }
}
