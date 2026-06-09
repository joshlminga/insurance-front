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
        <SidebarInset>
          <Header />
          <div className="flex flex-1 flex-col gap-4 px-4 py-6">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
