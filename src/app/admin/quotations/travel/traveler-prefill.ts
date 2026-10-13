import type { TravelQuotationFormValues } from '@/types/schema'
import {
    parseMeta,
    resolveFullName,
    stripDialCode,
    type CustomerSearchUser,
} from '@/app/admin/quotations/motor/customer-lookup-utils'

export type TravelerRow = TravelQuotationFormValues['travelers'][number]

function blankTravelerRow(): TravelerRow {
    return {
        first_name: '',
        middle_name: '',
        surname: '',
        date_of_birth: '',
        email: '',
        phone: '',
        nationality: '',
    }
}

/**
 * Map a user/search hit into traveler[0] fields.
 * Keeps DOB / nationality blank — agent still fills those on the trip form.
 */
export function travelerFromCustomerSearch(
    user: CustomerSearchUser,
    dialCode = ''
): TravelerRow {
    const meta = parseMeta(user.meta)
    const fullName = resolveFullName(user)
    const spaceIdx = fullName.indexOf(' ')

    // Prefer meta first/last when present; otherwise split full name on first space
    const first_name =
        meta.first_name?.trim() ||
        (spaceIdx === -1 ? fullName : fullName.slice(0, spaceIdx))
    const surname =
        meta.last_name?.trim() ||
        (spaceIdx === -1 ? '' : fullName.slice(spaceIdx + 1).trim())

    const rawPhone = String(user.phone ?? meta.phone ?? '')
    const phone = dialCode ? stripDialCode(rawPhone, dialCode) : rawPhone

    return {
        ...blankTravelerRow(),
        first_name,
        surname,
        email: String(user.email ?? '').trim(),
        phone,
    }
}
