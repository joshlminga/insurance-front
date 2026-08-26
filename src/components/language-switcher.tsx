"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { ReusablePopover } from "@/dev/core"

const languages = [
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Spanish", value: "es" },
  { label: "Portuguese", value: "pt" },
  { label: "Russian", value: "ru" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
  { label: "Chinese", value: "zh" },
]

export function LanguageSwitcher() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("en")
  return (
    <ReusablePopover
      trigger={
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="h-9 w-9 justify-center px-0 sm:w-fit sm:px-3">
          <Globe className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">
            {value
              ? languages.find((language) => language.value === value)?.label
              : "Select"}
          </span>
          <ChevronsUpDown className="ml-2 hidden h-4 w-4 shrink-0 opacity-50 sm:block" />
        </Button>
      }
      children={
        <Command>
          <CommandInput placeholder="Search language..." />
          <CommandList>
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
              {languages.map((language) => (
                <CommandItem
                  key={language.value}
                  value={language.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }} >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === language.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {language.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      }
    />
  )
}
