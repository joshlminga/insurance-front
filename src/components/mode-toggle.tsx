import { Laptop, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useThemeStore } from "@/stores/theme-store"
import { ReusablePopover } from "@/dev/core"

export function ModeToggle() {
  const setTheme = useThemeStore((s) => s.setTheme)

  return (
    <ReusablePopover
      trigger={
        <Button variant="outline" size="icon" className="rounded-full shadow-none outline-0">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      }
      children={
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setTheme("light")}>
            <Sun />
            Light
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setTheme("dark")}>
            <Moon />
            Dark
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setTheme("system")}>
            <Laptop />
            System
          </Button>
        </div>
      }
    />
  )
}
