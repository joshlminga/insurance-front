import { MODULES } from '@/auth/module-keys'

/** RBAC module keys that imply a product line on the active org location. */
const MODULE_PRODUCT_LINE: Record<string, string> = {
  [MODULES.QUOTATION_MOTOR]: 'Motor',
  [MODULES.QUOTATION_MOTOR_ALTERNATIVE]: 'Motor',
  [MODULES.QUOTATION_TRAVEL]: 'Travel',
}

/**
 * When a nav item is tied to exactly one product line (Motor or Travel), return it.
 * Parent groups that mix lines return null — children are filtered individually.
 */
export function requiredProductLineForNavItem(item: {
  module?: string
  modules?: string[]
}): string | null {
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
