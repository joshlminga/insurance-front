import type { AdminTravelQuotationFormValues } from '@/types/schema'
import { buildFullPhone } from '@/app/admin/quotations/motor/customer-lookup-utils'
import { mapFullNameToApiNames } from '@/app/admin/quotations/motor/motor-quotation-payload'

/**
 * POST quotation/travel body.
 * Critical: Travel maps UI labels opposite to Motor —
 * Your Agency → agency_id, On behalf → processed_by_organization_id.
 */
export type TravelQuotationApiPayload = {
    user_id: string | number | null
    first_name?: string
    last_name?: string
    email?: string
    phone?: string
    is_guest?: boolean
    agency_id: string | number | null
    processed_by_organization_id: string | number | null
    referral_id: string | null
    bound: string
    country_of_departure: string
    country_of_arrival: string
    travel_as: string
    date_of_departure: string
    date_of_return: string
    type_of_trip: string
    reason_for_travel: string
    travelers: AdminTravelQuotationFormValues['travelers']
}

type BuildTravelQuotationPayloadInput = {
    data: AdminTravelQuotationFormValues
    dialCode: string
}

/** Your Agency is always required; pass through as Travel agency_id. */
function resolveAgencyId(data: AdminTravelQuotationFormValues): string | null {
    const yourAgency = data.agency_id?.trim() || null
    return yourAgency
}

/** On behalf of is optional; pass through as Travel processed_by_organization_id. */
function resolveProcessedByOrganizationId(
    data: AdminTravelQuotationFormValues
): string | null {
    return data.processed_by_organization_id?.trim() || null
}

function buildTripFields(data: AdminTravelQuotationFormValues) {
    return {
        bound: data.bound,
        country_of_departure: data.country_of_departure,
        country_of_arrival: data.country_of_arrival,
        travel_as: data.travel_as,
        date_of_departure: data.date_of_departure,
        date_of_return: data.date_of_return,
        type_of_trip: data.type_of_trip,
        reason_for_travel: data.reason_for_travel,
        travelers: data.travelers,
        // Travel API: Your Agency → agency_id (not Motor's processed_by_organization_id)
        agency_id: resolveAgencyId(data),
        // Travel API: On behalf → processed_by_organization_id (not Motor's agency_id)
        processed_by_organization_id: resolveProcessedByOrganizationId(data),
        referral_id: data.referral_id?.trim() || null,
    }
}

export function buildTravelQuotationPayload({
    data,
    dialCode,
}: BuildTravelQuotationPayloadInput): TravelQuotationApiPayload {
    const trip = buildTripFields(data)
    const hasExistingCustomer = Boolean(String(data.user_id ?? '').trim())
    // Create-account checkbox → member; otherwise guest (or linked user_id)
    const isGuest = !data.create_customer_account

    if (hasExistingCustomer) {
        return {
            user_id: data.user_id,
            ...trip,
        }
    }

    const { first_name, last_name } = mapFullNameToApiNames(data.full_name ?? '')
    const localPhone = String(data.phone ?? '').replace(/\D/g, '')
    const phone = dialCode
        ? buildFullPhone(dialCode, localPhone) || localPhone
        : localPhone

    return {
        user_id: null,
        first_name,
        ...(last_name ? { last_name } : {}),
        email: String(data.email ?? '').trim() || undefined,
        phone: phone || undefined,
        is_guest: isGuest,
        ...trip,
    }
}
