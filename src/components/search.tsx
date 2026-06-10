import { Search as SearchIcon } from "lucide-react"

import { Input } from "@/components/ui/input"

export function Search() {
  return (
    <div className="relative w-full max-w-sm hidden sm:block">
      <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search..."
        className="w-full bg-background pl-8 md:w-75 lg:w-75"
      />
    </div>
  )
}
