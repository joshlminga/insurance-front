/* eslint-disable @typescript-eslint/no-explicit-any */
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UseApiQuery } from '@/hooks/hooks'
import { serializeOrganizationLocationParams } from '@/lib/organization-location-params'
import type { SubmitResponse } from '@/types/types'
import { EORGANIZATIONTYPES } from '@/utils/constatnts'
import { Loader2 } from 'lucide-react'
import { useMemo } from 'react'

/** Credit pool org types: Company, Organization, Partner (excludes Agent and Insurer). */
const CREDIT_SETUP_ORGANIZATION_TYPES = [
  EORGANIZATIONTYPES.COMPANY,
  EORGANIZATIONTYPES.ORGANIZATION,
  EORGANIZATIONTYPES.PARTNER,
] as const

type CreditSetupOrgPickerProps = {
  value: string
  onChange: (value: string) => void
  className?: string
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
 * Lets super admins choose which organization location credit setup applies to.
 * Loads locations filtered to Company / Organization / Partner only.
 */
export function CreditSetupOrgPicker({
  value,
  onChange,
  className,
}: CreditSetupOrgPickerProps) {
  const params = useMemo(
    () => ({
      direction: 'asc' as const,
      is_active: true,
      per_page: 100,
      organization_type: [...CREDIT_SETUP_ORGANIZATION_TYPES],
    }),
    [],
  )

  const { data, isLoading } = UseApiQuery<SubmitResponse>({
    url: 'organization-location',
    params,
    config: { paramsSerializer: serializeOrganizationLocationParams },
    queryOptions: { enabled: true },
  })

  const locations = (data?.data ?? []) as OrganizationLocationOption[]
  const selectValue = value && value !== '' ? value : undefined

  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      <Label>
        Organization location
        <span className="text-destructive ml-1">*</span>
      </Label>
      <Select
        value={selectValue}
        onValueChange={onChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full h-10 rounded-[5px] border border-[#ADABAB]">
          <SelectValue
            placeholder={
              isLoading ? 'Loading organizations...' : 'Select organization location...'
            }
          />
        </SelectTrigger>
        <SelectContent>
          {isLoading && (
            <div className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading...
            </div>
          )}
          {locations.map((location) => (
            <SelectItem
              key={location.organization_location_id}
              value={String(location.organization_location_id)}
            >
              {formatLocationLabel(location)}
            </SelectItem>
          ))}
          {!isLoading && locations.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No organization locations found
            </div>
          )}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Pool settings and user allocations apply to the selected location only.
      </p>
    </div>
  )
}
