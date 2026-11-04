import { describe, expect, it } from 'vitest'
import { hasModuleRouteAccess } from './module-route-access'

describe('hasModuleRouteAccess', () => {
  it('requires module.menu before a sibling permission can open the page', () => {
    // claims.settings alone must not unlock a claims.list page
    const granted = new Set(['claims.settings'])
    const can = (permission: string) => granted.has(permission)

    expect(
      hasModuleRouteAccess({
        skipModuleCheck: false,
        hasMenuAccess: false,
        permission: 'claims.list',
        can,
      }),
    ).toBe(false)

    expect(
      hasModuleRouteAccess({
        skipModuleCheck: false,
        hasMenuAccess: true,
        permission: 'claims.list',
        can,
      }),
    ).toBe(false)
  })

  it('allows the page when menu and the screen permission are both present', () => {
    const granted = new Set(['claims.menu', 'claims.list'])
    const can = (permission: string) => granted.has(permission)

    expect(
      hasModuleRouteAccess({
        skipModuleCheck: false,
        hasMenuAccess: true,
        permission: 'claims.list',
        can,
      }),
    ).toBe(true)
  })

  it('allows shared URLs when any listed permission is present', () => {
    const granted = new Set(['finance-control.action'])
    const can = (permission: string) => granted.has(permission)

    expect(
      hasModuleRouteAccess({
        skipModuleCheck: false,
        hasMenuAccess: true,
        permissions: ['finance-control.transactions', 'finance-control.action'],
        can,
      }),
    ).toBe(true)
  })

  it('skips the menu check for product-line-only routes', () => {
    expect(
      hasModuleRouteAccess({
        skipModuleCheck: true,
        hasMenuAccess: false,
        can: () => false,
      }),
    ).toBe(true)
  })
})
