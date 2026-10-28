/**
 * DMVIC ValidateInsurance — certificate + (registration OR chassis).
 * Used by Motor → Double → Verify from the cover row.
 * Missing API keys map to empty strings so the dialog can show "-".
 */
import apiClient from '@/lib/api-client'

/** API path for certificate validation (read-only DMVIC check). */
export const DMVIC_VALIDATE_INSURANCE_URL = 'dmvic/validate/insurance'

export type ValidateInsuranceParams = {
  certificateNumber: string
  /** At least one of registration or chassis is required. */
  vehicleRegistrationNumber?: string | null
  chassisNumber?: string | null
}

/** Mapped fields the Verify dialog displays. */
export type ValidateInsuranceResult = {
  certificateNumber: string
  insurancePolicyNumber: string
  validFrom: string
  validTill: string
  registrationNumber: string
  insuredBy: string
  chassisNumber: string
}

type ValidateInsuranceApiData = {
  certificate_number?: unknown
  insurance_policy_number?: unknown
  valid_from?: unknown
  valid_till?: unknown
  registration_number?: unknown
  insured_by?: unknown
  chassis_number?: unknown
}

function text(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim()
  }
  if (typeof value === 'number') {
    return String(value)
  }
  return ''
}

function mapResult(data: ValidateInsuranceApiData | undefined): ValidateInsuranceResult {
  return {
    certificateNumber: text(data?.certificate_number),
    insurancePolicyNumber: text(data?.insurance_policy_number),
    validFrom: text(data?.valid_from),
    validTill: text(data?.valid_till),
    registrationNumber: text(data?.registration_number),
    insuredBy: text(data?.insured_by),
    chassisNumber: text(data?.chassis_number),
  }
}

/**
 * GET dmvic/validate/insurance with certificate + registration and/or chassis.
 * Throws on network / 4xx so the caller can toast.
 */
export async function validateInsuranceCertificate(
  params: ValidateInsuranceParams,
): Promise<ValidateInsuranceResult> {
  const registration = params.vehicleRegistrationNumber?.trim() || ''
  const certificateNumber = params.certificateNumber.trim()
  const chassis = params.chassisNumber?.trim() || ''

  if (certificateNumber === '' || (registration === '' && chassis === '')) {
    throw new Error(
      'Certificate number and vehicle registration or chassis are required to verify.',
    )
  }

  const response = await apiClient.get<{
    success?: boolean
    message?: string
    data?: ValidateInsuranceApiData
  }>(DMVIC_VALIDATE_INSURANCE_URL, {
    params: {
      certificate_number: certificateNumber,
      ...(registration !== '' ? { vehicle_registration_number: registration } : {}),
      ...(chassis !== '' ? { chassis_number: chassis } : {}),
    },
  })

  if (response.data?.success === false) {
    throw new Error(
      typeof response.data?.message === 'string' && response.data.message.trim() !== ''
        ? response.data.message
        : 'Certificate validation failed.',
    )
  }

  return mapResult(response.data?.data)
}
