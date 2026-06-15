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
import { UseAuth } from '@/stores/auth-store'
import type { SubmitResponse } from '@/types/types'
import { EORGANIZATIONTYPES } from '@/utils/constatnts'
import { Loader2 } from 'lucide-react'
import { useMemo } from 'react'
import { motorSelectTriggerClassName } from './motor-field-styles'

export type OrganizationLocationInputVariant = 'onBehalf' | 'agency'

type OrganizationLocationInputProps = {
    variant?: OrganizationLocationInputVariant
    countryId: string
    /** Admin override — only used for onBehalf variant */
    override?: boolean
    value?: string
    onChange?: (value: string) => void
    label?: string
    required?: boolean
    disabled?: boolean
    className?: string
}

const AGENCY_ORGANIZATION_TYPES = [
    EORGANIZATIONTYPES.AGENT,
    EORGANIZATIONTYPES.ORGANIZATION,
] as const

export const OrganizationLocationInput = ({
    variant = 'onBehalf',
    countryId,
    override = false,
    value,
    onChange,
    label,
    required = false,
    disabled = false,
    className,
}: OrganizationLocationInputProps) => {
    const { user } = UseAuth()
    const canFetch = Boolean(countryId)
    const isAgency = variant === 'agency'

    const onBehalfParams = useMemo(() => {
        const params: Record<string, string | number> = {
            country_id: countryId,
            direction: 'asc',
        }
        if (!override && user?.id != null && user.id !== '') {
            params.user_id = user.id
        }
        return params
    }, [countryId, override, user?.id])

    const agencyParams = useMemo(() => {
        const params: Record<string, string | number | string[]> = {
            country_id: countryId,
            direction: 'asc',
            organization_type: [...AGENCY_ORGANIZATION_TYPES],
        }
        if (user?.id != null && user.id !== '') {
            params.user_id = user.id
        }
        return params
    }, [countryId, user?.id])

    const onBehalfQuery = UseApiQuery<SubmitResponse>({
        url: `organization-location?exclude_organization_type=${EORGANIZATIONTYPES.INSURER}`,
        params: onBehalfParams,
        queryOptions: { enabled: canFetch && !isAgency },
    })

    const agencyQuery = UseApiQuery<SubmitResponse>({
        url: 'organization-location',
        params: agencyParams,
        config: { paramsSerializer: serializeOrganizationLocationParams },
        queryOptions: { enabled: canFetch && isAgency },
    })

    const { data, isLoading } = isAgency ? agencyQuery : onBehalfQuery

    const organizations = (data?.data ?? []) as Array<{
        organization_location_id?: number | string
        organization_name?: string
    }>

    const defaultLabel = isAgency ? 'Your Agency' : 'On behalf of'
    const displayLabel = label ?? defaultLabel

    const placeholder = !canFetch
        ? 'Select country first'
        : isLoading
          ? isAgency
              ? 'Loading agencies...'
              : 'Loading organizations...'
          : isAgency
            ? 'Select your agency...'
            : 'Select organization (optional)...'

    const selectValue = value && value !== '' ? value : undefined

    return (
        <div className={`space-y-2 ${className ?? ''}`}>
            {displayLabel && (
                <Label>
                    {displayLabel}
                    {required && (
                        <span className="text-destructive ml-1">*</span>
                    )}
                </Label>
            )}
            <Select
                value={selectValue}
                onValueChange={(next) => onChange?.(next === '__none__' ? '' : next)}
                disabled={disabled || !canFetch || isLoading}
            >
                <SelectTrigger className={motorSelectTriggerClassName}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {isLoading && (
                        <div className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Loading...
                        </div>
                    )}
                    {!required && !isLoading && canFetch && (
                        <SelectItem value="__none__">None</SelectItem>
                    )}
                    {organizations.map((org) => (
                        <SelectItem
                            key={org.organization_location_id}
                            value={String(org.organization_location_id)}
                        >
                            {org.organization_name}
                        </SelectItem>
                    ))}
                    {!isLoading && canFetch && organizations.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                            {isAgency ? 'No agencies found' : 'No organizations found'}
                        </div>
                    )}
                </SelectContent>
            </Select>
        </div>
    )
}
