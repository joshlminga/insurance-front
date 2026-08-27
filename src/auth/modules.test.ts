import { describe, expect, it } from 'vitest'
import { hasModule } from './modules'
import type { Abilities } from './types'

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

describe('hasModule', () => {
  it('returns true when module is listed on abilities.modules', () => {
    expect(
      hasModule(abilities({ modules: ['finance-control'] }), 'finance-control'),
    ).toBe(true)
  })

  it('returns true when module CSV is missing but permission grants exist', () => {
    expect(
      hasModule(
        abilities({
          modules: [],
          permissions: [
            'finance-control.menu',
            'finance-control.action',
            'finance-control.mine',
          ],
        }),
        'finance-control',
      ),
    ).toBe(true)
  })

  it('uses context permissions when present', () => {
    expect(
      hasModule(
        abilities({
          modules: [],
          permissions: [],
          context: {
            organization_id: 1,
            organization_location_id: 1,
            role: 'operator',
            role_id: 1,
            permissions: ['finance-control.action'],
          },
        }),
        'finance-control',
      ),
    ).toBe(true)
  })

  it('returns false when neither modules nor permissions match', () => {
    expect(
      hasModule(
        abilities({
          modules: ['invoice'],
          permissions: ['invoice.list'],
        }),
        'finance-control',
      ),
    ).toBe(false)
  })
})
