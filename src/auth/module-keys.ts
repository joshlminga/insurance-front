/** RBAC module keys from the API catalog — use instead of string literals */
export const MODULES = {
  // Quotations
  QUOTATION_MOTOR: 'quotation-motor',
  QUOTATION_MARINE: 'quotation-marine',
  QUOTATION_TRAVEL: 'quotation-travel',

  // Purchases
  PURCHASE_MOTOR: 'purchase-motor',

  // Organization
  ORGANIZATION: 'organization',
  ORGANIZATION_LOCATION: 'organization-location',

  // Products
  PRODUCT_MOTOR: 'product-motor',

  // Users & access control
  USER: 'user',
  ROLE: 'role',
  RBAC: 'rbac',
  SETTINGS_RBAC: 'settings-rbac',

  // Policies
  POLICY: 'policy',

  // Account / finance (when wired to real API pages)
  ACCOUNT: 'account',
} as const

export type ModuleKey = (typeof MODULES)[keyof typeof MODULES]
