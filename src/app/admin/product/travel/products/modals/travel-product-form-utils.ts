import type { TravelProductFormValues } from "@/types/schema"
import { TRAVEL_BOUND, type TravelBoundValue } from "@/utils/travel-enums"

export type TravelProductPayload = {
  organization_location_id: number
  name: string
  officename: string | null
  levy_applied: boolean
  for_public: boolean
  currency: number | null
  start_date: string | null
  expiry_date: string | null
  organization_location_ids: number[]
  /** bound_type mirrors App\Enums\Ace\TravelBound (Inbound | Outbound) */
  coverages: Array<{ coverage_id: number; bound_type: TravelBoundValue }>
  has_rules: boolean
  quotation_api: boolean
  policy_api: boolean
  payment_api: boolean
  certificate_api: boolean
}

export type TravelProductSelectLabels = {
  insurer?: { value: string; label: string }
  currency?: { value: string; label: string }
  targets: Record<string, string>
  coverages: Record<string, string>
}

const emptyCoverage = (): TravelProductFormValues["coverages"][number] => ({
  coverage_id: "",
  bound_type: TRAVEL_BOUND.Outbound,
})

/** Normalize API bound strings to the TravelBound enum; unknown values fall back to Outbound. */
const toBoundType = (value: unknown): TravelBoundValue => {
  if (value === TRAVEL_BOUND.Inbound || value === TRAVEL_BOUND.Outbound) {
    return value
  }
  return TRAVEL_BOUND.Outbound
}

/** Yes/No radios store "true" / "false". Anything else is treated as No. */
export const toYesNo = (value: unknown): "true" | "false" => {
  if (value === true || value === "true" || value === 1 || value === "1") {
    return "true"
  }
  return "false"
}

/** HTML date inputs only accept YYYY-MM-DD. The API may send a full datetime. */
export const toDateInputValue = (value: unknown): string => {
  if (typeof value !== "string") return ""
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/)
  return match ? match[1] : ""
}

const yesNoToBoolean = (value: "true" | "false"): boolean => value === "true"

export const emptyTravelProductFormValues = (): TravelProductFormValues => ({
  organization_location_id: "",
  name: "",
  officename: "",
  levy_applied: "false",
  for_public: "false",
  currency: "",
  start_date: "",
  expiry_date: "",
  // No target rows by default. Private products may stay with none.
  organization_location_ids: [],
  coverages: [emptyCoverage()],
  has_rules: "false",
  quotation_api: "false",
  policy_api: "false",
  payment_api: "false",
  certificate_api: "false",
})

export const mapTravelProductToFormValues = (
  product: Record<string, unknown>
): TravelProductFormValues => {
  const currency = product.currency
  const currencyId =
    currency && typeof currency === "object"
      ? (currency as { id?: unknown }).id
      : currency

  const targets = Array.isArray(product.targets) ? product.targets : []
  const targetRows = targets
    .map((target) => {
      const row = target as Record<string, unknown>
      const id = row.organization_location_id
      return id != null && String(id).trim() !== ""
        ? { organization_location_id: String(id) }
        : null
    })
    .filter((row): row is { organization_location_id: string } => row !== null)

  const coverages = Array.isArray(product.coverages) ? product.coverages : []
  const coverageRows = coverages
    .map((item) => {
      const row = item as Record<string, unknown>
      return {
        coverage_id: row.coverage_id != null ? String(row.coverage_id) : "",
        bound_type: toBoundType(row.bound_type),
      }
    })
    .filter((row) => row.coverage_id !== "")

  return {
    organization_location_id:
      product.organization_location_id != null
        ? String(product.organization_location_id)
        : "",
    name: String(product.name ?? ""),
    officename: String(product.officename ?? ""),
    levy_applied: toYesNo(product.levy_applied),
    for_public: toYesNo(product.for_public),
    currency:
      currencyId != null && String(currencyId).trim() !== ""
        ? String(currencyId)
        : "",
    start_date: toDateInputValue(product.start_date),
    expiry_date: toDateInputValue(product.expiry_date),
    organization_location_ids: targetRows,
    coverages: coverageRows.length ? coverageRows : [emptyCoverage()],
    has_rules: toYesNo(product.has_rules),
    quotation_api: toYesNo(product.quotation_api),
    policy_api: toYesNo(product.policy_api),
    payment_api: toYesNo(product.payment_api),
    certificate_api: toYesNo(product.certificate_api),
  }
}

