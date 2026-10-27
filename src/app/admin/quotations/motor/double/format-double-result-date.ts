/** Month names for DD-Mon-YYYY / DD/Mon/YYYY display. */
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

type DateSeparator = '-' | '/'

function toDisplay(
  day: number,
  monthIndex: number,
  year: number,
  separator: DateSeparator,
): string {
  return `${String(day).padStart(2, '0')}${separator}${MONTHS[monthIndex]}${separator}${year}`
}

/**
 * Parse common API / form date strings into day, monthIndex (0–11), year.
 * Returns null when the value cannot be parsed.
 */
function parseDateParts(
  value?: string | null,
): { day: number; monthIndex: number; year: number } | null {
  if (value == null) {
    return null
  }

  const raw = value.trim()
  if (raw === '') {
    return null
  }

  // Form / API search window: YYYY-MM-DD (optionally with time)
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw)
  if (iso) {
    const year = Number(iso[1])
    const month = Number(iso[2])
    const day = Number(iso[3])
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return { day, monthIndex: month - 1, year }
    }
  }

  // DMVIC style: DD/MM/YYYY or DD/MM/YYYY HH:mm
  const dmy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(raw)
  if (dmy) {
    const day = Number(dmy[1])
    const month = Number(dmy[2])
    const year = Number(dmy[3])
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return { day, monthIndex: month - 1, year }
    }
  }

  return null
}

/**
 * Format a date for Double results as DD-OCT-YYYY (month as uppercase name).
 * Accepts HTML date values (YYYY-MM-DD) and DMVIC expiry strings (DD/MM/YYYY …).
 */
export function formatDoubleResultDate(value?: string | null): string {
  const parts = parseDateParts(value)
  if (!parts) {
    return '-'
  }
  return toDisplay(parts.day, parts.monthIndex, parts.year, '-')
}

/**
 * Same parsing as Double results, but with / separators: DD/OCT/YYYY.
 * Used on the Validate Certificate dialog (Valid From / Valid Till).
 */
export function formatValidateCertificateDate(value?: string | null): string {
  const parts = parseDateParts(value)
  if (!parts) {
    return '-'
  }
  return toDisplay(parts.day, parts.monthIndex, parts.year, '/')
}
