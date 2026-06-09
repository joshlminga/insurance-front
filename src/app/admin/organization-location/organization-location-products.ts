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
    product: item.product ?? "",
    access_public: item.access_public ?? true,
    product_status: item.is_active ?? true,
  }))
}

export function appendProductsToFormData(
  formData: FormData,
  rows: OrganizationLocationProductCreateRow[] | OrganizationLocationProductEditRow[],
  options?: { includeStatus?: boolean }
) {
  const filledRows = rows.filter((row) => String(row.product ?? "").trim().length > 0)

  filledRows.forEach((row, index) => {
    formData.append(`product[${index}][product]`, row.product)
    formData.append(
      `product[${index}][access_public]`,
      row.access_public ? "1" : "0"
    )

    if (options?.includeStatus && "product_status" in row) {
      formData.append(
        `product[${index}][product_status]`,
        row.product_status ? "1" : "0"
      )
    }
  })
}
