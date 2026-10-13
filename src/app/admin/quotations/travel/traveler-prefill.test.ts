import { describe, expect, it } from 'vitest'
import { travelerFromCustomerSearch } from './traveler-prefill'
import type { CustomerSearchUser } from '@/app/admin/quotations/motor/customer-lookup-utils'

describe('travelerFromCustomerSearch', () => {
  it('prefills first_name, surname, email, phone from user/search hit', () => {
    const user: CustomerSearchUser = {
      id: 42,
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+254712345678',
      meta: [
        { key: 'first_name', value: 'Jane' },
        { key: 'last_name', value: 'Doe' },
      ],
    }

    const traveler = travelerFromCustomerSearch(user, '+254')

    expect(traveler.first_name).toBe('Jane')
    expect(traveler.surname).toBe('Doe')
    expect(traveler.email).toBe('jane@example.com')
    expect(traveler.phone).toBe('712345678')
    expect(traveler.date_of_birth).toBe('')
    expect(traveler.nationality).toBe('')
  })

  it('splits full name when meta first/last are missing', () => {
    const user: CustomerSearchUser = {
      id: 7,
      name: 'John Quincy Adams',
      email: 'john@example.com',
    }

    const traveler = travelerFromCustomerSearch(user)

    expect(traveler.first_name).toBe('John')
    expect(traveler.surname).toBe('Quincy Adams')
    expect(traveler.email).toBe('john@example.com')
  })
})
