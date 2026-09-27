import { describe, expect, it } from 'vitest'
import {
  caretAfterMask,
  ddMmYyyyToIso,
  isoToDdMmYyyy,
  maskDdMmYyyy,
} from '@/utils/dd-mm-yyyy'

describe('maskDdMmYyyy', () => {
  it('pads single day digit 4–9 with slash', () => {
    expect(maskDdMmYyyy('7')).toBe('07/')
  })

  it('waits for second day digit when first is 0–3', () => {
    expect(maskDdMmYyyy('1')).toBe('1')
  })

  it('formats two-digit day with slash', () => {
    expect(maskDdMmYyyy('17')).toBe('17/')
  })

  it('pads single month digit 2–9', () => {
    expect(maskDdMmYyyy('0703')).toBe('07/03/')
    expect(maskDdMmYyyy('073')).toBe('07/03/')
  })

  it('formats full date digits', () => {
    expect(maskDdMmYyyy('07031990')).toBe('07/03/1990')
  })

  it('does not re-force slash or pad while deleting', () => {
    expect(maskDdMmYyyy('07', { deleting: true })).toBe('07')
    expect(maskDdMmYyyy('7', { deleting: true })).toBe('7')
    expect(maskDdMmYyyy('0703', { deleting: true })).toBe('07/03')
    expect(maskDdMmYyyy('0703199', { deleting: true })).toBe('07/03/199')
  })
})

describe('caretAfterMask', () => {
  it('keeps caret after the same digit count', () => {
    // Digits before caret in "07/03" at end of month → 4 digits → after "07/03"
    expect(caretAfterMask('07/03', 5, '07/03')).toBe(5)
    expect(caretAfterMask('0703199', 7, '07/03/199')).toBe(9)
  })
})

describe('ddMmYyyyToIso', () => {
  it('converts a valid complete display date', () => {
    expect(ddMmYyyyToIso('07/03/1990')).toBe('1990-03-07')
  })

  it('returns null for incomplete display', () => {
    expect(ddMmYyyyToIso('07/03')).toBeNull()
  })

  it('returns null for invalid calendar date', () => {
    expect(ddMmYyyyToIso('31/02/2000')).toBeNull()
  })
})

describe('isoToDdMmYyyy', () => {
  it('converts ISO to display', () => {
    expect(isoToDdMmYyyy('1990-03-07')).toBe('07/03/1990')
  })

  it('returns empty for invalid iso', () => {
    expect(isoToDdMmYyyy('')).toBe('')
    expect(isoToDdMmYyyy('not-a-date')).toBe('')
  })
})
