import { UseApiQuery } from '@/hooks/hooks'
import type { SubmitResponse } from '@/types/types'
import { useMemo } from 'react'

/** One organization location row from GET quotation/office-use */
export type OfficeUseLocationOption = {
    organization_location_id: number
    organization_id?: number
    organization_name?: string | null
    organization_type?: string | null
    country_id?: number
    is_default?: boolean
    is_active?: boolean
}

export type QuotationOfficeUseData = {
    session: {
        organization_id: number | null
        organization_location_id: number | null
        country_id: number | null
        is_default: boolean
    }
    country: {
        locked: boolean
        country_id: number | null
    }
    agency: {
        locked: boolean
        options: OfficeUseLocationOption[]
    }
    on_behalf: {
        locked: boolean
        scope: 'none' | 'same_organization' | 'country' | string
        options: OfficeUseLocationOption[]
    }
    admin_override: boolean
}

type UseQuotationOfficeUseAccessArgs = {
    countryId: string
    adminOverride?: boolean
    enabled?: boolean
}

/**
 * Loads locked flags + agency / on-behalf lists for the Office use card.
 * The API decides from session location + quotation.multi.* permissions.
 */
export function useQuotationOfficeUseAccess({
    countryId,
    adminOverride = false,
    enabled = true,
}: UseQuotationOfficeUseAccessArgs) {
    const params = useMemo(() => {
        const next: Record<string, string | number | boolean> = {}
        if (countryId) {
            next.country_id = countryId
        }
        if (adminOverride) {
            next.admin_override = true
        }
        return next
    }, [countryId, adminOverride])

    const query = UseApiQuery<SubmitResponse>({
        url: 'quotation/office-use',
        params,
        queryOptions: {
            // Country may be empty on first paint; the API still returns session defaults.
            enabled,
        },
    })

    const officeUse = (query.data?.data ?? null) as QuotationOfficeUseData | null

    return {
        officeUse,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isError: query.isError,
        refetch: query.refetch,
        countryLocked: officeUse?.country.locked ?? true,
        agencyLocked: officeUse?.agency.locked ?? true,
        onBehalfLocked: officeUse?.on_behalf.locked ?? true,
        canAdminOverride: officeUse?.admin_override ?? false,
        sessionCountryId:
            officeUse?.session.country_id != null
                ? String(officeUse.session.country_id)
                : '',
        sessionLocationId:
            officeUse?.session.organization_location_id != null
                ? String(officeUse.session.organization_location_id)
                : '',
        agencyOptions: officeUse?.agency.options ?? [],
        onBehalfOptions: officeUse?.on_behalf.options ?? [],
        lockedCountryId:
            officeUse?.country.country_id != null
                ? String(officeUse.country.country_id)
                : '',
    }
}
