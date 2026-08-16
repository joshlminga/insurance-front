import { describe, expect, it } from 'vitest'
import {
  isPaystackStatusFailed,
  isPaystackStatusSuccess,
} from '@/utils/paystack-payment'
import { interpretPaystackStatus, readPaystackSettlementId } from '@/app/payment/payment-status'
import { getPaymentStatusPath } from '@/app/payment/payment-session'
import { EROUTES } from '@/utils/enums'

describe('Paystack status helpers', () => {
  it('treats completed and success as paid', () => {
    expect(isPaystackStatusSuccess('completed')).toBe(true)
    expect(isPaystackStatusSuccess('success')).toBe(true)
    expect(isPaystackStatusSuccess('pending')).toBe(false)
  })

  it('treats abandoned and failed as failed', () => {
    expect(isPaystackStatusFailed('abandoned')).toBe(true)
    expect(isPaystackStatusFailed('failed')).toBe(true)
    expect(isPaystackStatusFailed('pending')).toBe(false)
  })

  it('maps poll payloads the same way the return page does', () => {
    expect(interpretPaystackStatus({ status: 'completed' })).toBe('success')
    expect(interpretPaystackStatus({ status: 'abandoned' })).toBe('failed')
    expect(interpretPaystackStatus({ status: 'pending' })).toBe('unknown')
    expect(interpretPaystackStatus({ data: { status: 'success' } })).toBe('success')
  })
})

describe('Paystack return routes', () => {
  it('uses the payment status pages', () => {
    expect(getPaymentStatusPath('paystack', 'success')).toBe(EROUTES.PAYMENT_PAYSTACK_SUCCESS)
    expect(getPaymentStatusPath('paystack', 'failed')).toBe(EROUTES.PAYMENT_PAYSTACK_FAILED)
    expect(EROUTES.PAYSTACK_RETURN).toBe('/customer/payment/paystack/return')
    expect(EROUTES.PAYMENT_PAYSTACK_RETURN).toBe('/payment/paystack/return')
  })
})

describe('Paystack settlement status', () => {
  it('reads credit_settlement_id from the poll payload', () => {
    expect(readPaystackSettlementId({ credit_settlement_id: 42 })).toBe(42)
    expect(readPaystackSettlementId({ data: { credit_settlement_id: 9 } })).toBe(9)
    expect(readPaystackSettlementId({ invoice_id: 1 })).toBeUndefined()
  })
})
