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

export type MotorQuotationApiPayload = {
    country_id: string | null
    valued_by_professional: boolean
    vehicle_registration_number: string
    covertype_id: string
    covering_id: string
    ownership: string
    vehicle_value: string
    vehicle_class_id: string
    used_for_id: string
    organization_id: string | null
    agent_id: string
    user_id?: string | number
    first_name?: string
    last_name?: string
    email?: string
    phone?: string
    is_guest?: boolean
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

    const base: MotorQuotationApiPayload = {
        country_id,
        valued_by_professional: resolveValuedByProfessional(data),
        vehicle_registration_number: data.vehicle_registration_number ?? '',
        covertype_id: data.covertype_id,
        covering_id: data.covering_id,
        ownership: data.ownership,
        vehicle_value: data.vehicle_value ?? '',
        vehicle_class_id: data.vehicle_class_id,
        used_for_id: data.used_for_id,
        organization_id: data.organization_id?.trim() || null,
        agent_id: data.agency_id,
    }

    const hasExistingCustomer = Boolean(String(data.user_id ?? '').trim())
    if (hasExistingCustomer) {
        return { ...base, user_id: data.user_id }
    }

    const { first_name, last_name } = mapFullNameToApiNames(data.full_name)
    const localPhone = String(data.phone ?? '').replace(/\D/g, '')
    const phone = dialCode
        ? buildFullPhone(dialCode, localPhone) || localPhone
        : localPhone

    return {
        ...base,
        first_name,
        ...(last_name ? { last_name } : {}),
        email: String(data.email ?? '').trim(),
        phone,
        is_guest: !data.create_customer_account,
    }
}
