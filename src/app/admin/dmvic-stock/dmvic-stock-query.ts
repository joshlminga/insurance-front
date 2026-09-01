/** API paths for DMVIC stock inventory and policy-number rules. */

export const DMVIC_STOCK_URLS = {
  list: 'dmvic/stocks',
  create: 'dmvic/stocks',
  show: (id: number | string) => `dmvic/stocks/${id}`,
  update: (id: number | string) => `dmvic/stocks/${id}`,
  status: (id: number | string) => `dmvic/stocks/${id}/status`,
  delete: (id: number | string) => `dmvic/stocks/${id}`,
  policyNumbers: (id: number | string) => `dmvic/stocks/${id}/policy-numbers`,
} as const

export const DMVIC_POLICY_RULE_URLS = {
  list: 'dmvic/policy-number-rules',
  create: 'dmvic/policy-number-rules',
  show: (id: number | string) => `dmvic/policy-number-rules/${id}`,
  update: (id: number | string) => `dmvic/policy-number-rules/${id}`,
  status: (id: number | string) => `dmvic/policy-number-rules/${id}/status`,
} as const

export type DmvicOrganizationLocation = {
  organization_location_id: number
  organization_id?: number | null
  organization_name?: string | null
  location?: { id: number; name: string } | null
}

export type DmvicBrokerStockRow = {
  id: number
  organization_location_id: number
  organization_location?: DmvicOrganizationLocation | null
  product_type?: string | null
  type_of_certificate?: string | null
  stock?: number | null
  live_member_id?: number | null
  demo_member_id?: number | null
  is_active?: boolean
  created_at?: string | null
  updated_at?: string | null
}

/** Human-readable insurer office label from nested organization_location payload. */
export function formatDmvicOrganizationLocation(
  organizationLocation?: DmvicOrganizationLocation | null,
): string {
  if (!organizationLocation) {
    return '-'
  }
  const name = organizationLocation.organization_name ?? 'Unknown organization'
  const country = organizationLocation.location?.name
  return country ? `${name} - ${country}` : name
}

export type DmvicPolicyNumberRuleRow = {
  id: number
  dmvic_stock_id: number
  template: string
  series: string
  sequence_placeholder: string
  stock: number
  sequence_start: string
  sequence_end: string
  sequence_next: string
  maintain_policy_number: boolean
  effective_from: string
  effective_until?: string | null
  is_active: boolean
  created_at?: string | null
  updated_at?: string | null
}

export type DmvicPolicyNumberPreview = {
  rule_id: number
  current_policy_number: string | null
  next_policy_number: string
  cover_policy_number: string
  sequence_start: string
  sequence_end: string
  sequence_next: string
  remaining: number
  is_exhausted: boolean
}

/** True when at least one policy number has been allocated from this rule. */
export function dmvicRuleHasAllocations(rule: DmvicPolicyNumberRuleRow): boolean {
  return rule.sequence_next !== rule.sequence_start
}
