/** Month names for DD-OCT-YYYY display in Double search results. */
const MONTHS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
] as const

function toDisplay(day: number, monthIndex: number, year: number): string {
  return `${String(day).padStart(2, '0')}-${MONTHS[monthIndex]}-${year}`
}

/**
 * Format a date for Double results as DD-OCT-YYYY (month as uppercase name).
 * Accepts HTML date values (YYYY-MM-DD) and DMVIC expiry strings (DD/MM/YYYY …).
 */
export function formatDoubleResultDate(value?: string | null): string {
  if (value == null) {
    return '-'
  }

  const raw = value.trim()
  if (raw === '') {
    return '-'
  }

  // Form / API search window: YYYY-MM-DD (optionally with time)
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw)
  if (iso) {
    const year = Number(iso[1])
    const month = Number(iso[2])
    const day = Number(iso[3])
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return toDisplay(day, month - 1, year)
    }
  }

  // DMVIC CoverEndDate style: DD/MM/YYYY or DD/MM/YYYY HH:mm
  const dmy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(raw)
  if (dmy) {
    const day = Number(dmy[1])
    const month = Number(dmy[2])
    const year = Number(dmy[3])
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return toDisplay(day, month - 1, year)
    }
  }

  return '-'
}
