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
import { isPlatformSuperAdmin } from '@/auth/org-context'
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
  // Role name super_admin only. Do not use isBypassUser — that also matches is_general.
  const platformSuperAdmin = isPlatformSuperAdmin(abilities)

  // Re-filter when abilities change (not just function identity)
  const visibleNav = useMemo(
    () =>
      filterNavItems(
        adminNavConfig,
        hasModule,
        canModuleMenu,
        can,
        platformSuperAdmin,
        abilities?.context?.products,
      ),
    [abilities, hasModule, canModuleMenu, can, platformSuperAdmin],
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
