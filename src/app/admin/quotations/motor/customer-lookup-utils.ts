import apiClient from '@/lib/api-client'
import type { SubmitResponse } from '@/types/types'
import { z } from 'zod'

export type CustomerMetaItem = {
    key?: string
    value?: string | number
}

export type CustomerSearchUser = {
    id?: number | string
    name?: string
    email?: string
    phone?: string
    meta?: CustomerMetaItem[]
}

/** Map user meta key/value pairs (e.g. first_name from API meta array). */
export function parseMeta(meta?: CustomerMetaItem[]): Record<string, string> {
    const map: Record<string, string> = {}
    for (const item of meta ?? []) {
        if (item?.key) {
            map[item.key] = String(item.value ?? '')
        }
    }
    return map
}

/** Prefer meta first/last name; otherwise use the API `name` field as full name. */
export function resolveFullName(data: CustomerSearchUser): string {
    const meta = parseMeta(data.meta)
    const first = meta.first_name?.trim() ?? ''
    const last = meta.last_name?.trim() ?? ''
    if (first || last) {
        return [first, last].filter(Boolean).join(' ')
    }
    return String(data.name ?? '').trim()
}

/**
 * National trunk prefix: strip leading zeros from local digits (e.g. 0712… → 712).
 */
export function normalizeLocalPhoneDigits(localDigits: string): string {
    const digits = String(localDigits ?? '').replace(/\D/g, '')
    const withoutLeadingZeros = digits.replace(/^0+/, '')
    return withoutLeadingZeros || digits
}

/**
 * Strip country dial code from an API phone value so AdminPhoneInput keeps local digits only.
 * Works for any dial code length (+254, +1, +44, …). Does not treat local numbers that merely
 * start with the same digit as the country code as international (avoids +1 false positives).
 */
export function stripDialCode(phone: string, dialCode: string): string {
    const normalized = String(phone ?? '').trim()
    if (!normalized) return ''

    const dialDigits = dialCode.replace(/\D/g, '')
    if (!dialDigits) {
        return normalizeLocalPhoneDigits(normalized)
    }

    const dialWithPlus = dialCode.trim().startsWith('+')
        ? dialCode.trim()
        : `+${dialDigits}`

    const explicitPrefixes = [dialWithPlus, `+${dialDigits}`, `00${dialDigits}`]
    for (const prefix of explicitPrefixes) {
        if (normalized.startsWith(prefix)) {
            const remainder = normalized
                .slice(prefix.length)
                .replace(/^[\s\-().]+/, '')
            return normalizeLocalPhoneDigits(remainder)
        }
    }

    if (normalized.startsWith('+') || normalized.startsWith('00')) {
        const allDigits = normalized.replace(/\D/g, '')
        if (
            allDigits.startsWith(dialDigits) &&
            allDigits.length > dialDigits.length + 4
        ) {
            return normalizeLocalPhoneDigits(allDigits.slice(dialDigits.length))
        }
    }

    return normalizeLocalPhoneDigits(normalized.replace(/\D/g, ''))
}

/** Build E.164-style phone for user/search?phone=... */
export function buildFullPhone(dialCode: string, localDigits: string): string {
    const dialDigits = dialCode.replace(/\D/g, '')
    const local = normalizeLocalPhoneDigits(localDigits)
    if (!dialDigits || !local) return ''
    return `+${dialDigits}${local}`
}

export function isValidEmail(email: string): boolean {
    return z.string().email().safeParse(email.trim()).success
}

export async function searchCustomer(params: {
    email?: string
    phone?: string
}): Promise<SubmitResponse> {
    const response = await apiClient.get<SubmitResponse>('user/search', { params })
    return response.data
}

export function isCustomerFound(data: unknown): data is CustomerSearchUser {
    const user = data as CustomerSearchUser | null | undefined
    return user?.id != null && user.id !== ''
}

/** True when the searched customer is the same person as the logged-in user. */
export function isSelfCoverLookup(
    customerId: number | string | undefined,
    authUserId: number | string | undefined | null
): boolean {
    if (customerId == null || customerId === '' || authUserId == null) {
        return false
    }
    return String(customerId) === String(authUserId)
}
