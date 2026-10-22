import apiClient from '@/lib/api-client'
import { maxCoverEndDate } from '@/utils/helpers'

/** API path for read-only DMVIC cover-date overlap check (separate from Type A/C validate). */
export const DMVIC_DOUBLE_INSURANCE_URL = 'dmvic/validate/double-insurance'

export type DoubleInsurancePreflightParams = {
  /** Cover start as YYYY-MM-DD (from HTML date input) */
  coverStartDate: string
  /** Optional cover end; defaults to start + 12 months − 1 day */
  coverEndDate?: string | null
  vehicleRegistrationNumber?: string | null
  chassisNumber?: string | null
}

export type DoubleInsurancePreflightClear = {
  clear: true
}

export type DoubleInsurancePreflightBlocked = {
  clear: false
  /**
   * Legacy field from API; always null now.
   * Do not auto-fill cover_start_date from this — range-limited DMVIC results are not safe guidance.
   */
  suggestedCoverStartDate: string | null
  message: string
}

export type DoubleInsurancePreflightResult =
  | DoubleInsurancePreflightClear
  | DoubleInsurancePreflightBlocked

/** One overlapping cover. API fields stay snake_case until we map them here. */
export type DoubleInsuranceCover = {
  certificateNumber: string
  coverExpiryDate: string
  insuranceName: string
  chassisNumber: string
  vehicleRegistrationNumber: string
}

export type DoubleInsuranceLookupParams = {
  /** Cover start as YYYY-MM-DD (from an HTML date input) */
  coverStartDate: string
  /** Cover end as YYYY-MM-DD */
  coverEndDate: string
  vehicleRegistrationNumber: string
}

/** What the admin Double page renders after a lookup. */
export type DoubleInsuranceLookupResult = {
  registration: string
  startDate: string
  endDate: string
  clear: boolean
  covers: DoubleInsuranceCover[]
}

type DoubleInsuranceApiData = {
  clear?: boolean
  suggested_cover_start_date?: string | null
  latest_cover_expiry_date?: string | null
  covers?: unknown[]
}

function coverText(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim()
  }
  if (typeof value === 'number') {
    return String(value)
  }
  return ''
}

/** Copy one API cover row into the shape the Double page renders. */
function mapCover(row: unknown): DoubleInsuranceCover {
  const item =
    row !== null && typeof row === 'object'
      ? (row as Record<string, unknown>)
      : {}

  return {
    certificateNumber: coverText(item.certificate_number),
    coverExpiryDate: coverText(item.cover_expiry_date),
    insuranceName: coverText(item.insurance_name),
    chassisNumber: coverText(item.chassis_number),
    vehicleRegistrationNumber: coverText(item.vehicle_registration_number),
  }
}

function mapCovers(covers: unknown): DoubleInsuranceCover[] {
  if (!Array.isArray(covers)) {
    return []
  }
  return covers.map(mapCover)
}

/**
 * Call ValidateDoubleInsurance before invoice submit.
 * Keeps this DMVIC round-trip off the Type A/C validate request (PHP timeout-safe).
 *
 * - clear=true / 200 → Go (no overlapping cover, including ER0016)
 * - 422 with covers → No-Go; UI should block and ask the user to try different dates
 */
