import type {
  TravelBenefitCreateFormValues,
  TravelBenefitFormValues,
} from "@/types/schema"

/** Empty single benefit row (create field-array item or edit defaults). */
export const emptyTravelBenefitRow = (): TravelBenefitFormValues => ({
  common_id: "",
  section_id: "",
  name: "",
  benefit: "",
  excess: "",
})

/** Alias for edit modal defaults. */
export const emptyTravelBenefitFormValues = emptyTravelBenefitRow

/** Create form starts with one empty row; + adds more for a shared group. */
export const emptyTravelBenefitCreateFormValues =
  (): TravelBenefitCreateFormValues => ({
    benefits: [emptyTravelBenefitRow()],
  })

export type TravelBenefitCreatePayload = {
  benefits: Array<{
    common_id: number
    section_id: number
    name: string | null
    benefit: string | null
    excess: string | null
  }>
  product_travel_ids: number[]
}

export type TravelBenefitUpdatePayload = {
  common_id: number
  section_id: number
  name: string | null
  benefit: string | null
  excess: string | null
  product_travel_ids: number[]
}

export type TravelBenefitSelectLabels = {
  common?: { value: string; label: string }
  section?: { value: string; label: string }
}

const optionalText = (value: string | undefined): string | null => {
  const trimmed = value?.trim() ?? ""
  return trimmed ? trimmed : null
}

const toProductId = (productId: string | number): number => {
  const n = Number(productId)
  if (!Number.isFinite(n)) {
    throw new Error("Invalid product id")
  }
  return n
}

const mapRowToApi = (values: TravelBenefitFormValues) => ({
  common_id: Number(values.common_id),
  section_id: Number(values.section_id),
  name: optionalText(values.name),
  benefit: optionalText(values.benefit),
  excess: optionalText(values.excess),
})

/**
 * Create body: one or more benefit rows + forced product link from the route.
 * Rows in benefits[] share one group_number on the server.
 */
export const buildTravelBenefitCreatePayload = (
  values: TravelBenefitCreateFormValues,
  productId: string | number
): TravelBenefitCreatePayload => ({
  benefits: values.benefits.map(mapRowToApi),
  product_travel_ids: [toProductId(productId)],
})

/** PATCH single benefit; keep link to the current product only. */
export const buildTravelBenefitUpdatePayload = (
  values: TravelBenefitFormValues,
  productId: string | number
): TravelBenefitUpdatePayload => ({
  ...mapRowToApi(values),
  product_travel_ids: [toProductId(productId)],
})

const taxonomyLabel = (
  row: Record<string, unknown>,
  shapedKey: "common" | "section"
): { value: string; label: string } | undefined => {
  const shaped = row[shapedKey] as { id?: number; name?: string } | undefined
  if (shaped?.id != null) {
    return { value: String(shaped.id), label: shaped.name ?? String(shaped.id) }
  }
  const camelKey = shapedKey === "common" ? "commonTaxonomy" : "sectionTaxonomy"
  const snakeKey = shapedKey === "common" ? "common_taxonomy" : "section_taxonomy"
  const rel =
    (row[camelKey] as { id?: number; name?: string } | undefined) ??
    (row[snakeKey] as { id?: number; name?: string } | undefined)
  if (rel?.id != null) {
    return { value: String(rel.id), label: rel.name ?? String(rel.id) }
  }
  const idKey = shapedKey === "common" ? "common_id" : "section_id"
  if (row[idKey] != null) {
    return { value: String(row[idKey]), label: String(row[idKey]) }
  }
  return undefined
}

/** Map list/show row into edit form values (product id comes from the route). */
export const mapTravelBenefitToFormValues = (
  benefit: Record<string, unknown>
): TravelBenefitFormValues => ({
  common_id:
    benefit.common_id != null
      ? String(benefit.common_id)
      : taxonomyLabel(benefit, "common")?.value ?? "",
  section_id:
    benefit.section_id != null
      ? String(benefit.section_id)
      : taxonomyLabel(benefit, "section")?.value ?? "",
  name: typeof benefit.name === "string" ? benefit.name : "",
  benefit: typeof benefit.benefit === "string" ? benefit.benefit : "",
  excess: typeof benefit.excess === "string" ? benefit.excess : "",
})

export const mapTravelBenefitSelectLabels = (
  benefit: Record<string, unknown>
): TravelBenefitSelectLabels => ({
  common: taxonomyLabel(benefit, "common"),
  section: taxonomyLabel(benefit, "section"),
})
