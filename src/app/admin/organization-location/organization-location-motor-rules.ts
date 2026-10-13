/** Motor benefit rules helpers for organization location products. */

export type OrganizationLocationMotorRuleRow = {
  id?: number
  product_id: string
  benefit_id: string
  allow_unselect: boolean
}

export const DEFAULT_MOTOR_RULE_ROW: OrganizationLocationMotorRuleRow = {
  product_id: "",
  benefit_id: "",
  allow_unselect: false,
}

export type ApiMotorRule = {
  id?: number
  product_id?: number
  benefit_id?: number
  allow_unselect?: boolean
}

/** Hydrate rule rows from location.products[].motor_rules. */
export function mapApiMotorRulesToRows(
  rules: ApiMotorRule[] | null | undefined
): OrganizationLocationMotorRuleRow[] {
  const list = rules ?? []
  if (!list.length) {
    return []
  }

  return list.map((rule) => ({
    id: rule.id,
    product_id: rule.product_id != null ? String(rule.product_id) : "",
    benefit_id: rule.benefit_id != null ? String(rule.benefit_id) : "",
    allow_unselect: Boolean(rule.allow_unselect),
  }))
}

/** Find the Motor organization_location_product row id from API products. */
export function findMotorLocationProductId(
  products:
    | Array<{ id?: number; product?: string }>
    | null
    | undefined
): number | null {
  const motor = (products ?? []).find(
    (row) => String(row.product ?? "").toLowerCase() === "motor" && row.id != null
  )
  return motor?.id != null ? Number(motor.id) : null
}

export function buildMotorRulesSyncPayload(
  rows: OrganizationLocationMotorRuleRow[]
): Array<{ product_id: number; benefit_id: number; allow_unselect: boolean }> {
  return rows
    .map((row) => {
      const productId = Number(row.product_id)
      const benefitId = Number(row.benefit_id)
      if (!Number.isFinite(productId) || productId <= 0) return null
      if (!Number.isFinite(benefitId) || benefitId <= 0) return null
      return {
        product_id: productId,
        benefit_id: benefitId,
        allow_unselect: Boolean(row.allow_unselect),
      }
    })
    .filter(
      (
        row
      ): row is {
        product_id: number
        benefit_id: number
        allow_unselect: boolean
      } => row !== null
    )
}
