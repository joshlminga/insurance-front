/**
 * DD/MM/YYYY typing helpers for date-of-birth style inputs.
 * Form storage stays ISO YYYY-MM-DD; display is DD/MM/YYYY.
 */

export type MaskDdMmYyyyOptions = {
  /** When true, do not auto-pad or force trailing slashes (smooth Backspace/Delete). */
  deleting?: boolean
}

/** Strip non-digits and apply smart day/month padding + slashes. */
export function maskDdMmYyyy(
  raw: string,
  options: MaskDdMmYyyyOptions = {}
): string {
  const deleting = options.deleting === true
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  if (!digits) {
    return ''
  }

  // Single day digit: 4–9 auto-pad only while typing forward
  if (digits.length === 1) {
    const d = digits[0]!
    if (!deleting && d >= '4' && d <= '9') {
      return `0${d}/`
    }
    return d
  }

  const day = digits.slice(0, 2)
  const rest = digits.slice(2)

  if (rest.length === 0) {
    // While deleting, leave day without forced trailing slash so Backspace can clear it
    return deleting ? day : `${day}/`
  }

  // Single month digit: 2–9 auto-pad only while typing forward
  if (rest.length === 1) {
    const m = rest[0]!
    if (!deleting && m >= '2' && m <= '9') {
      return `${day}/0${m}/`
    }
    return `${day}/${m}`
  }

  const month = rest.slice(0, 2)
  const year = rest.slice(2, 6)

  if (year.length === 0) {
    return deleting ? `${day}/${month}` : `${day}/${month}/`
  }

  return `${day}/${month}/${year}`
}

/**
 * Map caret to the same digit index after remasking
 * (so Backspace/Delete does not jump to DD or YYYY zones).
 */
export function caretAfterMask(
  previousRaw: string,
  caretInPrevious: number,
  masked: string
): number {
  const digitsBefore = previousRaw.slice(0, caretInPrevious).replace(/\D/g, '').length
  if (digitsBefore <= 0) {
    return 0
  }

  let seen = 0
  for (let i = 0; i < masked.length; i++) {
    if (/\d/.test(masked[i]!)) {
      seen++
      if (seen >= digitsBefore) {
        return i + 1
      }
    }
  }
  return masked.length
}

/** Parse a complete DD/MM/YYYY display string to ISO, or null if invalid. */
export function ddMmYyyyToIso(display: string): string | null {
  const match = display.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) {
    return null
  }

  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null
  }

  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  const mm = String(month).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

/** Convert ISO YYYY-MM-DD to DD/MM/YYYY for display. */
export function isoToDdMmYyyy(iso: string): string {
  const match = String(iso ?? '')
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) {
    return ''
  }
  return `${match[3]}/${match[2]}/${match[1]}`
}
