import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ModeToggle } from "@/components/mode-toggle"
// import { NavUser } from "@/components/nav-user"
// import { UseAuth } from "@/stores/auth-store"
import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { BreadCrumbComponent } from "@/dev/core"
import { cn } from "@/lib/utils"
import { NotificationToggle } from "./notification"

export default function Header() {
  // const { user } = UseAuth();

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
        "z-50 flex h-16 w-full shrink-0 items-center justify-between gap-2 border-b bg-background px-2 transition-shadow duration-300 ease-out sm:px-4",
        "group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-gray-100 dark:bg-accent",
        scrolled &&
        "border-border/60 bg-gray-0 shadow-[0_4px_24px_rgb(0,0,0,0.08)] backdrop-blur-md"
          // "border-border/60 bg-background/95 shadow-[0_4px_24px_rgb(0,0,0,0.08)] backdrop-blur-md"
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="hidden min-w-0 flex-1 md:block">
          <BreadCrumbComponent />
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <ModeToggle />
        <LanguageSwitcher />
        <NotificationToggle />
      </div>
    </header>
  )
}
