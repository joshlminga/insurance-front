import type { EditProductFormValues } from "@/types/schema"

export const normalizeBooleanSelectValue = (value: unknown): "true" | "false" => {
    if (value === true || value === "true") return "true"
    return "false"
}

export const normalizeTargetLocationId = (targets: unknown): string => {
    if (!Array.isArray(targets) || targets.length === 0) return ""

    const firstTarget = targets[0] as Record<string, unknown>
    const id =
        firstTarget?.organization_location_id ??
        firstTarget?.target_organization_location_id ??
        (firstTarget?.location as Record<string, unknown> | undefined)?.organization_location_id ??
        firstTarget?.ace_organization_location_id ??
        firstTarget?.location_id

    return id !== null && id !== undefined && String(id).trim().length > 0
        ? String(id)
        : ""
}

export const mapProductToEditFormValues = (product: Record<string, unknown>): EditProductFormValues => ({
    organization_location_id: String(product?.organization_location_id ?? ""),
    name: String(product?.name ?? ""),
    officename: String(product?.officename ?? ""),
    description: String((product?.meta as Record<string, unknown> | undefined)?.description ?? ""),
    access: String(product?.access ?? ""),
    for_public: normalizeBooleanSelectValue(product?.for_public),
    start_date: String(product?.start_date ?? product?.cover_start_date ?? ""),
    expiry_date: String(product?.expiry_date ?? product?.cover_expiry_date ?? ""),
    brochure: [],
    organization_location_ids: normalizeTargetLocationId(product?.targets),
})

export const getInsurerSelectedOption = (product: Record<string, unknown>) => {
    const baseLocation = (product?.base_location ?? {}) as Record<string, unknown>
    const organization = (product?.organization ?? {}) as Record<string, unknown>

    if (!product?.organization_location_id) return undefined

    return {
        value: String(product.organization_location_id),
        label: String(baseLocation?.organization_name ?? organization?.name ?? ""),
    }
}

export const getTargetOrganizationSelectedOption = (product: Record<string, unknown>) => {
    const targets = Array.isArray(product?.targets) ? product.targets : []
    const firstTarget = targets[0] as Record<string, unknown> | undefined
    if (!firstTarget) return undefined

    const value = String(
        firstTarget?.organization_location_id ??
        firstTarget?.target_organization_location_id ??
        (firstTarget?.location as Record<string, unknown> | undefined)?.organization_location_id ??
        firstTarget?.ace_organization_location_id ??
        firstTarget?.location_id ??
        ""
    )

    if (!value) return undefined

    return {
        value,
        label: String(
            firstTarget?.targeted_organization_name ??
            firstTarget?.organization_name ??
            (firstTarget?.location as Record<string, unknown> | undefined)?.organization_name ??
            ""
        ),
    }
}
