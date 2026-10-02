import apiClient from '@/lib/api-client'

/** Authenticated GET — same JWT permission as purchase summary. */
export const motorPolicyDetailsUrl = (purchaseId: string) =>
  `purchase/motor/${purchaseId}/policy-details`

export type MotorPolicyDetails = {
  policyHolderName: string
  insurerName: string
  policyCovering: string
  policyClass: string
  coverStartDate: string
  coverEndDate: string
}

export type MotorPolicyDetailRow = {
  key: keyof MotorPolicyDetails
  label: string
}

/** Label/value order shown in the pre-payment confirm dialog. */
export const MOTOR_POLICY_DETAIL_ROWS: MotorPolicyDetailRow[] = [
  { key: 'policyHolderName', label: 'Policy holder' },
  { key: 'insurerName', label: 'Insurer' },
  { key: 'policyCovering', label: 'Covering' },
  { key: 'policyClass', label: 'Policy class' },
  { key: 'coverStartDate', label: 'Cover start' },
  { key: 'coverEndDate', label: 'Cover end' },
]

type PolicyDetailsApiResponse = {
  success?: boolean
  message?: string
  data?: Partial<MotorPolicyDetails> | null
}

function asDisplayString(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim()
  }
  if (value == null) {
    return ''
  }
  return String(value).trim()
}

/**
 * Fetch DMVIC-aligned policy preview for a motor purchase.
 * Throws when the response has no usable data (caller shows toast).
 */
export async function fetchMotorPolicyDetails(
  purchaseId: string,
): Promise<MotorPolicyDetails> {
  const id = purchaseId.trim()
  if (!id) {
    throw new Error('Purchase session is missing. Please refresh and try again.')
  }

  const response = await apiClient.get<PolicyDetailsApiResponse>(
    motorPolicyDetailsUrl(id),
  )

  const raw = response.data?.data
  if (!raw || typeof raw !== 'object') {
    throw new Error(
      typeof response.data?.message === 'string' && response.data.message.trim() !== ''
        ? response.data.message
        : 'Policy details were not returned.',
    )
  }

  return {
    policyHolderName: asDisplayString(raw.policyHolderName),
    insurerName: asDisplayString(raw.insurerName),
    policyCovering: asDisplayString(raw.policyCovering),
    policyClass: asDisplayString(raw.policyClass),
    coverStartDate: asDisplayString(raw.coverStartDate),
    coverEndDate: asDisplayString(raw.coverEndDate),
  }
}
