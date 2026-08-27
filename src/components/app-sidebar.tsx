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
import { useCan } from '@/auth/useCan'
import { useModules } from '@/auth/useModules'
import { adminNavConfig } from '@/navigation/admin-nav-config'
import { filterNavItems } from '@/navigation/filter-nav-items'
import AppLogo from './ui/app-logo'
import { UseAuth, useAuthStore } from '@/stores/auth-store'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = UseAuth()
  const abilities = useAuthStore((s) => s.abilities)
  const { hasModule } = useModules()
  const { can, canModuleMenu } = useCan()

  // Re-filter when abilities change (not just function identity)
  const visibleNav = useMemo(
    () => filterNavItems(adminNavConfig, hasModule, canModuleMenu, can),
    [abilities, hasModule, canModuleMenu, can],
  )

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="">
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
