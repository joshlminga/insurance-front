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

  it('maps report and catalog modules to product lines', () => {
    expect(
      requiredProductLineForNavItem({
        module: MODULES.REPORT_ORG_MOTOR_VEHICLE,
      }),
    ).toBe('Motor')
    expect(
      requiredProductLineForNavItem({
        module: MODULES.REPORT_ORG_TRAVEL_QUOTATION,
      }),
    ).toBe('Travel')
    expect(
      requiredProductLineForNavItem({ module: MODULES.PRODUCT_MOTOR }),
    ).toBe('Motor')
    expect(
      requiredProductLineForNavItem({ module: MODULES.DMVIC_CERTIFICATE }),
    ).toBe('Motor')
    expect(
      requiredProductLineForNavItem({ module: MODULES.CLAIMS }),
    ).toBe('Motor')
    expect(
      requiredProductLineForNavItem({ module: MODULES.QUOTATION_MARINE }),
    ).toBe('Marine')
  })

  it('prefers explicit productLine over mixed modules', () => {
    expect(
      requiredProductLineForNavItem({
        modules: [MODULES.QUOTATION_TRAVEL, MODULES.REPORT_MOTOR_QUOTATION],
        productLine: 'Travel',
      }),
    ).toBe('Travel')
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

  it('motor-only context hides Reports Travel and Travel catalog, keeps Customers and Motor', () => {
    const items: NavItem[] = [
      {
        title: 'Reports',
        url: '/admin/reports/customers',
        modules: [
          MODULES.REPORT_CUSTOMER,
          MODULES.REPORT_ORG_MOTOR_VEHICLE,
          MODULES.REPORT_ORG_TRAVEL_QUOTATION,
        ],
        items: [
          {
            title: 'Customers',
            url: '/admin/reports/customers',
            module: MODULES.REPORT_CUSTOMER,
          },
          {
            title: 'Motor',
            url: '/admin/reports/motor/vehicles',
            modules: [MODULES.REPORT_ORG_MOTOR_VEHICLE],
            items: [
              {
                title: 'Vehicles',
                url: '/admin/reports/motor/vehicles',
                module: MODULES.REPORT_ORG_MOTOR_VEHICLE,
              },
            ],
          },
          {
            title: 'Travel',
            url: '/admin/reports/travel/quotations',
            module: MODULES.REPORT_ORG_TRAVEL_QUOTATION,
            items: [
              {
                title: 'Quotations',
                url: '/admin/reports/travel/quotations',
                module: MODULES.REPORT_ORG_TRAVEL_QUOTATION,
              },
            ],
          },
        ],
      },
      {
        title: 'Travel',
        url: '/admin/products/travel',
        productLine: 'Travel',
        items: [
          {
            title: 'Products',
            url: '/admin/products/travel',
          },
        ],
      },
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
            modules: [MODULES.QUOTATION_TRAVEL, MODULES.REPORT_MOTOR_QUOTATION],
            productLine: 'Travel',
            items: [
              {
                title: 'Listed',
                url: '/admin/reports/quotations/travel',
                modules: [MODULES.QUOTATION_TRAVEL, MODULES.REPORT_MOTOR_QUOTATION],
                productLine: 'Travel',
              },
            ],
          },
        ],
      },
    ]

    const visible = filterNavItems(items, alwaysTrue, alwaysTrue, alwaysTrue, false, ['Motor'])

    expect(visible.map((item) => item.title)).toEqual(['Reports', 'Quotations'])

    const reports = visible.find((item) => item.title === 'Reports')
    expect(reports?.items?.map((item) => item.title)).toEqual(['Customers', 'Motor'])

    const quotations = visible.find((item) => item.title === 'Quotations')
    expect(quotations?.items?.map((item) => item.title)).toEqual(['Motor'])
  })
})
