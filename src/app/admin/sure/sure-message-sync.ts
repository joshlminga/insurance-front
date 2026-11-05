/** Shared Sure chat message sync helpers (HTTP paint + history merge). */

export type SureChatRole = 'user' | 'assistant'

/** One calculated premium card from get_motor_premium (mirrors Quote results). */
export type SurePremiumOffer = {
  rate_id?: number | string | null
  insurer?: string | null
  insurer_logo?: string | null
  covertype?: string | null
  currency?: string | null
  /** Quote results "Basic Premium" = vehicle_premium */
  vehicle_premium?: number | null
  basic_premium?: number | null
  total_duty?: number | null
  total_premium?: number | null
  benefit_rows?: Array<{
    id: number
    name: string
    text: string
    status: string
  }>
  benefits_optional?: Array<{
    benefit_id?: number | null
    name: string
    premium?: number | null
  }>
}

export type SurePremiumOffersPayload = {
  quote_code?: string | null
  offers: SurePremiumOffer[]
  pagination?: {
    page?: number
    per_page?: number
    total?: number
    last_page?: number
    has_more?: boolean
  } | null
}

export type SureChatMessage = {
  id: string
  role: SureChatRole
  text: string
  attachments?: string[]
  feedback?: 'up' | 'down' | null
  /** Live premium cards from the message response (not persisted in chat history). */
  offers?: SurePremiumOffersPayload | null
}

export type SureApiMessageRow = {
  id: string
  role: SureChatRole
  text: string
  attachments?: string[] | null
  /** Restored from assistant message meta when chat history reloads. */
  offers?: SurePremiumOffersPayload | null
  feedback?: 'up' | 'down' | null
}

const EMPTY_ASSISTANT =
  'Sure could not generate a reply. Please try again.'

/**
 * Merge incoming messages into prev by id.
 * Later entries win for text / feedback / attachments.
 * Order: keep prev order, then append any new ids in `next` order.
 */
export function upsertMessages(
  prev: SureChatMessage[],
  next: SureChatMessage[]
): SureChatMessage[] {
  if (next.length === 0) {
    return prev
  }

  const byId = new Map<string, SureChatMessage>()
  for (const message of prev) {
    byId.set(message.id, message)
  }
  for (const message of next) {
    const existing = byId.get(message.id)
    byId.set(
      message.id,
      existing
        ? {
            ...existing,
            ...message,
            // Prefer non-empty text from whichever side has it
            text: message.text.trim() ? message.text : existing.text,
            attachments: message.attachments ?? existing.attachments,
            feedback:
              message.feedback !== undefined
                ? message.feedback
                : existing.feedback,
            // History reload has no offers — keep cards from the live POST
            offers:
              message.offers !== undefined && message.offers !== null
                ? message.offers
                : existing.offers,
          }
        : message
    )
  }

  const seen = new Set<string>()
  const merged: SureChatMessage[] = []

  for (const message of prev) {
    const updated = byId.get(message.id)
    if (updated && !seen.has(message.id)) {
      merged.push(updated)
      seen.add(message.id)
    }
  }
  for (const message of next) {
    if (!seen.has(message.id)) {
      const updated = byId.get(message.id)
      if (updated) {
        merged.push(updated)
        seen.add(message.id)
      }
    }
  }

  return merged
}

/** Map API chat-show rows into UI messages (empty assistant gets a fallback). */
export function mapApiMessages(rows: SureApiMessageRow[]): SureChatMessage[] {
  return rows.map((message) => ({
    id: message.id,
    role: message.role,
    text:
      message.text?.trim() ||
      (message.role === 'assistant' ? EMPTY_ASSISTANT : ''),
    attachments: message.attachments?.length
      ? message.attachments
      : undefined,
    // History reload restores carousel cards from persisted premium_offers meta
    offers: message.offers ?? null,
    feedback: message.feedback ?? null,
  }))
}

export { EMPTY_ASSISTANT }
