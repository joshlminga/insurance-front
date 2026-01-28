import * as React from "react"
import {
  // Users,
  // Wallet,
  // CreditCard,
  // ArrowLeftRight,
  // BarChart3,
  // UserCog,
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
import { CURRENTUSER } from "@/utils/enums"
import AppLogo from "./ui/app-logo"

// Navigation data for Accensure Management System
const navData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Policyholders",
      url: "/members",
      icon: Users,
      items: [
        {
          title: "All Policyholders",
          url: "/members",
        },
        {
          title: "New Policyholder",
          url: "/members/new",
        },
      ],
    },
    {
      title: "Premiums & Claims",
      url: "/savings",
      icon: Wallet,
      items: [
        {
          title: "Accounts",
          url: "/savings",
        },
        {
          title: "Insurance Products",
          url: "/savings/products",
        },
      ],
    },
    {
      title: "Policies",
      url: "/loans",
      icon: ShieldCheck,
      items: [
        {
          title: "All Policies",
          url: "/loans",
        },
        {
          title: "New Application",
          url: "/loans/apply",
        },
        {
          title: "Policy Products",
          url: "/loans/products",
        },
      ],
    },
    {
      title: "Payments",
      url: "/transactions",
      icon: ArrowLeftRight,
    },
    {
      title: "Insights",
      url: "/reports",
      icon: BarChart3,
    },
    {
      title: "Agents",
      url: "/staff",
      icon: UserCog,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ],
}


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppLogo />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={CURRENTUSER} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
