import { describe, expect, it } from 'vitest'
import { CARD_PROVIDERS } from '@/app/customer/motor/steppers/payment-tabs/card'
import { PaymentDetailsSchema } from '@/types/form-schema'
import { EPAYMENTTABS } from '@/utils/steps-config'

describe('cover payment tabs', () => {
  it('keeps PesaPal under Mastercard/Visa and hides DPO', () => {
    expect(EPAYMENTTABS.map((tab) => tab.value)).toEqual([
      'mpesa',
      'card',
      'paypal',
      'credit',
      'cash',
    ])
    expect(CARD_PROVIDERS.map((provider) => provider.value)).toEqual(['paystack', 'pesapal'])
  })
})

describe('card payment schema', () => {
  it('requires email for Paystack', () => {
    const result = PaymentDetailsSchema.safeParse({
      payment_method: 'card',
      card_provider: 'paystack',
      invoice_id: '12',
      paystack_email: '',
    })
    expect(result.success).toBe(false)
  })

  it('accepts Paystack with email and invoice', () => {
    const result = PaymentDetailsSchema.safeParse({
      payment_method: 'card',
      card_provider: 'paystack',
      invoice_id: '12',
      paystack_email: 'payer@example.com',
    })
    expect(result.success).toBe(true)
  })

  it('requires phone or email for Pesapal on the card tab', () => {
    const missing = PaymentDetailsSchema.safeParse({
      payment_method: 'card',
      card_provider: 'pesapal',
      invoice_id: '12',
      phone_number: '',
      pesapal_email: '',
    })
    expect(missing.success).toBe(false)

    const withEmail = PaymentDetailsSchema.safeParse({
      payment_method: 'card',
      card_provider: 'pesapal',
      invoice_id: '12',
      pesapal_email: 'agent@example.com',
    })
    expect(withEmail.success).toBe(true)

    const withPhone = PaymentDetailsSchema.safeParse({
      payment_method: 'card',
      card_provider: 'pesapal',
      invoice_id: '12',
      phone_number: '0712345678',
    })
    expect(withPhone.success).toBe(true)
  })
})
