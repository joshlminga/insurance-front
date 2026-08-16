import { EPREFIX, EROUTES } from '@/utils/enums'
import { useStepperStore } from '@/stores/stepper-store'
import type { NavigateFunction } from 'react-router-dom'

/**
 * Which purchase flow started this payment.
 * Like a PHP session flag: we need it later to send the user back to the right receipt.
 */
export type PaymentStatusFlow = 'motor' | 'marine' | 'admin'

export type PaymentMethodKey = 'mpesa' | 'credit' | 'paystack'

export type PaymentOutcome = 'success' | 'failed' | 'pending'

export type PaymentStatusSession = {
    flow: PaymentStatusFlow
    invoiceId?: string
    checkoutRequestId?: string
    reference?: string
}

const PAYMENT_STATUS_SESSION_KEY = 'payment_status_session'
export const ADMIN_MOTOR_PURCHASE_STEP_KEY = 'admin_motor_purchase_step'
export const ADMIN_MOTOR_PURCHASE_PAYMENT_STEP = 3
export const ADMIN_MOTOR_PURCHASE_SUCCESS_STEP = 4

const MOTOR_GUEST_RECEIPT_STEP = 8
const MOTOR_AUTH_RECEIPT_STEP = 6
const MARINE_RECEIPT_STEP = 8

export function storePaymentStatusSession(payload: PaymentStatusSession): void {
    sessionStorage.setItem(PAYMENT_STATUS_SESSION_KEY, JSON.stringify(payload))
}

export function readPaymentStatusSession(): PaymentStatusSession | null {
    const raw = sessionStorage.getItem(PAYMENT_STATUS_SESSION_KEY)
    if (!raw) return null
    try {
        const parsed = JSON.parse(raw) as PaymentStatusSession
        if (parsed?.flow === 'motor' || parsed?.flow === 'marine' || parsed?.flow === 'admin') {
            return parsed
        }
        return null
    } catch {
        return null
    }
}

export function patchPaymentStatusSession(partial: Partial<PaymentStatusSession>): void {
    const current = readPaymentStatusSession()
    storePaymentStatusSession({
        flow: partial.flow ?? current?.flow ?? 'motor',
        invoiceId: partial.invoiceId ?? current?.invoiceId,
        checkoutRequestId: partial.checkoutRequestId ?? current?.checkoutRequestId,
        reference: partial.reference ?? current?.reference,
    })
}

export function getPaymentStatusPath(method: PaymentMethodKey, outcome: PaymentOutcome): string {
    if (method === 'mpesa' && outcome === 'success') return EROUTES.PAYMENT_MPESA_SUCCESS
    if (method === 'mpesa' && outcome === 'failed') return EROUTES.PAYMENT_MPESA_FAILED
    if (method === 'credit' && outcome === 'success') return EROUTES.PAYMENT_CREDIT_SUCCESS
    if (method === 'credit' && outcome === 'pending') return EROUTES.PAYMENT_CREDIT_PENDING
    if (method === 'credit' && outcome === 'failed') return EROUTES.PAYMENT_CREDIT_FAILED
    if (method === 'paystack' && outcome === 'success') return EROUTES.PAYMENT_PAYSTACK_SUCCESS
    return EROUTES.PAYMENT_PAYSTACK_FAILED
}

/** URL of the payment step the user came from (Try again). */
export function getPaymentRetryUrl(flow?: PaymentStatusFlow): string {
    if (flow === 'admin') return EROUTES.MOTOR_QUOTATION_PURCHASE
    if (flow === 'marine') return `/${EPREFIX.CUSTOMER}${EROUTES.MARINE}`
    return `/${EPREFIX.CUSTOMER}${EROUTES.MOTOR}`
}

/**
 * Jump to the existing receipt UI (SuccessPurchase stepper step).
 * This is not a new route — we set the stepper index then go back to the purchase URL.
 */
export function goToReceipt(navigate: NavigateFunction, isAuthenticated: boolean): void {
    const session = readPaymentStatusSession()
    const flow = session?.flow ?? 'motor'

    if (flow === 'admin') {
        sessionStorage.setItem(
            ADMIN_MOTOR_PURCHASE_STEP_KEY,
            String(ADMIN_MOTOR_PURCHASE_SUCCESS_STEP),
        )
        navigate(EROUTES.MOTOR_QUOTATION_PURCHASE)
        return
    }

    if (flow === 'marine') {
        useStepperStore.getState().setStep('marine', MARINE_RECEIPT_STEP)
        navigate(`/${EPREFIX.CUSTOMER}${EROUTES.MARINE}`)
        return
    }

    const receiptStep = isAuthenticated ? MOTOR_AUTH_RECEIPT_STEP : MOTOR_GUEST_RECEIPT_STEP
    useStepperStore.getState().setStep('motor', receiptStep)
    navigate(`/${EPREFIX.CUSTOMER}${EROUTES.MOTOR}`)
}

export function goToPaymentRetry(navigate: NavigateFunction): void {
    const session = readPaymentStatusSession()
    const flow = session?.flow ?? 'motor'
    if (flow === 'admin') {
        sessionStorage.setItem(
            ADMIN_MOTOR_PURCHASE_STEP_KEY,
            String(ADMIN_MOTOR_PURCHASE_PAYMENT_STEP),
        )
    }
    navigate(getPaymentRetryUrl(flow))
}