export const getTravelProductSelectLabels = (
  product: Record<string, unknown>
): TravelProductSelectLabels => {
  const baseLocation = (product.base_location ?? {}) as Record<string, unknown>
  const organization = (product.organization ?? {}) as Record<string, unknown>
  const insurerId = product.organization_location_id
  const insurerLabel = String(
    baseLocation.organization_name ?? organization.name ?? ""
  )

  const currency = (product.currency ?? {}) as Record<string, unknown>
  const currencyLabel = [currency.code, currency.name].filter(Boolean).join(" - ")

  const targets: Record<string, string> = {}
  if (Array.isArray(product.targets)) {
    product.targets.forEach((target) => {
      const row = target as Record<string, unknown>
      const id = row.organization_location_id
      if (id == null) return
      targets[String(id)] = String(
        row.targeted_organization_name ?? row.organization_name ?? ""
      )
    })
  }

  const coverages: Record<string, string> = {}
  if (Array.isArray(product.coverages)) {
    product.coverages.forEach((item) => {
      const row = item as Record<string, unknown>
      if (row.coverage_id == null) return
      coverages[String(row.coverage_id)] = String(row.coverage_name ?? "")
    })
  }

  return {
    insurer:
      insurerId != null && insurerLabel
        ? { value: String(insurerId), label: insurerLabel }
        : undefined,
    currency:
      currency.id != null && currencyLabel
        ? { value: String(currency.id), label: currencyLabel }
        : undefined,
    targets,
    coverages,
  }
}

/**
 * Turn the form strings into the JSON body for POST /products/travel
 * and PATCH /products/travel/{id}.
 *
 * If "Does Product Have Rules?" is No, the four API questions are hidden.
 * We still send those four flags as false so the API can clear saved rules.
 * A public product does not send target organizations.
 */
export const buildTravelProductPayload = (
  values: TravelProductFormValues
): TravelProductPayload => {
  const hasRules = yesNoToBoolean(values.has_rules)
  const isPublic = yesNoToBoolean(values.for_public)
  const currencyId = Number(values.currency)

  const targetIds = values.organization_location_ids
    .map((row) => Number(row.organization_location_id))
    .filter((id) => Number.isInteger(id) && id > 0)

  const officename = values.officename?.trim() ?? ""

  return {
    organization_location_id: Number(values.organization_location_id),
    name: values.name.trim(),
    officename: officename === "" ? null : officename,
    levy_applied: yesNoToBoolean(values.levy_applied),
    for_public: isPublic,
    currency: Number.isInteger(currencyId) && currencyId > 0 ? currencyId : null,
    start_date: values.start_date ? values.start_date : null,
    expiry_date: values.expiry_date ? values.expiry_date : null,
    organization_location_ids: isPublic ? [] : [...new Set(targetIds)],
    coverages: values.coverages.map((row) => ({
      coverage_id: Number(row.coverage_id),
      bound_type: row.bound_type,
    })),
    has_rules: hasRules,
    quotation_api: hasRules ? yesNoToBoolean(values.quotation_api) : false,
    policy_api: hasRules ? yesNoToBoolean(values.policy_api) : false,
    payment_api: hasRules ? yesNoToBoolean(values.payment_api) : false,
    certificate_api: hasRules ? yesNoToBoolean(values.certificate_api) : false,
  }
}
