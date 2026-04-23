/**
 * GET query string for motor premium. Laravel expects array query params as
 * `benefit_ids[]=1&benefit_ids[]=2` so `benefit_ids` validates as an array.
 */
export function serializeMotorPremiumParams(
  params: Record<string, string | number | string[] | number[] | undefined>
): string {
  const parts: string[] = []
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    if (key === 'benefit_ids' && Array.isArray(value)) {
      if (value.length === 0) continue
      for (const id of value) {
        parts.push(
          `${encodeURIComponent('benefit_ids[]')}=${encodeURIComponent(String(id))}`
        )
      }
      continue
    }
    if (Array.isArray(value)) {
      for (const v of value) {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`)
      }
      continue
    }
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
  }
  return parts.join('&')
}
