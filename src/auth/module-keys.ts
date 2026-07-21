/** RBAC module keys from the API catalog — use instead of string literals */
export const MODULES = {
  // Quotations
  QUOTATION_MOTOR: 'quotation-motor',
  /** Sales / intermediary motor quotation (API catalog alternative) */
  QUOTATION_MOTOR_ALTERNATIVE: 'quotation-motor-alternative',
  QUOTATION_MARINE: 'quotation-marine',
  QUOTATION_TRAVEL: 'quotation-travel',

  // Purchases
  PURCHASE_MOTOR: 'purchase-motor',
  /** Sales / intermediary KYC purchase step (API catalog alternative) */
  PURCHASE_MOTOR_ALTERNATIVE_KYC: 'purchase-motor-alternative-kyc',

  // Organization
  ORGANIZATION: 'organization',
  ORGANIZATION_LOCATION: 'organization-location',
  ORGANIZATION_LOCATION_USER: 'organization-location-user',

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

/** Standard + alternative keys that unlock the same motor quotation UI */
export const QUOTATION_MOTOR_MODULES = [
  MODULES.QUOTATION_MOTOR,
  MODULES.QUOTATION_MOTOR_ALTERNATIVE,
] as const

/** Standard + alternative keys that unlock motor purchase / policies UI */
export const PURCHASE_MOTOR_MODULES = [
  MODULES.PURCHASE_MOTOR,
  MODULES.PURCHASE_MOTOR_ALTERNATIVE_KYC,
] as const
