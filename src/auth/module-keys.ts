/** RBAC module keys from the API catalog — use instead of string literals */
export const MODULES = {
  QUOTATION_MOTOR: 'quotation-motor',
  QUOTATION_MARINE: 'quotation-marine',
  QUOTATION_TRAVEL: 'quotation-travel',
  ORGANIZATION: 'organization',
  ORGANIZATION_LOCATION: 'organization-location',
  PRODUCT_MOTOR: 'product-motor',
  USER: 'user',
} as const

export type ModuleKey = (typeof MODULES)[keyof typeof MODULES]
