import type { AdminMotorQuotationFormValues } from '@/types/schema'
import { buildFullPhone } from './customer-lookup-utils'

/** Map UI full name to API first_name / last_name. Single word → first_name only. */
export function mapFullNameToApiNames(fullName: string): {
    first_name: string
    last_name?: string
} {
    const trimmed = fullName.trim()
    const parts = trimmed.split(/\s+/).filter(Boolean)
    if (parts.length === 0) return { first_name: '' }
    if (parts.length === 1) return { first_name: parts[0] }
    return {
        first_name: parts[0],
        last_name: parts.slice(1).join(' '),
    }
}

/** Keys ordered to match auto/quotation/motor Swagger contract. */
export type MotorQuotationApiPayload = {
    user_id: string | number | null
    country_id: string | null
    first_name?: string
    last_name?: string
    email?: string
    phone?: string
    is_guest?: boolean
    vehicle_class_id: string
    covertype_id: string
    covering_id: string
    ownership: string
    vehicle_registration_number: string
    vehicle_value: string
    used_for_id: string
    valued_by_professional: boolean
    processed_by_organization_id: string
    agency_id: string | null
    referral_id: string | null
}

function resolveValuedByProfessional(data: AdminMotorQuotationFormValues): boolean {
    return (
        data.valued_by_professional === true ||
        String(data.valued_by_professional).toLowerCase() === 'true'
    )
}

type BuildMotorQuotationPayloadInput = {
    data: AdminMotorQuotationFormValues
    profileCountryId: string | number | null | undefined
    dialCode: string
}

function resolveAgencyId(
    data: AdminMotorQuotationFormValues,
    isGuest: boolean
): string | null {
    const onBehalfAgencyId = data.agency_id?.trim() || null
    if (onBehalfAgencyId) {
        return onBehalfAgencyId
    }

    if (!isGuest) {
        return data.processed_by_organization_id?.trim() || null
    }

    return null
}

function buildSharedVehicleAndOfficeFields(
    data: AdminMotorQuotationFormValues,
    isGuest: boolean
): Pick<
    MotorQuotationApiPayload,
    | 'vehicle_class_id'
    | 'covertype_id'
    | 'covering_id'
    | 'ownership'
    | 'vehicle_registration_number'
    | 'vehicle_value'
    | 'used_for_id'
    | 'valued_by_professional'
    | 'processed_by_organization_id'
    | 'agency_id'
    | 'referral_id'
> {
    return {
        vehicle_class_id: data.vehicle_class_id,
        covertype_id: data.covertype_id,
        covering_id: data.covering_id,
        ownership: data.ownership,
        vehicle_registration_number: data.vehicle_registration_number ?? '',
        vehicle_value: data.vehicle_value ?? '',
        used_for_id: data.used_for_id,
        valued_by_professional: resolveValuedByProfessional(data),
        processed_by_organization_id: data.processed_by_organization_id,
        agency_id: resolveAgencyId(data, isGuest),
        referral_id: data.referral_id?.trim() || null,
    }
}

export function buildMotorQuotationPayload({
    data,
    profileCountryId,
    dialCode,
}: BuildMotorQuotationPayloadInput): MotorQuotationApiPayload {
    const country_id =
        data.country_id?.trim() ||
        (profileCountryId != null && profileCountryId !== ''
            ? String(profileCountryId)
            : null)

    const hasExistingCustomer = Boolean(String(data.user_id ?? '').trim())
    const isGuest = !data.create_customer_account
    const vehicleAndOffice = buildSharedVehicleAndOfficeFields(data, isGuest)

    if (hasExistingCustomer) {
        return {
            user_id: data.user_id,
            country_id,
            vehicle_class_id: vehicleAndOffice.vehicle_class_id,
            covertype_id: vehicleAndOffice.covertype_id,
            covering_id: vehicleAndOffice.covering_id,
            ownership: vehicleAndOffice.ownership,
            vehicle_registration_number: vehicleAndOffice.vehicle_registration_number,
            vehicle_value: vehicleAndOffice.vehicle_value,
            used_for_id: vehicleAndOffice.used_for_id,
            valued_by_professional: vehicleAndOffice.valued_by_professional,
            processed_by_organization_id: vehicleAndOffice.processed_by_organization_id,
            agency_id: vehicleAndOffice.agency_id,
            referral_id: vehicleAndOffice.referral_id,
        }
    }

    const { first_name, last_name } = mapFullNameToApiNames(data.full_name)
    const localPhone = String(data.phone ?? '').replace(/\D/g, '')
    const phone = dialCode
        ? buildFullPhone(dialCode, localPhone) || localPhone
        : localPhone

    return {
        user_id: null,
        country_id,
        first_name,
        ...(last_name ? { last_name } : {}),
        email: String(data.email ?? '').trim(),
        phone,
        is_guest: isGuest,
        vehicle_class_id: vehicleAndOffice.vehicle_class_id,
        covertype_id: vehicleAndOffice.covertype_id,
        covering_id: vehicleAndOffice.covering_id,
        ownership: vehicleAndOffice.ownership,
        vehicle_registration_number: vehicleAndOffice.vehicle_registration_number,
        vehicle_value: vehicleAndOffice.vehicle_value,
        used_for_id: vehicleAndOffice.used_for_id,
        valued_by_professional: vehicleAndOffice.valued_by_professional,
        processed_by_organization_id: vehicleAndOffice.processed_by_organization_id,
        agency_id: vehicleAndOffice.agency_id,
        referral_id: vehicleAndOffice.referral_id,
    }
}
