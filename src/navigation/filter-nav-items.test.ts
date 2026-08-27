import { describe, expect, it } from 'vitest'
import { filterNavItems } from './filter-nav-items'
import type { NavItem } from './admin-nav-config'

const creditNav: NavItem[] = [
  {
    title: 'Credit',
    url: '/dashboard/credit/wallet',
    module: 'finance-control',
    items: [
      {
        title: 'My Wallet',
        url: '/dashboard/credit/wallet',
        module: 'finance-control',
        permission: 'finance-control.mine',
      },
      {
        title: 'Transactions',
        url: '/dashboard/credit/transactions',
        module: 'finance-control',
      },
      {
        title: 'Recharge Credit',
        url: '/dashboard/credit/transactions',
        module: 'finance-control',
        permission: 'finance-control.action',
      },
      {
        title: 'Pending Approvals',
        url: '/dashboard/credit/approvals',
        module: 'finance-control',
        permission: 'finance-control.approve',
      },
      {
        title: 'Adjustments',
        url: '/dashboard/credit/adjustments',
        module: 'finance-control',
        permission: 'finance-control.adjust',
      },
    ],
  },
]

describe('filterNavItems — Credit permissions', () => {
  const hasModule = (key: string) => key === 'finance-control'
  const canMenu = (key: string) => key === 'finance-control'

  it('shows only Transactions when user has menu but no finer permissions', () => {
    const can = () => false
    const result = filterNavItems(creditNav, hasModule, canMenu, can)
    expect(result).toHaveLength(1)
    expect(result[0].items?.map((i) => i.title)).toEqual(['Transactions'])
  })

  it('shows Wallet + Transactions when user has finance-control.mine', () => {
    const can = (p: string) => p === 'finance-control.mine'
    const result = filterNavItems(creditNav, hasModule, canMenu, can)
    expect(result[0].items?.map((i) => i.title)).toEqual([
      'My Wallet',
      'Transactions',
    ])
  })

  it('shows Recharge Credit when user has finance-control.action', () => {
    const can = (p: string) => p === 'finance-control.action'
    const result = filterNavItems(creditNav, hasModule, canMenu, can)
    expect(result[0].items?.map((i) => i.title)).toEqual([
      'Transactions',
      'Recharge Credit',
    ])
  })

  it('hides Credit parent when module/menu is missing', () => {
    const result = filterNavItems(
      creditNav,
      () => false,
      () => false,
      () => true,
    )
    expect(result).toHaveLength(0)
  })

  it('shows all children when can() allows every permission', () => {
    const result = filterNavItems(creditNav, hasModule, canMenu, () => true)
    expect(result[0].items).toHaveLength(5)
  })
})
