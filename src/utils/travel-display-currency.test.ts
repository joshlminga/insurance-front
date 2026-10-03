import { describe, expect, it } from 'vitest'
import {
  convertTravelDisplayAmount,
  formatTravelDisplayAmount,
  formatTravelExchangeRate,
  parseCurrencyRate,
  resolveDefaultTravelCurrency,
} from './travel-display-currency'

describe('parseCurrencyRate', () => {
  it('parses positive numeric rates', () => {
    expect(parseCurrencyRate(130)).toBe(130)
    expect(parseCurrencyRate('130.5')).toBe(130.5)
  })

  it('returns 0 for missing or invalid rates', () => {
    expect(parseCurrencyRate(null)).toBe(0)
    expect(parseCurrencyRate(undefined)).toBe(0)
    expect(parseCurrencyRate(0)).toBe(0)
    expect(parseCurrencyRate(-5)).toBe(0)
    expect(parseCurrencyRate('abc')).toBe(0)
  })
})

describe('convertTravelDisplayAmount', () => {
  it('converts KES base to USD using defaultRate / selectedRate', () => {
    // 13_000 KES ÷ 130 = 100 USD
    expect(convertTravelDisplayAmount(13000, 1, 130)).toBe(100)
  })

  it('leaves amount unchanged when rates match', () => {
    expect(convertTravelDisplayAmount(5000, 1, 1)).toBe(5000)
  })

  it('leaves amount unchanged when a rate is missing', () => {
    expect(convertTravelDisplayAmount(5000, 1, null)).toBe(5000)
    expect(convertTravelDisplayAmount(5000, null, 130)).toBe(5000)
  })

  it('returns 0 for non-numeric base amounts', () => {
    expect(convertTravelDisplayAmount('oops', 1, 130)).toBe(0)
  })
})

describe('formatTravelDisplayAmount', () => {
  it('prefixes the selected symbol', () => {
    expect(
      formatTravelDisplayAmount(13000, {
        defaultRate: 1,
        selectedRate: 130,
        symbol: '$',
        code: 'USD',
      }),
    ).toBe('$ 100.00')
  })

  it('formats KES without decimals', () => {
    expect(
      formatTravelDisplayAmount(5040, {
        defaultRate: 1,
        selectedRate: 1,
        symbol: 'KSh',
        code: 'KES',
      }),
    ).toBe('KSh 5,040')
  })
})

describe('formatTravelExchangeRate', () => {
  it('shows product→KES when default display is selected', () => {
    expect(
      formatTravelExchangeRate({
        exchangeRate: 130,
        sourceCode: 'USD',
        defaultRate: 1,
        selectedRate: 1,
        selectedCode: 'KES',
      }),
    ).toBe('1 USD = 130 KES')
  })

  it('cross-rates into another selected currency', () => {
    expect(
      formatTravelExchangeRate({
        exchangeRate: 130,
        sourceCode: 'USD',
        defaultRate: 1,
        selectedRate: 148,
        selectedCode: 'EUR',
      }),
    ).toBe('1 USD = 0.8784 EUR')
  })

  it('shows 1:1 when selected currency matches the source', () => {
    expect(
      formatTravelExchangeRate({
        exchangeRate: 130,
        sourceCode: 'USD',
        defaultRate: 1,
        selectedRate: 130,
        selectedCode: 'USD',
      }),
    ).toBe('1 USD = 1 USD')
  })

  it('returns em dash when rates or codes are missing', () => {
    expect(
      formatTravelExchangeRate({
        exchangeRate: null,
        sourceCode: 'USD',
        defaultRate: 1,
        selectedRate: 1,
        selectedCode: 'KES',
      }),
    ).toBe('—')

    expect(
      formatTravelExchangeRate({
        exchangeRate: 130,
        sourceCode: null,
        defaultRate: 1,
        selectedRate: 1,
        selectedCode: 'KES',
      }),
    ).toBe('—')
  })
})

describe('resolveDefaultTravelCurrency', () => {
  it('prefers display_currency from the API', () => {
    expect(
      resolveDefaultTravelCurrency(
        { code: 'KES', symbol: 'KSh', rate: 1 },
        [{ code: 'USD', symbol: '$', rate: 130 }],
      ),
    ).toEqual({ code: 'KES', symbol: 'KSh', rate: 1 })
  })

  it('falls back to KES in available list, then hard KES', () => {
    expect(
      resolveDefaultTravelCurrency(null, [
        { code: 'USD', symbol: '$', rate: 130 },
        { code: 'KES', symbol: 'KSh', rate: 1 },
      ]),
    ).toEqual({ code: 'KES', symbol: 'KSh', rate: 1 })

    expect(resolveDefaultTravelCurrency(null, [])).toEqual({
      code: 'KES',
      symbol: 'KSh',
      rate: 1,
    })
  })
})
