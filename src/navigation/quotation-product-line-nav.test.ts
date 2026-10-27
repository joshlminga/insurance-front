import { describe, expect, it } from 'vitest'
import { filterNavItems } from './filter-nav-items'
import type { NavItem } from './admin-nav-config'
import { MODULES } from '@/auth/module-keys'
import {
  hasOrgProductLineAccess,
  requiredProductLineForNavItem,
} from './quotation-product-line-nav'

const alwaysTrue = () => true

describe('quotation product line nav', () => {
  it('maps quotation modules to a single product line', () => {
    expect(
      requiredProductLineForNavItem({ module: MODULES.QUOTATION_MOTOR }),
    ).toBe('Motor')
    expect(
      requiredProductLineForNavItem({ module: MODULES.QUOTATION_TRAVEL }),
    ).toBe('Travel')
    expect(
      requiredProductLineForNavItem({
        modules: [...[MODULES.QUOTATION_MOTOR, MODULES.QUOTATION_TRAVEL]],
      }),
    ).toBeNull()
  })

  it('allows all lines when org context products are missing', () => {
    expect(hasOrgProductLineAccess('Travel', undefined)).toBe(true)
  })

  it('motor-only context hides travel quotation nav', () => {
    const items: NavItem[] = [
      {
        title: 'Quotations',
        url: '/admin/quotations/motor-quotations',
        modules: [MODULES.QUOTATION_MOTOR, MODULES.QUOTATION_TRAVEL],
        items: [
          {
            title: 'Motor',
            url: '/admin/quotations/motor-quotations',
            module: MODULES.QUOTATION_MOTOR,
          },
          {
            title: 'Travel',
            url: '/admin/quotations/travel-quotations',
            module: MODULES.QUOTATION_TRAVEL,
          },
        ],
      },
    ]

    const visible = filterNavItems(items, alwaysTrue, alwaysTrue, alwaysTrue, false, ['Motor'])

    expect(visible).toHaveLength(1)
    expect(visible[0]?.items?.map((item) => item.title)).toEqual(['Motor'])
  })

  it('motor and travel context shows both quotation lines', () => {
    const items: NavItem[] = [
      {
        title: 'Quotations',
        url: '/admin/quotations/motor-quotations',
        modules: [MODULES.QUOTATION_MOTOR, MODULES.QUOTATION_TRAVEL],
        items: [
          {
            title: 'Motor',
            url: '/admin/quotations/motor-quotations',
            module: MODULES.QUOTATION_MOTOR,
          },
          {
            title: 'Travel',
            url: '/admin/quotations/travel-quotations',
            module: MODULES.QUOTATION_TRAVEL,
          },
        ],
      },
    ]

    const visible = filterNavItems(
      items,
      alwaysTrue,
      alwaysTrue,
      alwaysTrue,
      false,
      ['Motor', 'Travel'],
    )

    expect(visible[0]?.items?.map((item) => item.title)).toEqual(['Motor', 'Travel'])
  })
})
