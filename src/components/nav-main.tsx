"use client"

import { ChevronRight } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import type { NavItem, NavSubItem } from "@/navigation/admin-nav-config"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

function isPathActive(pathname: string, url?: string): boolean {
  if (!url) return false
  return pathname === url || pathname.startsWith(`${url}/`)
}

function isSubItemActive(pathname: string, subItem: NavSubItem): boolean {
  if (isPathActive(pathname, subItem.url)) return true
  return subItem.items?.some((child) => isSubItemActive(pathname, child)) ?? false
}

function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (isPathActive(pathname, item.url)) return true
  return item.items?.some((subItem) => isSubItemActive(pathname, subItem)) ?? false
}

function NavSubMenu({
  items,
  pathname,
  depth = 0,
}: {
  items: NavSubItem[]
  pathname: string
  depth?: number
}) {
  return (
    <SidebarMenuSub className={depth > 0 ? "mx-0 border-l-0 px-0" : undefined}>
      {items.map((subItem) => {
        const hasChildren = Boolean(subItem.items?.length)
        const isActive = isSubItemActive(pathname, subItem)

        if (!hasChildren) {
          return (
            <SidebarMenuSubItem key={subItem.title}>
              <SidebarMenuSubButton
                asChild
                size={depth > 0 ? "sm" : "md"}
                isActive={pathname === subItem.url}>
                <Link to={subItem.url ?? "#"}>
                  <span>{subItem.title}</span>
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          )
        }

        return (
          <Collapsible
            key={subItem.title}
            asChild
            defaultOpen={isActive}
            className="group/collapsible-sub">
            <SidebarMenuSubItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuSubButton
                  size={depth > 0 ? "sm" : "md"}
                  isActive={isActive}
                  className="cursor-pointer">
                  <span>{subItem.title}</span>
                  <ChevronRight className="ml-auto size-3 transition-transform duration-200 group-data-[state=open]/collapsible-sub:rotate-90" />
                </SidebarMenuSubButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <NavSubMenu
                  items={subItem.items ?? []}
                  pathname={pathname}
                  depth={depth + 1}
                />
              </CollapsibleContent>
            </SidebarMenuSubItem>
          </Collapsible>
        )
      })}
    </SidebarMenuSub>
  )
}

export function NavMain({
  items,
}: {
  items: NavItem[]
}) {
  const location = useLocation()

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = isNavItemActive(location.pathname, item)
          if (!item.items || item.items.length === 0) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  isActive={isActive}>
                  <Link to={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isActive}
              className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <NavSubMenu items={item.items} pathname={location.pathname} />
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