export async function validateDoubleInsurancePreflight(
  params: DoubleInsurancePreflightParams,
): Promise<DoubleInsurancePreflightResult> {
  const coverStartDate = params.coverStartDate.trim()
  const coverEndDate = (params.coverEndDate?.trim() || maxCoverEndDate(coverStartDate, 12))

  const registration = params.vehicleRegistrationNumber?.trim() || ''
  const chassis = params.chassisNumber?.trim() || ''

  if (!registration && !chassis) {
    throw new Error('Vehicle registration or chassis number is required for double insurance check.')
  }

  try {
    const response = await apiClient.get<{
      success?: boolean
      message?: string
      data?: DoubleInsuranceApiData
    }>(DMVIC_DOUBLE_INSURANCE_URL, {
      params: {
        policystartdate: coverStartDate,
        policyenddate: coverEndDate,
        ...(registration !== ''
          ? { vehicle_registration_number: registration }
          : {}),
        ...(chassis !== '' ? { chassis_number: chassis } : {}),
      },
    })

    const data = response.data?.data
    if (data?.clear === true || response.data?.success === true) {
      return { clear: true }
    }

    // Unexpected 200 without clear — treat as blocked if covers exist
    if (Array.isArray(data?.covers) && data.covers.length > 0) {
      return {
        clear: false,
        suggestedCoverStartDate: data.suggested_cover_start_date ?? null,
        message:
          typeof response.data?.message === 'string' && response.data.message.trim() !== ''
            ? response.data.message
            : 'An overlapping cover exists for the selected dates.',
      }
    }

    return { clear: true }
  } catch (error: unknown) {
    const axiosError = error as {
      response?: {
        status?: number
        data?: {
          message?: string
          data?: DoubleInsuranceApiData
          errors?: { cover_start_date?: string[] | string }
        }
      }
      message?: string
    }

    const status = axiosError.response?.status
    const body = axiosError.response?.data
    const apiData = body?.data

    if (status === 422 && apiData && apiData.clear === false) {
      const fieldError = body?.errors?.cover_start_date
      const message = Array.isArray(fieldError)
        ? fieldError.filter(Boolean).join('\n')
        : typeof fieldError === 'string'
          ? fieldError
          : typeof body?.message === 'string'
            ? body.message
            : 'An overlapping cover exists for the selected dates.'

      return {
        clear: false,
        suggestedCoverStartDate: apiData.suggested_cover_start_date ?? null,
        message,
      }
    }

    throw error instanceof Error
      ? error
      : new Error(axiosError.message || 'Double insurance validation failed.')
  }
}

/**
 * Same double-insurance GET as the payment preflight, but return the cover rows.
 * Registration is required. Chassis is not sent from the Double screen.
 *
 * - 200 with clear=true and no covers → clear
 * - 422 with clear=false and covers → overlapping covers (not an error)
 * - anything else (network, 400 DMVIC failure, validation) → throw for the page toast
 */
export async function lookupDoubleInsurance(
  params: DoubleInsuranceLookupParams,
): Promise<DoubleInsuranceLookupResult> {
  const registration = params.vehicleRegistrationNumber.trim()
  const startDate = params.coverStartDate.trim()
  const endDate = params.coverEndDate.trim()

  if (registration === '') {
    throw new Error('Vehicle registration is required for double insurance lookup.')
  }

  const searched = {
    registration,
    startDate,
    endDate,
  }

  try {
    const response = await apiClient.get<{
      success?: boolean
      message?: string
      data?: DoubleInsuranceApiData
    }>(DMVIC_DOUBLE_INSURANCE_URL, {
      params: {
        policystartdate: startDate,
        policyenddate: endDate,
        vehicle_registration_number: registration,
      },
    })

    const data = response.data?.data
    const covers = mapCovers(data?.covers)

    if (data?.clear === true && covers.length === 0) {
      return { ...searched, clear: true, covers: [] }
    }

    if (covers.length > 0) {
      return { ...searched, clear: false, covers }
    }

    return { ...searched, clear: true, covers: [] }
  } catch (error: unknown) {
    const axiosError = error as {
      response?: {
        status?: number
        data?: {
          message?: string
          data?: DoubleInsuranceApiData
        }
      }
      message?: string
    }

    const status = axiosError.response?.status
    const apiData = axiosError.response?.data?.data

    // Overlap is a 422 with the cover list, not a failed request.
    if (status === 422 && apiData?.clear === false && Array.isArray(apiData.covers)) {
      return {
        ...searched,
        clear: false,
        covers: mapCovers(apiData.covers),
      }
    }

    throw error instanceof Error
      ? error
      : new Error(axiosError.message || 'Double insurance lookup failed.')
  }
}
