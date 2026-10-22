import apiClient from '@/lib/api-client'
import type {
    TravelQuoteDuplicatePayload,
    TravelQuoteSessionStartData,
    SubmitResponse,
} from '@/types/types'
import {
    ADMIN_TRAVEL_QUOTE_DUPLICATE_PREFILL_KEY,
    INVOICE_SESSION_STORAGE_KEY,
    PURCHASE_SESSION_STORAGE_KEY,
} from '@/utils/constatnts'
import { EROUTES } from '@/utils/enums'
import { ADMIN_TRAVEL_PURCHASE_STEP_KEY } from '@/app/payment/payment-session'
import {
    clearAdminTravelActiveSession,
    clearAdminTravelDuplicatePrefill,
    persistAdminTravelCustomerContact,
    persistAdminTravelDuplicatePrefill,
    persistAdminTravelQuoteSession,
    persistAdminTravelPurchaseStart,
    persistAdminTravelTripSnapshot,
} from './admin-travel-session'
import { travelFormValuesFromDuplicate } from './travel-duplicate-form'

type AuthUserLike = {
    id?: number | string | null
    email?: string | null
}

/**
 * Build the POST quotation/travel body from a duplicate payload.
 * An existing member (or the logged-in agent quoting themselves) keeps user_id.
 * Everyone else is a guest so we do not create a new member account.
 */
export function buildTravelDuplicateStartQuoteBody(
    payload: TravelQuoteDuplicatePayload,
    authUser?: AuthUserLike | null
): Record<string, unknown> {
    const sq = payload.start_quote
    const sourceUserId =
        sq.user_id != null && Number(sq.user_id) > 0 ? Number(sq.user_id) : null

    const authId =
        authUser?.id != null && Number(authUser.id) > 0 ? Number(authUser.id) : null
    const authEmail = String(authUser?.email ?? '')
        .trim()
        .toLowerCase()
    const quoteEmail = String(sq.email ?? '')
        .trim()
        .toLowerCase()

    const isSelf =
        (authId != null && sourceUserId != null && authId === sourceUserId) ||
        (authId != null && authEmail !== '' && authEmail === quoteEmail)

    const existingUserId = sourceUserId ?? (isSelf ? authId : null)

    return {
        ...sq,
        quote_duplicate: payload.source_quote_session_id,
        user_id: existingUserId,
        is_guest: existingUserId == null,
    }
}

/** Drop leftover purchase/invoice keys so the new quote does not reopen the old checkout. */
function clearTravelPurchaseProgress(): void {
    if (typeof window === 'undefined') return
    sessionStorage.removeItem(PURCHASE_SESSION_STORAGE_KEY)
    sessionStorage.removeItem(INVOICE_SESSION_STORAGE_KEY)
    sessionStorage.removeItem(ADMIN_TRAVEL_PURCHASE_STEP_KEY)
}

/**
 * After duplicate (or duplicate-cancel) returns a payload, continue at the chosen stage.
 *
 * - quote    → clear the active session and open the existing travel form (no second page)
 * - rates    → POST quotation/travel, then results
 * - kyc      → start session, POST purchase/travel/{id}, open purchase on KYC
 * - payment  → same as kyc. The new purchase has no invoice yet, so step 3 would
 *              bounce back to results. We always open KYC (step 1).
 */
export async function continueAdminTravelDuplicateFlow(
    payload: TravelQuoteDuplicatePayload,
    authUser?: AuthUserLike | null
): Promise<{ route: string; startAt: string; quoteSessionId?: number }> {
    if (!payload?.start_quote) {
        throw new Error('Duplicate payload was empty')
    }

    const startAt = payload.start_at

    if (startAt === 'quote') {
        // Form page reads the payload from sessionStorage and prefills itself.
        clearAdminTravelActiveSession()
        persistAdminTravelDuplicatePrefill(payload)
        return { route: EROUTES.TRAVELQUOTATIONS, startAt }
    }

    persistAdminTravelDuplicatePrefill(payload)
    clearTravelPurchaseProgress()

    const sq = payload.start_quote
    const fullName = [sq.first_name, sq.last_name].filter(Boolean).join(' ').trim()
    if (sq.email || sq.first_name || sq.phone) {
        persistAdminTravelCustomerContact({
            name: fullName || undefined,
            email: sq.email || undefined,
            phone: sq.phone || undefined,
        })
    }

    // KYC reads travelers from this key. Rates/KYC never pass through the start form.
    const formValues = travelFormValuesFromDuplicate(payload)
    persistAdminTravelTripSnapshot({
        bound: formValues.bound,
        country_of_departure: formValues.country_of_departure,
        country_of_arrival: formValues.country_of_arrival,
        travel_as: formValues.travel_as,
        date_of_departure: formValues.date_of_departure,
        date_of_return: formValues.date_of_return,
        type_of_trip: formValues.type_of_trip,
        reason_for_travel: formValues.reason_for_travel,
        travelers: formValues.travelers,
    })

    const startResponse = await apiClient.post<SubmitResponse>(
        'quotation/travel',
        buildTravelDuplicateStartQuoteBody(payload, authUser)
    )
    const session = startResponse.data?.data as TravelQuoteSessionStartData | undefined
    const quoteSessionId = Number(session?.id)
    if (!Number.isFinite(quoteSessionId) || quoteSessionId <= 0) {
        throw new Error('Quote session could not be initialized for duplicate.')
    }

    persistAdminTravelQuoteSession({
        ...session,
        id: quoteSessionId,
    })

    if (startAt === 'rates') {
        // Keep the source id so the later cover purchase can send quote_duplicate.
        // Drop the form JSON so the start page does not treat this as a quote-stage review.
        sessionStorage.removeItem(ADMIN_TRAVEL_QUOTE_DUPLICATE_PREFILL_KEY)
        return {
            route: EROUTES.TRAVEL_QUOTATION_RESULTS,
            startAt,
            quoteSessionId,
        }
    }

    const productId = payload.rates?.product_id
    const rateId = payload.rates?.rate_id
    if (productId == null || rateId == null) {
        sessionStorage.removeItem(ADMIN_TRAVEL_QUOTE_DUPLICATE_PREFILL_KEY)
        return {
            route: EROUTES.TRAVEL_QUOTATION_RESULTS,
            startAt,
            quoteSessionId,
        }
    }

    const purchaseResponse = await apiClient.post<SubmitResponse>(
        `purchase/travel/${quoteSessionId}`,
        {
            product_id: productId,
            rate_id: rateId,
            quote_duplicate: payload.source_quote_session_id,
        }
    )
    const purchaseData = purchaseResponse.data?.data as
        | { purchase_id?: number | string }
        | undefined
    const purchaseId = purchaseData?.purchase_id
    if (purchaseId === undefined || purchaseId === null) {
        throw new Error('Purchase could not be started for duplicate.')
    }

    // Step 1 is KYC. Payment (step 3) needs an invoice this new purchase does not have yet.
    persistAdminTravelPurchaseStart(purchaseId)
    clearAdminTravelDuplicatePrefill()

    const effectiveStartAt = startAt === 'payment' ? 'kyc' : startAt

    return {
        route: EROUTES.TRAVEL_QUOTATION_PURCHASE,
        startAt: effectiveStartAt,
        quoteSessionId,
    }
}
