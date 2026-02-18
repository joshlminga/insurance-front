import { AppSidebar } from "@/components/app-sidebar"
import Header from "@/components/header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { Outlet } from "react-router-dom"

export default function Layout() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Header/>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              <Outlet />
            </div>
          </SidebarInset>
        </SidebarProvider>
    </ThemeProvider>
  )
}
