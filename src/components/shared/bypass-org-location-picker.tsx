import { Label } from '@/components/ui/label'
import { SearchableCommandSelect } from '@/dev/core'
import { UseApiQuery } from '@/hooks/hooks'
import { serializeOrganizationLocationParams } from '@/lib/organization-location-params'
import type { SubmitResponse } from '@/types/types'
import { useEffect, useMemo, useState } from 'react'

type BypassOrgLocationPickerProps = {
  value: string
  onChange: (value: string) => void
  className?: string
  /** Optional organization_type filter (e.g. Company / Partner). Omit to list all active locations. */
  organizationTypes?: string[]
  /**
   * When set, only these organization_location_id values appear.
   * null / omit = no filter (super admin sees every location).
   */
  allowedLocationIds?: number[] | null
  /** Helper text under the select */
  hint?: string
}

type OrganizationLocationOption = {
  organization_location_id?: number | string
  organization_name?: string
  country?: { name?: string }
}

function formatLocationLabel(location: OrganizationLocationOption): string {
  const name = location.organization_name ?? 'Unknown organization'
  const country = location.country?.name

  return country ? `${name} - ${country}` : name
}

/**
 * Lets Super Admin / multi-location staff choose which organization location
 * an org-scoped screen applies to (sent as X-Organization-Location-Id).
 *
 * Typing searches active locations (`term` on organization-location).
 * The chosen name stays on the closed field even when that row is not in the current page.
 */
export function BypassOrgLocationPicker({
  value,
  onChange,
  className,
  organizationTypes,
  allowedLocationIds,
  hint = 'Reports and lists apply to the selected organization location only.',
}: BypassOrgLocationPickerProps) {
  // The API call waits until typing pauses, so each keystroke does not hit the server.
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  // Remembered label for the id already chosen.
  const [selectedOption, setSelectedOption] = useState<{ value: string; label: string }>()

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const params = useMemo(() => {
    const base: {
      direction: 'asc'
      is_active: boolean
      per_page: number
      term?: string
      organization_type?: string[]
    } = {
      direction: 'asc',
      is_active: true,
      per_page: 100,
    }

    if (debouncedSearch) {
      base.term = debouncedSearch
    }

    if (organizationTypes && organizationTypes.length > 0) {
      return { ...base, organization_type: [...organizationTypes] }
    }

    return base
  }, [organizationTypes, debouncedSearch])

  const { data, isLoading, isFetching } = UseApiQuery<SubmitResponse>({
    url: 'organization-location',
    params,
    config: { paramsSerializer: serializeOrganizationLocationParams },
    queryOptions: {
      enabled: true,
      placeholderData: (previousData) => previousData,
    },
  })

  const locations = useMemo(() => {
    const rows = (data?.data ?? []) as OrganizationLocationOption[]
    if (allowedLocationIds == null) {
      return rows
    }
    const allowed = new Set(allowedLocationIds.map(String))
    return rows.filter((location) =>
      allowed.has(String(location.organization_location_id ?? '')),
    )
  }, [data?.data, allowedLocationIds])

  const valueInList = Boolean(value) && locations.some(
    (location) => String(location.organization_location_id ?? '') === value,
  )

  // Load the chosen row by id when it is not in the current page (past the first 100, or filtered by search).
  const { data: pinnedResponse } = UseApiQuery<SubmitResponse>({
    url: 'organization-location',
    params: {
      direction: 'asc' as const,
      is_active: true,
      per_page: 1,
      organization_location_id: value,
    },
    config: { paramsSerializer: serializeOrganizationLocationParams },
    queryOptions: {
      enabled: Boolean(value) && !isLoading && !valueInList && selectedOption?.value !== value,
      staleTime: 1000 * 60 * 5,
    },
  })

  useEffect(() => {
    if (!value) {
      setSelectedOption(undefined)
      return
    }

    const fromPage = locations.find(
      (location) => String(location.organization_location_id ?? '') === value,
    )
    const pinnedRows = (pinnedResponse?.data ?? []) as OrganizationLocationOption[]
    const pinned = pinnedRows.find(
      (location) => String(location.organization_location_id ?? '') === value,
    )
    const source = fromPage ?? pinned
    if (!source) {
      return
    }

    if (allowedLocationIds != null && !allowedLocationIds.map(String).includes(value)) {
      return
    }

    setSelectedOption({ value, label: formatLocationLabel(source) })
  }, [locations, value, pinnedResponse, allowedLocationIds])

  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      <Label>
        Organization location
        <span className="text-destructive ml-1">*</span>
      </Label>
      <SearchableCommandSelect
        value={value || undefined}
        onChange={onChange}
        options={locations.map((location) => ({
          value: String(location.organization_location_id),
          label: formatLocationLabel(location),
        }))}
        placeholder="Select organization location..."
        searchPlaceholder="Search organization..."
        emptyMessage="No organization locations found"
        isLoading={isLoading}
        isFetching={isFetching}
        onSearchChange={setSearch}
        selectedOption={selectedOption}
      />
      {hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
