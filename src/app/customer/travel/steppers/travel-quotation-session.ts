import { TRAVEL_QUOTATION_FORM_SESSION_KEY } from '@/utils/travel-enums'

/**
 * Read the progressive travel quotation form saved in sessionStorage.
 * Returns null when missing or invalid JSON.
 */
export function readTravelQuotationFormSession(): Record<string, unknown> | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = sessionStorage.getItem(TRAVEL_QUOTATION_FORM_SESSION_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null
    }

    return parsed as Record<string, unknown>
  } catch {
    return null
  }
}

/** Trip departure date (YYYY-MM-DD) from quotation session, or empty string. */
export function readTravelDepartureDateFromSession(): string {
  const form = readTravelQuotationFormSession()
  const value = form?.date_of_departure
  return typeof value === 'string' ? value.trim() : ''
}
