/**
 * GET query string for organization-location. Laravel expects array query params as
 * `organization_type[]=Agent&organization_type[]=Organization`.
 */
export function serializeOrganizationLocationParams(
  params: Record<string, string | number | string[] | number[] | undefined>
): string {
  const parts: string[] = []
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    if (key === 'organization_type' && Array.isArray(value)) {
      if (value.length === 0) continue
      for (const type of value) {
        parts.push(
          `${encodeURIComponent('organization_type[]')}=${encodeURIComponent(String(type))}`
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
