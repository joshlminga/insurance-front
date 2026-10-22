import { blankTraveler } from '@/app/customer/travel/steppers/traveller-details'
import type { AdminTravelQuotationFormValues } from '@/types/schema'
import type { TravelQuoteDuplicatePayload } from '@/types/types'

const BOUNDS = ['Inbound', 'Outbound'] as const
const TRAVEL_AS = ['Individual', 'Family', 'Group', 'Student', 'Corporate'] as const
const TRIP_TYPES = ['Single', 'Multi', 'Annual'] as const

function text(value: unknown): string {
    if (value == null) return ''
    return String(value)
}

/** Keep only values the travel form's dropdowns understand. Anything else stays blank. */
function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T | undefined {
    const raw = text(value)
    return (allowed as readonly string[]).includes(raw) ? (raw as T) : undefined
}

function mapTraveler(
    raw: Record<string, unknown>
): AdminTravelQuotationFormValues['travelers'][number] {
    return {
        ...blankTraveler(),
        first_name: text(raw.first_name),
        middle_name: text(raw.middle_name),
        // API trip rows use surname; accept last_name if a payload uses that name
        surname: text(raw.surname || raw.last_name),
        date_of_birth: text(raw.date_of_birth),
        email: text(raw.email),
        phone: text(raw.phone),
        nationality: text(raw.nationality),
    }
}

/**
 * Turn a duplicate payload into values for the existing travel start form.
 * Does not create a second page — the start page calls form.reset() with this.
 * Create-account stays off: a duplicate is a guest unless the source already has a user_id.
 */
export function travelFormValuesFromDuplicate(
    payload: TravelQuoteDuplicatePayload,
    fallbackCountryId = ''
): AdminTravelQuotationFormValues {
    const sq = payload.start_quote
    const fullName = [sq.first_name, sq.last_name].filter(Boolean).join(' ').trim()
    const travelers =
        Array.isArray(sq.travelers) && sq.travelers.length > 0
            ? sq.travelers.map((traveler) => mapTraveler(traveler))
            : [blankTraveler()]

    const quoteCountry =
        sq.country_id != null && text(sq.country_id) !== '' ? text(sq.country_id) : ''

    return {
        full_name: fullName,
        email: text(sq.email),
        phone: text(sq.phone),
        user_id: sq.user_id != null && Number(sq.user_id) > 0 ? String(sq.user_id) : '',
        country_id: quoteCountry || fallbackCountryId,
        agency_id: sq.agency_id != null ? String(sq.agency_id) : '',
        processed_by_organization_id:
            sq.processed_by_organization_id != null
                ? String(sq.processed_by_organization_id)
                : '',
        referral_id: text(sq.referral_id),
        create_customer_account: false,
        bound: oneOf(sq.bound, BOUNDS) as AdminTravelQuotationFormValues['bound'],
        country_of_departure: text(sq.country_of_departure),
        country_of_arrival: text(sq.country_of_arrival),
        travel_as: oneOf(sq.travel_as, TRAVEL_AS) as AdminTravelQuotationFormValues['travel_as'],
        date_of_departure: text(sq.date_of_departure),
        date_of_return: text(sq.date_of_return),
        type_of_trip: oneOf(
            sq.type_of_trip,
            TRIP_TYPES
        ) as AdminTravelQuotationFormValues['type_of_trip'],
        reason_for_travel: text(sq.reason_for_travel),
        travelers,
    }
}
