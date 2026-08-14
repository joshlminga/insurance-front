import { describe, expect, it } from 'vitest'
import type { AdminMotorQuotationFormValues } from '@/types/schema'
import { buildMotorQuotationPayload } from './motor-quotation-payload'

const baseFormValues = {
    full_name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '712345678',
    user_id: '',
    country_id: '44',
    processed_by_organization_id: '12',
    agency_id: '',
    referral_id: '',
    covertype_id: '1',
    covering_id: '2',
    ownership: 'Personal Owned',
    vehicle_class_id: '3',
    used_for_id: '4',
    registration_number: '',
    vehicle_registration_number: 'KAA123A',
    vehicle_value: '1000000',
    valued_by_professional: false,
    create_customer_account: false,
} satisfies AdminMotorQuotationFormValues

describe('buildMotorQuotationPayload', () => {
    it('maps guest contact with is_guest true by default', () => {
        const payload = buildMotorQuotationPayload({
            data: baseFormValues,
            profileCountryId: null,
            dialCode: '+254',
        })

        expect(payload.is_guest).toBe(true)
        expect(payload.agency_id).toBeNull()
        expect(payload.first_name).toBe('Jane')
    })

    it('falls back agency_id to processed_by_organization_id when creating member account', () => {
        const payload = buildMotorQuotationPayload({
            data: {
                ...baseFormValues,
                create_customer_account: true,
            },
            profileCountryId: null,
            dialCode: '+254',
        })

        expect(payload.is_guest).toBe(false)
        expect(payload.agency_id).toBe('12')
        expect(payload.processed_by_organization_id).toBe('12')
    })

    it('prefers on-behalf agency_id over processed_by_organization_id', () => {
        const payload = buildMotorQuotationPayload({
            data: {
                ...baseFormValues,
                create_customer_account: true,
                agency_id: '99',
            },
            profileCountryId: null,
            dialCode: '+254',
        })

        expect(payload.agency_id).toBe('99')
    })
})
