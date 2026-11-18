import { describe, expect, it } from 'vitest'
import {
  refineTravelKycPrincipalSelf,
  TravelKycSchema,
} from '@/types/form-schema'

function makePdfFile(name = 'passport.pdf') {
  return new File(['%PDF'], name, { type: 'application/pdf' })
}

function validTraveler(overrides: Record<string, unknown> = {}) {
  return {
    first_name: 'Jane',
    middle_name: '',
    surname: 'Doe',
    email: 'jane@example.com',
    phone: '0712345678',
    date_of_birth: '1990-01-01',
    nationality: '1',
    passport_number: 'A1234567',
    gender: 'Female',
    relationship: 'Self',
    medical_condition: 'None',
    tax_number: 'A020828302W',
    next_of_kin_name: 'John Doe',
    next_of_kin_phone: '0711111111',
    physical_address: 'Nairobi, Kenya',
    passport_attachment: makePdfFile(),
    tax_certificate: makePdfFile('kra.pdf'),
    ...overrides,
  }
}

describe('TravelKycSchema', () => {
  it('accepts travellers with Cannon KYC enums', () => {
    const result = TravelKycSchema.safeParse({
      travelers: [
        validTraveler(),
        validTraveler({
          first_name: 'John',
          surname: 'Doe',
          relationship: 'Child',
          gender: 'Male',
          passport_number: 'B7654321',
          passport_attachment: makePdfFile('child-passport.pdf'),
        }),
      ],
    })

    expect(result.success).toBe(true)
  })

  it('rejects invalid gender / relationship / medical_condition', () => {
    const result = TravelKycSchema.safeParse({
      travelers: [
        validTraveler({
          gender: 'Other',
          relationship: 'Sibling',
          medical_condition: 'Diabetes',
        }),
      ],
    })

    expect(result.success).toBe(false)
  })

  it('rejects a traveller missing physical_address or passport attachment', () => {
    const result = TravelKycSchema.safeParse({
      travelers: [
        validTraveler({
          physical_address: '',
          passport_attachment: undefined,
        }),
      ],
    })

    expect(result.success).toBe(false)
  })

  it('enforces principal Self for Individual via refineTravelKycPrincipalSelf', () => {
    const schema = refineTravelKycPrincipalSelf(TravelKycSchema, 'Individual')
    const result = schema.safeParse({
      travelers: [validTraveler({ relationship: 'Husband' })],
    })

    expect(result.success).toBe(false)
  })

  it('allows non-Self principal for Family', () => {
    const schema = refineTravelKycPrincipalSelf(TravelKycSchema, 'Family')
    const result = schema.safeParse({
      travelers: [validTraveler({ relationship: 'Husband' })],
    })

    expect(result.success).toBe(true)
  })
})
