/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import {
  BadgeCheck,
  Bell,
  LogOut,
} from "lucide-react"
import { Link } from "react-router-dom"
import { UseAuth } from "@/stores/auth-store"
import { EROUTES } from "@/utils/enums"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { getInitials } from "@/lib/format"
import type { Tuser } from "@/types/types"
import { resolveUserAvatarUrl } from "@/app/admin/account-profile/profile-api"

export function NavUser({
  user,
}: {
 user: Tuser | any
}) {
  const { isMobile } = useSidebar()
  const { logout } = UseAuth()
  const avatarSrc = resolveUserAvatarUrl(user)
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>

          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              variant='default'
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Avatar className="h-8 w-8 rounded-full">
                {avatarSrc && <AvatarImage src={avatarSrc} alt={user?.name} />}
                <AvatarFallback className="rounded-lg text-primary text-xs">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "bottom"}
            align="start"
            sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-full">
                  {avatarSrc && <AvatarImage src={avatarSrc} alt={user.name} />}
                  <AvatarFallback className="rounded-lg text-primary text-xs">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to={EROUTES.ACCOUNT_PROFILE}>
                  <BadgeCheck />
                  Account Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
