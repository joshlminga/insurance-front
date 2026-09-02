/** Shared fields sent to POST /products/motor and POST /products/motor/{id} */
export type MotorProductFormPayload = {
    organization_location_id: string
    name: string
    officename: string
    description: string
    access: string
    for_public: string
    start_date: string
    expiry_date: string
    organization_location_ids?: string
    brochure?: File[]
}

export function buildMotorProductFormData(data: MotorProductFormPayload): FormData {
    const formData = new FormData()
    formData.append("organization_location_id", data.organization_location_id)
    formData.append("name", data.name)
    formData.append("officename", data.officename)
    formData.append("description", data.description)
    formData.append("access", data.access)
    formData.append("for_public", data.for_public)
    formData.append("start_date", data.start_date)
    formData.append("expiry_date", data.expiry_date)

    if (data.organization_location_ids) {
        formData.append("organization_location_ids", data.organization_location_ids)
    }

    data.brochure?.forEach((file) => {
        formData.append("brochure[]", file)
    })

    return formData
}
