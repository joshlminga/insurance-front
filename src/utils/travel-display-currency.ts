/**
 * Travel premium amounts arrive already converted to the ATU default currency
 * (usually KES). The sidebar switch only re-displays those base amounts.
 *
 * ATU `rate` is units of default currency per 1 unit of that currency
 * (e.g. USD rate 130 ⇒ 1 USD = 130 KES).
 *
 * display = baseAmount * (defaultRate / selectedRate)
 */

export type TravelDisplayCurrency = {
  code: string
  symbol: string
  rate?: number | string | null
}

export function parseCurrencyRate(rate: number | string | null | undefined): number {
  if (rate === null || rate === undefined || rate === '') return 0
  const n = typeof rate === 'number' ? rate : parseFloat(String(rate))
  return Number.isFinite(n) && n > 0 ? n : 0
}

/**
 * Convert a base (default-currency) amount into the selected display currency.
 * Returns the base amount unchanged when rates are missing/invalid.
 */
export function convertTravelDisplayAmount(
  baseAmount: number | string | null | undefined,
  defaultRate: number | string | null | undefined,
  selectedRate: number | string | null | undefined,
): number {
  const amount =
    typeof baseAmount === 'number' ? baseAmount : parseFloat(String(baseAmount ?? ''))
  if (!Number.isFinite(amount)) return 0

  const from = parseCurrencyRate(defaultRate)
  const to = parseCurrencyRate(selectedRate)
  if (from <= 0 || to <= 0) return amount
  if (from === to) return amount

  return amount * (from / to)
}

/**
 * Format a converted amount with the selected currency symbol (display-only).
 * Uses 2 decimal places for non-default/foreign currencies; whole numbers for KES-style.
 */
export function formatTravelDisplayAmount(
  baseAmount: number | string | null | undefined,
  options: {
    defaultRate: number | string | null | undefined
    selectedRate: number | string | null | undefined
    symbol?: string | null
    code?: string | null
  },
): string {
  const converted = convertTravelDisplayAmount(
    baseAmount,
    options.defaultRate,
    options.selectedRate,
  )

  const code = (options.code ?? '').toUpperCase()
  // KES (default) stays whole; foreign display keeps cents for readability
  const decimals = code === 'KES' || code === 'KSH' ? 0 : 2
  const formatted = new Intl.NumberFormat('en-KE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(converted)

  const symbol = (options.symbol ?? '').trim()
  if (symbol) return `${symbol} ${formatted}`
  if (code) return `${code} ${formatted}`
  return formatted
}

/** Pick default display currency from API envelope; fall back to KES. */
export function resolveDefaultTravelCurrency(
  displayCurrency: TravelDisplayCurrency | null | undefined,
  available: TravelDisplayCurrency[] | null | undefined,
): TravelDisplayCurrency {
  if (displayCurrency?.code) {
    return {
      code: displayCurrency.code,
      symbol: displayCurrency.symbol ?? displayCurrency.code,
      rate: displayCurrency.rate ?? 1,
    }
  }

  const kes = (available ?? []).find(
    (c) => String(c.code).toUpperCase() === 'KES' || String(c.code).toUpperCase() === 'KSH',
  )
  if (kes) {
    return {
      code: kes.code,
      symbol: kes.symbol ?? kes.code,
      rate: kes.rate ?? 1,
    }
  }

  return { code: 'KES', symbol: 'KSh', rate: 1 }
}
