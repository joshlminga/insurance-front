import { useMemo } from 'react'
import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useModules } from '@/auth/useModules'
import { adminNavConfig } from '@/navigation/admin-nav-config'
import { filterNavItems } from '@/navigation/filter-nav-items'
import AppLogo from './ui/app-logo'
import { UseAuth } from '@/stores/auth-store'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = UseAuth()
  const { hasModule, hasAnyModule } = useModules()

  const visibleNav = useMemo(
    () => filterNavItems(adminNavConfig, hasModule, hasAnyModule),
    [hasModule, hasAnyModule],
  )

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="bg-white">
        <AppLogo />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={visibleNav} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
