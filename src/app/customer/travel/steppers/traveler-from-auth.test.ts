import { describe, expect, it } from 'vitest'
import { travelerFromAuthUser } from './traveller-details'

describe('travelerFromAuthUser', () => {
  it('splits a full name into first_name and surname', () => {
    const traveler = travelerFromAuthUser({
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '0712345678',
    })

    expect(traveler).toEqual({
      first_name: 'Jane',
      middle_name: '',
      surname: 'Doe',
      date_of_birth: '',
      email: 'jane@example.com',
      phone: '0712345678',
      nationality: '',
    })
  })

  it('keeps a single-token name as first_name only', () => {
    const traveler = travelerFromAuthUser({
      name: 'Madonna',
      email: 'madonna@example.com',
      phone: '0799999999',
    })

    expect(traveler.first_name).toBe('Madonna')
    expect(traveler.surname).toBe('')
    expect(traveler.email).toBe('madonna@example.com')
  })

  it('uses empty phone when auth phone is missing', () => {
    const traveler = travelerFromAuthUser({
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: null,
    })

    expect(traveler.phone).toBe('')
    expect(traveler.first_name).toBe('Jane')
    expect(traveler.surname).toBe('Doe')
  })

  it('returns a blank traveler when user is missing', () => {
    expect(travelerFromAuthUser(null)).toEqual({
      first_name: '',
      middle_name: '',
      surname: '',
      date_of_birth: '',
      email: '',
      phone: '',
      nationality: '',
    })
  })
})
