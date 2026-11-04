import { describe, expect, it } from 'vitest'
import { CASH_PAYMENT_ENABLED } from '@/utils/constatnts'
import { customerPaymentTabs, EPAYMENTTABS } from '@/utils/steps-config'

describe('payment tabs cash flag', () => {
  it('omits cash from admin and customer lists while CASH_PAYMENT_ENABLED is false', () => {
    expect(CASH_PAYMENT_ENABLED).toBe(false)
    expect(EPAYMENTTABS.some((tab) => tab.value === 'cash')).toBe(false)
    expect(customerPaymentTabs().some((tab) => tab.value === 'cash')).toBe(false)
  })
})
