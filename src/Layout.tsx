import { Suspense } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import Header from "@/components/header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { ThemeSync } from "@/components/theme-sync"
import { Outlet, useLocation } from "react-router-dom"

const OutletFallback = () => (
  <div className="flex h-full w-full items-center justify-center py-20">
    <div className="h-12 w-12 animate-spin rounded-full border-dotted border-4 border-[#C20C0C] border-t-[#C20C0C] animation-duration-[4s]" />
  </div>
)

export default function Layout() {
  const location = useLocation()

  return (
    <>
      <ThemeSync />
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex h-svh flex-col overflow-hidden">
          <Header />
          <div data-slot="main-scroll"
          className="py-10 flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
            {/*
              RR7 navigates inside startTransition. Remount Suspense on
              location.key so the previous lazy page is not kept visible
              while the next chunk loads.
            */}
            <Suspense key={location.key} fallback={<OutletFallback />}>
              <Outlet />
            </Suspense>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
