import { AppSidebar } from "@/components/app-sidebar"
import Header from "@/components/header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { ThemeSync } from "@/components/theme-sync"
import { Outlet } from "react-router-dom"

export default function Layout() {
  return (
    <>
      <ThemeSync />
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex h-svh flex-col overflow-hidden">
          <Header />
          <div data-slot="main-scroll"
            className="py-10 flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
