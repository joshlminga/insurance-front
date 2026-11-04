import { MODULES } from '@/auth/module-keys'

/** RBAC module keys that imply a product line on the active org location. */
const MODULE_PRODUCT_LINE: Record<string, string> = {
  [MODULES.QUOTATION_MOTOR]: 'Motor',
  [MODULES.QUOTATION_MOTOR_ALTERNATIVE]: 'Motor',
  [MODULES.QUOTATION_TRAVEL]: 'Travel',
  [MODULES.QUOTATION_MARINE]: 'Marine',
  [MODULES.PRODUCT_MOTOR]: 'Motor',
  [MODULES.DMVIC_CERTIFICATE]: 'Motor',
  [MODULES.CLAIMS]: 'Motor',
  [MODULES.REPORT_MOTOR_DASHBOARD]: 'Motor',
  [MODULES.REPORT_MOTOR_QUOTATION]: 'Motor',
  [MODULES.REPORT_MOTOR_INVOICE]: 'Motor',
  [MODULES.REPORT_MOTOR_RECEIPT]: 'Motor',
  [MODULES.REPORT_MOTOR_COVER]: 'Motor',
  [MODULES.REPORT_ORG_MOTOR_VEHICLE]: 'Motor',
  [MODULES.REPORT_ORG_MOTOR_QUOTATION]: 'Motor',
  [MODULES.REPORT_ORG_MOTOR_CERTIFICATE]: 'Motor',
  [MODULES.REPORT_ORG_TRAVEL_QUOTATION]: 'Travel',
}

/**
 * When a nav item is tied to exactly one product line (Motor, Travel, or Marine), return it.
 * Prefer an explicit `productLine` when set (e.g. Travel catalog with no module keys).
 * Parent groups that mix lines return null — children are filtered individually.
 */
export function requiredProductLineForNavItem(item: {
  module?: string
  modules?: string[]
  productLine?: string
}): string | null {
  if (item.productLine) {
    return item.productLine
  }

  const keys = item.modules?.length ? item.modules : item.module ? [item.module] : []
  const lines = keys
    .map((key) => MODULE_PRODUCT_LINE[key])
    .filter((line): line is string => line !== undefined)

  const unique = [...new Set(lines)]
  if (unique.length !== 1) {
    return null
  }

  return unique[0] ?? null
}

/**
 * Org-context product lines from abilities.context.products.
 * When context is missing (platform / bypass), keep RBAC-only behavior.
 */
export function hasOrgProductLineAccess(
  productLine: string,
  contextProducts?: string[],
): boolean {
  if (contextProducts === undefined) {
    return true
  }

  return contextProducts.includes(productLine)
}
