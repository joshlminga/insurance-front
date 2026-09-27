import { describe, expect, it } from 'vitest'
import { homePathForAbilities, isPublicAppUser } from '@/auth/role-destination'
import type { Abilities } from '@/auth/types'
import { EROUTES } from '@/utils/enums'

function abilities(partial: Partial<Abilities>): Abilities {
  return {
    is_general: true,
    roles: [],
    permissions: [],
    modules: [],
    scopes: [],
    ...partial,
  }
}

describe('isPublicAppUser', () => {
  it('treats no roles as public', () => {
    expect(isPublicAppUser(abilities({}))).toBe(true)
  })

  it('treats only member as public', () => {
    expect(
      isPublicAppUser(
        abilities({
          scopes: [
            {
              organization_id: 1,
              organization_location_id: 1,
              role: 'member',
              role_id: 1,
            },
          ],
        }),
      ),
    ).toBe(true)
  })

  it('treats admin as org backend', () => {
    expect(
      isPublicAppUser(
        abilities({
          scopes: [
            {
              organization_id: 1,
              organization_location_id: 1,
              role: 'admin',
              role_id: 2,
            },
          ],
        }),
      ),
    ).toBe(false)
  })

  it('treats member + admin as org backend', () => {
    expect(
      isPublicAppUser(
        abilities({
          scopes: [
            {
              organization_id: 1,
              organization_location_id: 1,
              role: 'member',
              role_id: 1,
            },
            {
              organization_id: 1,
              organization_location_id: 1,
              role: 'admin',
              role_id: 2,
            },
          ],
        }),
      ),
    ).toBe(false)
  })

  it('falls back to roles array when scopes empty', () => {
    expect(isPublicAppUser(abilities({ roles: ['member'] }))).toBe(true)
    expect(isPublicAppUser(abilities({ roles: ['owner'] }))).toBe(false)
  })
})

describe('homePathForAbilities', () => {
  it('routes public users to landing and staff to dashboard', () => {
    expect(homePathForAbilities(abilities({}))).toBe(EROUTES.LANDING)
    expect(homePathForAbilities(abilities({ roles: ['admin'] }))).toBe(EROUTES.DASHBOARD)
  })
})
