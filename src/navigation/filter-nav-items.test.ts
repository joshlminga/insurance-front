import { describe, expect, it } from 'vitest'
import { filterNavItems } from './filter-nav-items'
import type { NavItem } from './admin-nav-config'

const alwaysTrue = () => true

describe('filterNavItems requireSuperAdmin', () => {
  const items: NavItem[] = [
    {
      title: 'Users',
      url: '/admin/users',
      module: 'user',
      requireSuperAdmin: true,
    },
    {
      title: 'Organization Members',
      url: '/admin/organization-members',
      module: 'organization-location-user',
    },
    {
      title: 'Currencies',
      url: '/admin/currencies/available',
      // Entire ATU Currencies group is platform super_admin only.
      requireSuperAdmin: true,
      modules: [
        'atu-multicurrency-currency',
        'atu-multicurrency-log',
        'atu-multicurrency-settings',
      ],
      items: [
        {
          title: 'Available',
          url: '/admin/currencies/available',
          module: 'atu-multicurrency-currency',
          requireSuperAdmin: true,
        },
        {
          title: 'Activity Logs',
          url: '/admin/currencies/activity-logs',
          module: 'atu-multicurrency-log',
          requireSuperAdmin: true,
        },
        {
          title: 'Configuration',
          url: '/admin/currencies/configuration',
          module: 'atu-multicurrency-settings',
          requireSuperAdmin: true,
        },
      ],
    },
  ]

  it('hides requireSuperAdmin items when the viewer is not a platform super admin', () => {
    // is_general would make can()/hasModule() true; requireSuperAdmin must still hide.
    const visible = filterNavItems(items, alwaysTrue, alwaysTrue, alwaysTrue, false)

    expect(visible.map((item) => item.title)).toEqual(['Organization Members'])
  })

  it('shows requireSuperAdmin items when isPlatformSuperAdmin is true', () => {
    const visible = filterNavItems(items, alwaysTrue, alwaysTrue, alwaysTrue, true)

    expect(visible.map((item) => item.title)).toEqual([
      'Users',
      'Organization Members',
      'Currencies',
    ])
    expect(visible.find((item) => item.title === 'Currencies')?.items?.map((s) => s.title)).toEqual([
      'Available',
      'Activity Logs',
      'Configuration',
    ])
  })
})
