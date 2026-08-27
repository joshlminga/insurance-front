import { describe, expect, it } from 'vitest'
import { AddVehicleSchema } from '@/types/form-schema'

/** Minimal valid payload — optional fields left blank. */
const requiredOnly = {
  registration_number: 'KAA123A',
  make: 'Toyota',
  model: 'Vitz',
  manufacture_year: '2016',
  body_type: 'S.WAGON',
  color: '',
  number_of_passengers: '',
  tonnage: '970',
  engine_number: '',
  cubic_capacity: '',
  chassis_number: 'KSP130-2164151',
}

describe('AddVehicleSchema', () => {
  it('accepts required core fields with blank optional fields', () => {
    const result = AddVehicleSchema.safeParse(requiredOnly)
    expect(result.success).toBe(true)
  })

  it('accepts when optional fields are filled', () => {
    const result = AddVehicleSchema.safeParse({
      ...requiredOnly,
      color: 'Blue',
      number_of_passengers: '5',
      engine_number: '1KR-1603484',
      cubic_capacity: '990',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing chassis number', () => {
    const result = AddVehicleSchema.safeParse({
      ...requiredOnly,
      chassis_number: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('chassis_number'))).toBe(true)
    }
  })

  it('rejects missing tonnage', () => {
    const result = AddVehicleSchema.safeParse({
      ...requiredOnly,
      tonnage: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('tonnage'))).toBe(true)
    }
  })
})
