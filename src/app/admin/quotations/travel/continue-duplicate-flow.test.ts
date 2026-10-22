import { beforeEach, describe, expect, it, vi } from 'vitest'
import apiClient from '@/lib/api-client'
import { ADMIN_TRAVEL_PURCHASE_STEP_KEY } from '@/app/payment/payment-session'
import {
    ADMIN_TRAVEL_QUOTE_DUPLICATE_PREFILL_KEY,
    ADMIN_TRAVEL_QUOTE_DUPLICATE_SOURCE_KEY,
    PURCHASE_SESSION_STORAGE_KEY,
} from '@/utils/constatnts'
import { EROUTES } from '@/utils/enums'
import { TRAVEL_QUOTE_SESSION_STORAGE_KEY } from '@/utils/travel-enums'
import type { TravelQuoteDuplicatePayload } from '@/types/types'
import { continueAdminTravelDuplicateFlow } from './continue-duplicate-flow'

vi.mock('@/lib/api-client', () => ({
    default: {
        post: vi.fn(),
    },
}))

function payload(
    startAt: TravelQuoteDuplicatePayload['start_at'],
    extras: Partial<TravelQuoteDuplicatePayload> = {}
): TravelQuoteDuplicatePayload {
    return {
        source_quote_session_id: 15,
        start_at: startAt,
        last_ended_stage: startAt === 'quote' ? 'rates' : startAt,
        start_quote: {
            first_name: 'Jane',
            last_name: 'Doe',
            email: 'jane@example.com',
            user_id: 9,
            is_guest: false,
            bound: 'Outbound',
            country_of_departure: 1,
            country_of_arrival: 2,
            travel_as: 'Individual',
            date_of_departure: '2099-06-01',
            date_of_return: '2099-06-10',
            type_of_trip: 'Single',
            reason_for_travel: 10,
            travelers: [{ first_name: 'Jane', surname: 'Doe' }],
        },
        ...extras,
    }
}

describe('continueAdminTravelDuplicateFlow', () => {
    beforeEach(() => {
        sessionStorage.clear()
        vi.mocked(apiClient.post).mockReset()
    })

    it('opens the existing travel form for quote and does not start a session yet', async () => {
        sessionStorage.setItem(TRAVEL_QUOTE_SESSION_STORAGE_KEY, '99')

        const result = await continueAdminTravelDuplicateFlow(payload('quote'))

        expect(result).toEqual({
            route: EROUTES.TRAVELQUOTATIONS,
            startAt: 'quote',
        })
        expect(apiClient.post).not.toHaveBeenCalled()
        expect(sessionStorage.getItem(TRAVEL_QUOTE_SESSION_STORAGE_KEY)).toBeNull()

        const saved = JSON.parse(
            sessionStorage.getItem(ADMIN_TRAVEL_QUOTE_DUPLICATE_PREFILL_KEY) ?? '{}'
        )
        expect(saved.source_quote_session_id).toBe(15)
        expect(saved.start_at).toBe('quote')
    })

    it('starts a new session and routes to results for rates', async () => {
        vi.mocked(apiClient.post).mockResolvedValue({
            data: { data: { id: 40, customer_type: 'member', customer_id: 9, is_guest: false } },
        })

        const result = await continueAdminTravelDuplicateFlow(payload('rates'), {
            id: 9,
            email: 'jane@example.com',
        })

        expect(apiClient.post).toHaveBeenCalledTimes(1)
        expect(apiClient.post).toHaveBeenCalledWith(
            'quotation/travel',
            expect.objectContaining({
                quote_duplicate: 15,
                user_id: 9,
                is_guest: false,
                bound: 'Outbound',
            })
        )
        expect(result).toEqual({
            route: EROUTES.TRAVEL_QUOTATION_RESULTS,
            startAt: 'rates',
            quoteSessionId: 40,
        })
        expect(sessionStorage.getItem(TRAVEL_QUOTE_SESSION_STORAGE_KEY)).toBe('40')
        // Source id stays so the cover the agent picks later can send quote_duplicate
        expect(sessionStorage.getItem(ADMIN_TRAVEL_QUOTE_DUPLICATE_SOURCE_KEY)).toBe('15')
        expect(sessionStorage.getItem(ADMIN_TRAVEL_QUOTE_DUPLICATE_PREFILL_KEY)).toBeNull()
    })

    it('starts a session and purchase, then opens KYC', async () => {
        vi.mocked(apiClient.post)
            .mockResolvedValueOnce({
                data: { data: { id: 41 } },
            })
            .mockResolvedValueOnce({
                data: { data: { purchase_id: 500 } },
            })

        const result = await continueAdminTravelDuplicateFlow(
            payload('kyc', { rates: { product_id: 3, rate_id: 8 } })
        )

        expect(apiClient.post).toHaveBeenNthCalledWith(
            2,
            'purchase/travel/41',
            {
                product_id: 3,
                rate_id: 8,
                quote_duplicate: 15,
            }
        )
        expect(result).toEqual({
            route: EROUTES.TRAVEL_QUOTATION_PURCHASE,
            startAt: 'kyc',
            quoteSessionId: 41,
        })
        expect(sessionStorage.getItem(PURCHASE_SESSION_STORAGE_KEY)).toBe('500')
        expect(sessionStorage.getItem(ADMIN_TRAVEL_PURCHASE_STEP_KEY)).toBe('1')
    })

    it('downgrades payment to KYC because the new purchase has no invoice', async () => {
        vi.mocked(apiClient.post)
            .mockResolvedValueOnce({
                data: { data: { id: 42 } },
            })
            .mockResolvedValueOnce({
                data: { data: { purchase_id: 501 } },
            })

        const result = await continueAdminTravelDuplicateFlow(
            payload('payment', {
                rates: { product_id: 4, rate_id: 9 },
                payment: { invoice_meta: { total: 100 }, invoices: [{ id: 1 }] },
            })
        )

        expect(result.startAt).toBe('kyc')
        expect(result.route).toBe(EROUTES.TRAVEL_QUOTATION_PURCHASE)
        expect(result.quoteSessionId).toBe(42)
        // Step 3 is payment. Purchase page sends that back to results when no invoice exists.
        expect(sessionStorage.getItem(ADMIN_TRAVEL_PURCHASE_STEP_KEY)).toBe('1')
        expect(apiClient.post).toHaveBeenCalledTimes(2)
    })

    it('falls back to results when kyc has no selected cover', async () => {
        vi.mocked(apiClient.post).mockResolvedValue({
            data: { data: { id: 43 } },
        })

        const result = await continueAdminTravelDuplicateFlow(payload('kyc'))

        expect(apiClient.post).toHaveBeenCalledTimes(1)
        expect(result.route).toBe(EROUTES.TRAVEL_QUOTATION_RESULTS)
        expect(result.startAt).toBe('kyc')
    })
})
