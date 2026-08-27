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
            {/* // className="py-10 flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0 bg-gray-0"> */}
            {/* className="py-10 flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0 bg-[#e2e2e2]"> */}
            <Outlet />

            {/* <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{
                  duration: 0.50,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex flex-1 flex-col"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence> */}

          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
