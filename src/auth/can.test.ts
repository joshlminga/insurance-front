import { describe, expect, it } from 'vitest'
import { can, isBypassUser } from './can'
import type { Abilities, AbilityScope } from './types'

function abilities(partial: Partial<Abilities>): Abilities {
  return {
    is_general: false,
    roles: [],
    permissions: [],
    modules: [],
    scopes: [],
    ...partial,
  }
}

function scope(locationId = 2, role = 'sales-1'): AbilityScope {
  return {
    organization_id: 1,
    organization_location_id: locationId,
    role,
    role_id: 10,
  }
}

describe('isBypassUser', () => {
  it('bypasses public general users with no role scopes', () => {
    expect(isBypassUser(abilities({ is_general: true, scopes: [] }))).toBe(true)
  })

  it('does not bypass org staff who are is_general but have role scopes', () => {
    expect(
      isBypassUser(
        abilities({
          is_general: true,
          roles: ['sales-1'],
          scopes: [scope()],
        }),
      ),
    ).toBe(false)
  })

  it('bypasses platform super_admin', () => {
    expect(isBypassUser(abilities({ roles: ['super_admin'] }))).toBe(true)
  })
})

describe('can for scoped is_general staff', () => {
  it('denies dmvic when role has no dmvic permission', () => {
    const staff = abilities({
      is_general: true,
      roles: ['sales-1'],
      permissions: ['quotation-motor.menu', 'quotation-motor.advance'],
      scopes: [scope()],
      context: {
        organization_id: 1,
        organization_location_id: 2,
        role: 'sales-1',
        role_id: 10,
        permissions: ['quotation-motor.menu', 'quotation-motor.advance'],
      },
    })

    expect(can(staff, 'dmvic-stock.menu')).toBe(false)
    expect(can(staff, 'quotation-motor.menu')).toBe(true)
  })
})
