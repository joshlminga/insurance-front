import { describe, expect, it } from 'vitest'
import { TravelKycSchema } from '@/types/form-schema'

function makePdfFile(name = 'passport.pdf') {
  return new File(['%PDF'], name, { type: 'application/pdf' })
}

describe('TravelKycSchema', () => {
  it('accepts N travellers with required passport + physical_address', () => {
    const result = TravelKycSchema.safeParse({
      travelers: [
        {
          first_name: 'Jane',
          middle_name: '',
          surname: 'Doe',
          email: 'jane@example.com',
          phone: '',
          date_of_birth: '1990-01-01',
          nationality: '1',
          passport_number: 'A1234567',
          tax_number: '',
          physical_address: 'Nairobi, Kenya',
          passport_attachment: makePdfFile(),
          tax_certificate: undefined,
        },
        {
          first_name: 'John',
          middle_name: 'K',
          surname: 'Doe',
          email: 'jane@example.com',
          phone: '0712345678',
          date_of_birth: '2015-06-15',
          nationality: '1',
          passport_number: 'B7654321',
          tax_number: '',
          physical_address: 'Nairobi, Kenya',
          passport_attachment: makePdfFile('child-passport.pdf'),
        },
      ],
    })

    expect(result.success).toBe(true)
  })

  it('rejects a traveller missing physical_address or passport attachment', () => {
    const result = TravelKycSchema.safeParse({
      travelers: [
        {
          first_name: 'Jane',
          surname: 'Doe',
          email: 'jane@example.com',
          date_of_birth: '1990-01-01',
          nationality: '1',
          passport_number: 'A1234567',
          physical_address: '',
        },
      ],
    })

    expect(result.success).toBe(false)
  })
})
