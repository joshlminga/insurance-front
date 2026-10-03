/** Policy schedule unlock delay after payment (matches API 5-minute gate). */
export const TRAVEL_POLICY_SCHEDULE_READY_MS = 5 * 60 * 1000

const PAID_AT_SESSION_PREFIX = 'travel_paid_at_'

/**
 * Remember when the user reached the travel success page for this purchase.
 * Survives refresh so the 5-minute wait does not reset.
 */
export function rememberTravelPaidAt(purchaseId: string, nowMs: number = Date.now()): number {
  if (typeof window === 'undefined' || !purchaseId) {
    return nowMs
  }

  const key = `${PAID_AT_SESSION_PREFIX}${purchaseId}`
  const existing = sessionStorage.getItem(key)
  if (existing) {
    const parsed = Number(existing)
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed
    }
  }

  sessionStorage.setItem(key, String(nowMs))
  return nowMs
}

/** Prefer API paid_at when present; otherwise use remembered client timestamp. */
export function resolveTravelPaidAtMs(
  purchaseId: string,
  summaryPaidAt?: string | null,
  nowMs: number = Date.now(),
): number {
  if (summaryPaidAt) {
    const fromApi = Date.parse(summaryPaidAt)
    if (Number.isFinite(fromApi)) {
      if (typeof window !== 'undefined' && purchaseId) {
        sessionStorage.setItem(`${PAID_AT_SESSION_PREFIX}${purchaseId}`, String(fromApi))
      }
      return fromApi
    }
  }

  return rememberTravelPaidAt(purchaseId, nowMs)
}

export function isTravelPolicyScheduleReady(
  paidAtMs: number,
  nowMs: number = Date.now(),
): boolean {
  return nowMs >= paidAtMs + TRAVEL_POLICY_SCHEDULE_READY_MS
}

export function travelPolicyScheduleReadyInMs(
  paidAtMs: number,
  nowMs: number = Date.now(),
): number {
  return Math.max(0, paidAtMs + TRAVEL_POLICY_SCHEDULE_READY_MS - nowMs)
}

/** Format remaining wait as "Xm Ys" for the policy schedule card. */
export function formatTravelPolicyScheduleWait(remainingMs: number): string {
  const totalSeconds = Math.ceil(remainingMs / 1000)
  if (totalSeconds <= 0) {
    return 'Ready to download'
  }

  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes <= 0) {
    return `Ready in ${seconds}s`
  }
  return `Ready in ${minutes}m ${seconds}s`
}

/**
 * Axios blob responses turn 422 JSON into a Blob — parse message when possible.
 */
export async function extractTravelDocumentErrorMessage(error: unknown): Promise<string> {
  const data = (error as { response?: { data?: unknown } })?.response?.data

  if (typeof Blob !== 'undefined' && data instanceof Blob) {
    try {
      const text = await data.text()
      const parsed = JSON.parse(text) as {
        message?: string | string[]
        errors?: Record<string, string[] | string>
      }

      if (parsed?.errors && typeof parsed.errors === 'object') {
        const joined = Object.values(parsed.errors)
          .flat()
          .filter(Boolean)
          .join('\n')
        if (joined) {
          return joined
        }
      }
      if (Array.isArray(parsed?.message)) {
        return parsed.message.join('\n')
      }
      if (typeof parsed?.message === 'string' && parsed.message.trim() !== '') {
        return parsed.message
      }
    } catch {
      // fall through
    }
  }

  const response = (error as { response?: { data?: { message?: string | string[] } } })
    ?.response?.data
  if (Array.isArray(response?.message)) {
    return response.message.join('\n')
  }
  if (typeof response?.message === 'string') {
    return response.message
  }

  return (error as { message?: string })?.message || 'Download failed!'
}
