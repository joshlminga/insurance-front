import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}