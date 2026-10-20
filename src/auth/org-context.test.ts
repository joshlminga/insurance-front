import { describe, expect, it } from 'vitest'
import {
  allowedOrgLocationIds,
  scopesToLocationOptions,
  shouldShowOrgLocationPicker,
  singleScopedLocationId,
  uniqueScopedLocationIds,
} from '@/auth/org-context'
import type { Abilities, AbilityScope } from '@/auth/types'

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

function scope(
  locationId: number | null,
  role = 'admin',
  organizationId = 1,
  roleId = 1,
): AbilityScope {
  return {
    organization_id: organizationId,
    organization_location_id: locationId,
    role,
    role_id: roleId,
  }
}

describe('uniqueScopedLocationIds', () => {
  it('dedupes many roles on the same location', () => {
    const result = uniqueScopedLocationIds(
      abilities({
        is_general: true,
        scopes: [
          scope(1, 'admin', 1, 2),
          scope(1, 'finance', 1, 5),
          scope(1, 'owner', 1, 3),
        ],
      }),
    )

    expect(result).toEqual([1])
  })

  it('returns multiple unique locations', () => {
    const result = uniqueScopedLocationIds(
      abilities({
        scopes: [scope(1, 'admin'), scope(2, 'admin', 2, 2)],
      }),
    )

    expect(result).toEqual([1, 2])
  })
})

describe('shouldShowOrgLocationPicker', () => {
  it('hides picker when many roles share one location', () => {
    expect(
      shouldShowOrgLocationPicker(
        abilities({
          is_general: true,
          scopes: [scope(1, 'admin'), scope(1, 'finance')],
        }),
      ),
    ).toBe(false)
  })

  it('shows picker for two unique locations', () => {
    expect(
      shouldShowOrgLocationPicker(
        abilities({
          is_general: true,
          scopes: [scope(1), scope(2, 'admin', 2, 2)],
        }),
      ),
    ).toBe(true)
  })

  it('shows picker for super admin even with no scopes', () => {
    expect(
      shouldShowOrgLocationPicker(
        abilities({ roles: ['super_admin'], scopes: [] }),
      ),
    ).toBe(true)
  })

  it('hides picker for public general with no scopes', () => {
    expect(
      shouldShowOrgLocationPicker(
        abilities({ is_general: true, scopes: [] }),
      ),
    ).toBe(false)
  })
})

describe('allowedOrgLocationIds', () => {
  it('returns null for super admin (no filter)', () => {
    expect(
      allowedOrgLocationIds(abilities({ roles: ['super_admin'] })),
    ).toBeNull()
  })

  it('returns only the user scoped locations', () => {
    expect(
      allowedOrgLocationIds(
        abilities({
          is_general: true,
          scopes: [scope(1), scope(2, 'admin', 2, 2)],
        }),
      ),
    ).toEqual([1, 2])
  })
})

describe('singleScopedLocationId', () => {
  it('returns the only unique location', () => {
    expect(
      singleScopedLocationId(
        abilities({
          scopes: [scope(7, 'admin'), scope(7, 'finance')],
        }),
      ),
    ).toBe(7)
  })

  it('returns null when there are two locations', () => {
    expect(
      singleScopedLocationId(
        abilities({
          scopes: [scope(1), scope(2, 'admin', 2, 2)],
        }),
      ),
    ).toBeNull()
  })
})

describe('scopesToLocationOptions', () => {
  it('dedupes options by location id', () => {
    const options = scopesToLocationOptions([
      scope(1, 'admin', 1, 2),
      scope(1, 'finance', 1, 5),
    ])

    expect(options).toHaveLength(1)
    expect(options[0]?.locationId).toBe(1)
  })
})
