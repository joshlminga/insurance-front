import type {
    CreditSchedule,
    CreditScheduleStatus,
    MpesaPollResponse,
    PaystackPollResponse,
    SubmitResponse,
} from '@/types/types'
import type { PaymentOutcome } from '@/app/payment/payment-session'

export type PaymentCheckOutcome = PaymentOutcome | 'unknown'

type MpesaStatusPayload = {
    status?: string
    ResultCode?: number
}

function nestedPayload<T extends object>(response: T & { data?: T }): T {
    return (response.data ?? response) as T
}

/** Same success/fail rules the payment step uses when polling M-Pesa. */
export function interpretMpesaStatus(response: MpesaPollResponse | undefined): PaymentCheckOutcome {
    if (!response) return 'unknown'
    const payload = nestedPayload<MpesaStatusPayload>(response)
    const statusRaw = payload.status?.toLowerCase()
    const resultCode = payload.ResultCode

    if (
        statusRaw === 'completed' ||
        statusRaw === 'success' ||
        statusRaw === 'successful' ||
        resultCode === 0
    ) {
        return 'success'
    }

    if (
        statusRaw === 'failed' ||
        statusRaw === 'cancelled' ||
        statusRaw === 'canceled' ||
        statusRaw === 'error' ||
        (typeof resultCode === 'number' && resultCode !== 0)
    ) {
        return 'failed'
    }

    return 'unknown'
}

export function interpretPaystackStatus(response: PaystackPollResponse | undefined): PaymentCheckOutcome {
    if (!response) return 'unknown'
    const payload = nestedPayload<{ status?: string }>(response)
    const statusRaw = payload.status?.toLowerCase()

    if (statusRaw === 'success' || statusRaw === 'successful' || statusRaw === 'completed') {
        return 'success'
    }

    if (
        statusRaw === 'failed' ||
        statusRaw === 'cancelled' ||
        statusRaw === 'canceled' ||
        statusRaw === 'abandoned' ||
        statusRaw === 'error'
    ) {
        return 'failed'
    }

    return 'unknown'
}

/** Settlement Paystack status payloads include this id; invoice checkouts do not. */
export function readPaystackSettlementId(response: PaystackPollResponse | undefined): number | undefined {
    if (!response) return undefined
    const payload = nestedPayload<{ credit_settlement_id?: number | null }>(response)
    const raw = payload.credit_settlement_id ?? response.credit_settlement_id
    if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) {
        return raw
    }
    return undefined
}

export function readCreditSchedule(payload: SubmitResponse | undefined): CreditSchedule | undefined {
    const data = payload?.data
    if (!data || Array.isArray(data) || typeof data !== 'object') return undefined
    return data as CreditSchedule
}

export function interpretCreditScheduleStatus(
    status: CreditScheduleStatus | undefined,
): PaymentCheckOutcome {
    if (status === 'completed') return 'success'
    if (status === 'pending_approval' || status === 'awaiting_cover_update') return 'pending'
    if (status === 'cancelled') return 'failed'
    return 'unknown'
}
