/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button as ShadButton } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { UseApiQuery } from '@/hooks/hooks'
import { cn } from '@/lib/utils'
import type { SubmitResponse } from '@/types/types'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'

type TravelerNationalitySelectProps = {
  value?: string
  onChange?: (value: string) => void
  label?: string
  required?: boolean
  disabled?: boolean
  className?: string
  /** Unique per traveler row so React Query caches do not fight each other */
  instanceId: string
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
}

type NationalityItem = {
  id: number | string
  name: string
}

type NationalityOption = {
  value: string
  label: string
}

/**
 * Nationality select for duplicated traveler rows.
 * Debounced search hits the API with `term` (backend filters by name).
 * Each row has its own queryKey via instanceId so searches do not clash.
 */
export function TravelerNationalitySelect({
  value = '',
  onChange,
  label = 'Nationality',
  required = false,
  disabled = false,
  className,
  instanceId,
  placeholder = 'Select nationality...',
  searchPlaceholder = 'Search nationality...',
  emptyMessage = 'No nationality found',
}: TravelerNationalitySelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  /** Keep label for the selected id even when it is not in the current result page */
  const [selectedOption, setSelectedOption] = useState<NationalityOption | null>(
    null
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Reset search when the popover closes so the next open shows the default list
  useEffect(() => {
    if (!open) {
      setSearch('')
      setDebouncedSearch('')
    }
  }, [open])

  const params = useMemo(
    () => ({
      direction: 'asc' as const,
      is_active: true,
      per_page: 50,
      ...(debouncedSearch ? { term: debouncedSearch } : {}),
    }),
    [debouncedSearch]
  )

  const { data, isLoading, isFetching } = UseApiQuery<SubmitResponse>({
    url: 'taxonomies/general/nationalities',
    queryKey: ['traveler-nationality', instanceId, params],
    params,
    queryOptions: {
      enabled: true,
      staleTime: 1000 * 30,
      placeholderData: (previous) => previous,
    },
  })

  const options = useMemo(() => {
    const items = (data?.data ?? []) as NationalityItem[]
    const mapped = items
      .map((item) => ({
        value: String(item.id ?? ''),
        label: String(item.name ?? ''),
      }))
      .filter((opt) => opt.value && opt.label)

    // Ensure current selection stays visible in the list
    if (
      selectedOption &&
      selectedOption.value === value &&
      !mapped.some((opt) => opt.value === selectedOption.value)
    ) {
      return [selectedOption, ...mapped]
    }
    return mapped
  }, [data?.data, selectedOption, value])

  const selectedLabel =
    options.find((opt) => opt.value === value)?.label ??
    (selectedOption?.value === value ? selectedOption.label : undefined)

  return (
    <div className={cn('space-y-2', className)}>
      {label ? (
        <Label>
          {label}
          {required ? <span className="text-destructive ml-1">*</span> : null}
        </Label>
      ) : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <ShadButton
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full h-11 sm:h-10 justify-between rounded-[5px] border-[#ADABAB] font-normal hover:bg-transparent"
          >
            <span className="truncate">
              {selectedLabel ?? (isLoading ? 'Loading...' : placeholder)}
            </span>
            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
          </ShadButton>
        </PopoverTrigger>
        <PopoverContent
          className="w-(--radix-popover-trigger-width) p-0"
          align="start"
        >
          {/* Server-driven search: disable cmdk client filter */}
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {!isLoading && !isFetching ? (
                <CommandEmpty>{emptyMessage}</CommandEmpty>
              ) : null}
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={`${instanceId}-${option.value}`}
                    value={option.label}
                    onSelect={() => {
                      setSelectedOption(option)
                      onChange?.(option.value)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'size-4',
                        value === option.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
              {(isLoading || isFetching) && (
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                  <Loader2 className="size-3 animate-spin" />
                  Searching...
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
