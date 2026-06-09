import { PRODUCT_TYPES } from "@/utils/constatnts"

const PRODUCT_VALUE_SET = new Set(PRODUCT_TYPES.map((item) => item.value))
const PRODUCT_LABEL_TO_VALUE = new Map(
  PRODUCT_TYPES.map((item) => [item.label.toLowerCase(), item.value])
)

/** Normalize form/API input to PRODUCT_TYPES `value` before submit or hydrate. */
export function toProductTypeValue(raw: string): string {
  const trimmed = String(raw ?? "").trim()
  if (!trimmed) return ""

  if (PRODUCT_VALUE_SET.has(trimmed as (typeof PRODUCT_TYPES)[number]["value"])) {
    return trimmed
  }

  return PRODUCT_LABEL_TO_VALUE.get(trimmed.toLowerCase()) ?? ""
}

export type OrganizationLocationProductCreateRow = {
  product: string
  access_public: boolean
}

export type OrganizationLocationProductEditRow = OrganizationLocationProductCreateRow & {
  product_status: boolean
}

export const DEFAULT_ORG_LOCATION_PRODUCT_CREATE_ROW: OrganizationLocationProductCreateRow = {
  product: "",
  access_public: true,
}

export const DEFAULT_ORG_LOCATION_PRODUCT_EDIT_ROW: OrganizationLocationProductEditRow = {
  product: "",
  access_public: true,
  product_status: true,
}

export type OrganizationLocationProductApiPayload = {
  product: string
  access_public: boolean
  product_status: boolean
}

export function mapApiProductsToEditRows(
  products: Array<{
    product?: string
    access_public?: boolean
    is_active?: boolean
  }> | null | undefined
): OrganizationLocationProductEditRow[] {
  const apiProducts = products ?? []
  if (!apiProducts.length) {
    return [{ ...DEFAULT_ORG_LOCATION_PRODUCT_EDIT_ROW }]
  }

  return apiProducts.map((item) => ({
    product: toProductTypeValue(item.product ?? ""),
    access_public: item.access_public ?? true,
    product_status: item.is_active ?? true,
  }))
}

/** Build API `products` array: value strings + boolean flags. */
export function buildProductsApiPayload(
  rows: OrganizationLocationProductCreateRow[] | OrganizationLocationProductEditRow[]
): OrganizationLocationProductApiPayload[] {
  return rows
    .map((row) => {
      const product = toProductTypeValue(row.product)
      if (!product) return null

      const product_status =
        "product_status" in row ? Boolean(row.product_status) : true

      return {
        product,
        access_public: Boolean(row.access_public),
        product_status,
      }
    })
    .filter((row): row is OrganizationLocationProductApiPayload => row !== null)
}

export function appendProductsToFormData(
  formData: FormData,
  rows: OrganizationLocationProductCreateRow[] | OrganizationLocationProductEditRow[]
) {
  const products = buildProductsApiPayload(rows)

  products.forEach((row, index) => {
    formData.append(`products[${index}][product]`, row.product)
    formData.append(
      `products[${index}][access_public]`,
      row.access_public ? "1" : "0"
    )
    formData.append(
      `products[${index}][product_status]`,
      row.product_status ? "1" : "0"
    )
  })
}
