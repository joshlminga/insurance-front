import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import type { OfficeUseLocationOption } from '@/app/admin/quotations/office-use-access'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { motorSelectTriggerClassName } from './motor-field-styles'

export type OrganizationLocationInputVariant = 'onBehalf' | 'agency'

type OrganizationLocationInputProps = {
    variant?: OrganizationLocationInputVariant
    countryId: string
    value?: string
    onChange?: (value: string) => void
    /** Options from GET quotation/office-use (agency or on_behalf). */
    options?: OfficeUseLocationOption[]
    optionsLoading?: boolean
    /** When this location is in the list and nothing is selected yet, select it. */
    preferredLocationId?: string
    label?: string
    required?: boolean
    disabled?: boolean
    className?: string
}

export const OrganizationLocationInput = ({
    variant = 'onBehalf',
    countryId,
    value,
    onChange,
    options = [],
    optionsLoading = false,
    preferredLocationId,
    label,
    required = false,
    disabled = false,
    className,
}: OrganizationLocationInputProps) => {
    const canFetch = Boolean(countryId)
    const isAgency = variant === 'agency'
    const isLoading = optionsLoading

    // Auto-pick the session location when the list loads and nothing is chosen yet.
    useEffect(() => {
        if (!isAgency || isLoading || !preferredLocationId || value) return
        const match = options.some(
            (org) => String(org.organization_location_id) === preferredLocationId
        )
        if (match) onChange?.(preferredLocationId)
    }, [isAgency, isLoading, options, preferredLocationId, value, onChange])

    // Locked agency with exactly one option: keep it selected.
    useEffect(() => {
        if (!isAgency || isLoading || value || options.length !== 1) return
        onChange?.(String(options[0].organization_location_id))
    }, [isAgency, isLoading, options, value, onChange])

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
                    {options.map((org) => (
                        <SelectItem
                            key={org.organization_location_id}
                            value={String(org.organization_location_id)}
                        >
                            {org.organization_name}
                        </SelectItem>
                    ))}
                    {!isLoading && canFetch && options.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                            {isAgency ? 'No agencies found' : 'No organizations found'}
                        </div>
                    )}
                </SelectContent>
            </Select>
        </div>
    )
}
