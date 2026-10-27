import { describe, expect, it } from 'vitest'
import {
  formatDoubleResultDate,
  formatValidateCertificateDate,
} from './format-double-result-date'

describe('formatDoubleResultDate', () => {
  it('formats ISO and DMVIC dates as DD-Mon-YYYY', () => {
    expect(formatDoubleResultDate('2026-10-05')).toBe('05-OCT-2026')
    expect(formatDoubleResultDate('01/01/2027 23:59')).toBe('01-JAN-2027')
    expect(formatDoubleResultDate('')).toBe('-')
  })
})

describe('formatValidateCertificateDate', () => {
  it('formats the same inputs as DD/Mon/YYYY for the Verify dialog', () => {
    expect(formatValidateCertificateDate('2026-10-05')).toBe('05/OCT/2026')
    expect(formatValidateCertificateDate('15/03/2026')).toBe('15/MAR/2026')
    expect(formatValidateCertificateDate(null)).toBe('-')
  })
})
