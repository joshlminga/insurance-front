import { Bell } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ModeToggle } from "@/components/mode-toggle"
import { NavUser } from "@/components/nav-user"
import { Search } from "@/components/search"
import { UseAuth } from "@/stores/auth-store"
import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { BreadCrumbComponent } from "@/dev/core"
import { cn } from "@/lib/utils"

export default function Header() {
  const { user } = UseAuth();

  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const scrollContainer = document.querySelector('[data-slot="main-scroll"]')
    if (!scrollContainer) return
    const onScroll = () => {
      setScrolled(scrollContainer.scrollTop > 8)
    }
    onScroll()
    scrollContainer.addEventListener("scroll", onScroll, { passive: true })
    return () => scrollContainer.removeEventListener("scroll", onScroll)
  }, [location.pathname])

  return (
    <header
      className={cn(
        "z-50 flex h-16 w-full shrink-0 items-center justify-between gap-2 border-b bg-background px-4 transition-shadow duration-300 ease-out",
        "group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
        scrolled &&
        "border-border/60 bg-background/95 shadow-[0_4px_24px_rgb(0,0,0,0.08)] backdrop-blur-md"
      )}>
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        
        <Separator orientation="vertical" className="mr-2 h-4" />
        
        <div className="hidden min-w-0 flex-1 md:block">
          <BreadCrumbComponent />
        </div>
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
