import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { UseApiQuery } from '@/hooks/hooks'
import { UseAuth } from '@/stores/auth-store'
import type { SubmitResponse } from '@/types/types'
import { EORGANIZATIONTYPES } from '@/utils/constatnts'
import { Loader2 } from 'lucide-react'
import { useMemo } from 'react'

type OrganizationLocationInputProps = {
    countryId: string
    override: boolean
    value?: string
    onChange?: (value: string) => void
    label?: string
    required?: boolean
    disabled?: boolean
    className?: string
}

export const OrganizationLocationInput = ({
    countryId,
    override,
    value,
    onChange,
    label = 'Organization',
    required = false,
    disabled = false,
    className,
}: OrganizationLocationInputProps) => {
    const { user } = UseAuth()
    const canFetch = Boolean(countryId)

    const queryParams = useMemo(() => {
        const params: Record<string, string | number> = {
            country_id: countryId,
            direction: 'asc',
        }

        if (!override && user?.id != null && user.id !== '') {
            params.user_id = user.id
        }

        return params
    }, [countryId, override, user?.id])

    const { data, isLoading } = UseApiQuery<SubmitResponse>({
        url: `organization-location?exclude_organization_type=${EORGANIZATIONTYPES.INSURER}`,
        params: queryParams,
        queryOptions: { enabled: canFetch },
    })

    const organizations = (data?.data ?? []) as Array<{
        organization_location_id?: number | string
        organization_name?: string
    }>

    return (
        <div className={`space-y-2 ${className ?? ''}`}>
            {label && (
                <Label>
                    {label}
                    {required && (
                        <span className="text-destructive ml-1">*</span>
                    )}
                </Label>
            )}
            <Select
                value={value}
                onValueChange={onChange}
                disabled={disabled || !canFetch || isLoading}
            >
                <SelectTrigger className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]">
                    <SelectValue
                        placeholder={
                            !canFetch
                                ? 'Select country first'
                                : isLoading
                                  ? 'Loading organizations...'
                                  : 'Select organization...'
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
                            No organizations found
                        </div>
                    )}
                </SelectContent>
            </Select>
        </div>
    )
}
