/**
 * Normalize vehicle data from fetch/duplicate APIs or purchase vehicle_info
 * into the shape read by KYC (sessionStorage + getVehicleValue aliases).
 */
export function normalizeMotorVehicleForKycSession(
  vehicle: unknown
): Record<string, unknown> | null {
  if (!vehicle || typeof vehicle !== 'object') {
    return null
  }

  const source = vehicle as Record<string, unknown>

  const readName = (value: unknown): string | null => {
    if (value == null) return null
    if (typeof value === 'string') {
      const trimmed = value.trim()
      return trimmed || null
    }
    if (typeof value === 'object') {
      const record = value as Record<string, unknown>
      const nested = record.name ?? record.title ?? record.label
      if (typeof nested === 'string' && nested.trim()) {
        return nested.trim()
      }
    }
    return null
  }

  const readId = (value: unknown): number | null => {
    if (value == null || value === '') return null
    const id = Number(value)
    return Number.isFinite(id) && id > 0 ? id : null
  }

  // Purchase API already returns DMVIC/local vehicle_info shape.
  if (
    source.registrationNumber != null ||
    source.vehicleMake != null ||
    source.vehicleModel != null
  ) {
    return source
  }

  const makeName = readName(source.make ?? source.vehicle_make ?? source.make_name)
  const modelName = readName(source.model ?? source.vehicle_model ?? source.model_name)
  const bodyTypeName = readName(
    source.body_type ?? source.bodyType ?? source.bodytype ?? source.body_type_name
  )
  const colorName = readName(source.color ?? source.vehicle_color ?? source.vehicle_color_name)

  const makeId = readId(source.make_id)
  const modelId = readId(source.model_id)
  const bodyTypeId = readId(source.body_type_id ?? source.bodytype_id)
  const colorId = readId(source.color_id ?? source.vehicle_color_id)

  const registrationNumber =
    readName(source.registration_number) ?? readName(source.registrationNumber)
  const chassisNumber =
    readName(source.chassis_number) ?? readName(source.chassisNumber)
  const engineNumber =
    readName(source.engine_number) ?? readName(source.engineNumber)
  const year = source.year ?? source.registration_year ?? source.registrationYear ?? null
  const passengerCapacity =
    source.number_of_passengers ?? source.passengerCapacity ?? null
  const tonnage = source.tonnage ?? source.vehicleTonnage ?? source.vehicle_tonnage ?? null
  const cubicCapacity =
    source.cubic_capacity ?? source.cubicCapacity ?? source.engine_cc ?? null

  const normalized: Record<string, unknown> = {
    registrationNumber,
    registration_number: registrationNumber,
    chassisNumber,
    chassis_number: chassisNumber,
    engineNumber,
    engine_number: engineNumber,
    registrationYear: year,
    registration_year: year,
    year,
    passengerCapacity,
    number_of_passengers: passengerCapacity,
    vehicleTonnage: tonnage,
    tonnage,
    cubicCapacity,
    cubic_capacity: cubicCapacity,
    make: makeName,
    model: modelName,
    body_type: bodyTypeName,
    bodyType: bodyTypeName,
    color: colorName,
    vehicle_color: colorName,
  }

  if (makeName != null || makeId != null) {
    normalized.vehicleMake = { id: makeId, name: makeName }
    normalized.make_id = makeId
  }
  if (modelName != null || modelId != null) {
    normalized.vehicleModel = { id: modelId, name: modelName }
    normalized.model_id = modelId
  }
  if (bodyTypeName != null || bodyTypeId != null) {
    normalized.bodyType = { id: bodyTypeId, name: bodyTypeName }
    normalized.body_type_id = bodyTypeId
  }
  if (colorName != null || colorId != null) {
    normalized.vehicleColor = { id: colorId, name: colorName }
    normalized.color_id = colorId
  }

  const hasReadableValue = Object.values(normalized).some(
    (value) => value != null && value !== ''
  )

  return hasReadableValue ? normalized : null
}
