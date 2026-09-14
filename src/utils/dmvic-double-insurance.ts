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
  /** Suggested next start (YYYY-MM-DD) from latest overlapping cover expiry + 1 day */
  suggestedCoverStartDate: string | null
  message: string
}

export type DoubleInsurancePreflightResult =
  | DoubleInsurancePreflightClear
  | DoubleInsurancePreflightBlocked

type DoubleInsuranceApiData = {
  clear?: boolean
  suggested_cover_start_date?: string | null
  latest_cover_expiry_date?: string | null
  covers?: unknown[]
}

/**
 * Call ValidateDoubleInsurance before invoice submit.
 * Keeps this DMVIC round-trip off the Type A/C validate request (PHP timeout-safe).
 *
 * - clear=true / 200 → Go (no overlapping cover, including ER0016)
 * - 422 with covers → No-Go; UI should block and show suggested start date
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
