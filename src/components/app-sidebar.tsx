import * as React from "react"
import {
  Settings,
  LayoutDashboard,
  Users,
  Wallet,
  ArrowLeftRight,
  BarChart3,
  UserCog,
  ShieldCheck,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { EROUTES } from "@/utils/enums"
import AppLogo from "./ui/app-logo"
import { UseAuth } from "./auth-provider"


const navData = {
  navMain: [
    {
      title: "Dashboard",
      url: EROUTES.DASHBOARD,
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Policyholders",
      url: EROUTES.MEMBERS,
      icon: Users,
      items: [
        {
          title: "All Policyholders",
          url: EROUTES.MEMBERS,
        },
        {
          title: "New Policyholder",
          url: EROUTES.MEMBERS_NEW,
        },
      ],
    },
    {
      title: "Premiums & Claims",
      url: EROUTES.SAVINGS,
      icon: Wallet,
      items: [
        {
          title: "Accounts",
          url: EROUTES.SAVINGS,
        },
        {
          title: "Insurance Products",
          url: EROUTES.SAVINGS_PRODUCTS,
        },
      ],
    },
    {
      title: "Policies",
      url: EROUTES.LOANS,
      icon: ShieldCheck,
      items: [
        {
          title: "All Policies",
          url: EROUTES.LOANS,
        },
        {
          title: "New Application",
          url: EROUTES.LOANS_APPLY,
        },
        {
          title: "Policy Products",
          url: EROUTES.LOANS_PRODUCTS,
        },
      ],
    },
    {
      title: "Payments",
      url: EROUTES.TRANSACTIONS,
      icon: ArrowLeftRight,
    },
    {
      title: "Insights",
      url: EROUTES.REPORTS,
      icon: BarChart3,
    },
    {
      title: "Agents",
      url: EROUTES.STAFF,
      icon: UserCog,
    },
    {
      title: "Settings",
      url: EROUTES.SETTINGS,
      icon: Settings,
    },
  ],
}


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {user} = UseAuth()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppLogo />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
