import { Bell } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ModeToggle } from "@/components/mode-toggle"
import { NavUser } from "@/components/nav-user"
import { Search } from "@/components/search"
import { UseAuth } from "./auth-provider"

export default function Header() {
  const { user } = UseAuth();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear  group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
      </div>
      <div className="flex items-center gap-4">
        <Search />
        <ModeToggle />
        <LanguageSwitcher />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600" />
          <span className="sr-only">Notifications</span>
        </Button>
        <div className="w-px h-6 bg-border mx-2" />
        <NavUser user={user} />
      </div>
    </header>
  )
}
