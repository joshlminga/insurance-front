import { EPREFIX, EROUTES } from './enums'

export const PESAPAL_ORDER_TRACKING_ID_KEY = 'pesapal_order_tracking_id'
export const PESAPAL_RETURN_URL_KEY = 'pesapal_return_url'
export const PESAPAL_PAYMENT_RESULT_KEY = 'pesapal_payment_result'
export const PESAPAL_POLL_PENDING_KEY = 'pesapal_poll_pending'

export type PesapalReturnFlow = 'motor' | 'marine' | 'admin'

export type PesapalPaymentResult = 'completed' | 'failed'

export const PESAPAL_RETURN_ROUTE = '/customer/payment/pesapal/return'

export function getPesapalReturnUrl(flow: PesapalReturnFlow): string {
    if (flow === 'admin') {
        return EROUTES.MOTOR_QUOTATION_PURCHASE
    }
    if (flow === 'marine') {
        return `/${EPREFIX.CUSTOMER}${EROUTES.MARINE}`
    }
    return `/${EPREFIX.CUSTOMER}${EROUTES.MOTOR}`
}

export function storePesapalCheckoutSession(
    orderTrackingId: string,
    returnUrl: string,
): void {
    sessionStorage.setItem(PESAPAL_ORDER_TRACKING_ID_KEY, orderTrackingId)
    sessionStorage.setItem(PESAPAL_RETURN_URL_KEY, returnUrl)
}

export function readPesapalPaymentResult(): PesapalPaymentResult | null {
    const value = sessionStorage.getItem(PESAPAL_PAYMENT_RESULT_KEY)
    if (value === 'completed' || value === 'failed') {
        return value
    }
    return null
}

export function clearPesapalSessionKeys(): void {
    sessionStorage.removeItem(PESAPAL_ORDER_TRACKING_ID_KEY)
    sessionStorage.removeItem(PESAPAL_RETURN_URL_KEY)
    sessionStorage.removeItem(PESAPAL_PAYMENT_RESULT_KEY)
    sessionStorage.removeItem(PESAPAL_POLL_PENDING_KEY)
}

export function setPesapalPaymentResult(result: PesapalPaymentResult): void {
    sessionStorage.setItem(PESAPAL_PAYMENT_RESULT_KEY, result)
}
