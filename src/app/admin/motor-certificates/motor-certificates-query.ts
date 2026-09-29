export const DMVIC_CERT_URLS = {
  list: 'dmvic/motor/certificates',
  failed: 'dmvic/motor/certificates/failed',
  download: (invoiceId: number | string) =>
    `dmvic/motor/certificates/${invoiceId}`,
  retry: (invoiceId: number | string) =>
    `dmvic/motor/certificates/${invoiceId}/retry-issuing`,
  refresh: (invoiceId: number | string) =>
    `dmvic/motor/certificates/${invoiceId}/refresh`,
  bulk: 'dmvic/motor/certificates/bulk-issuing',
  cancelReasons: 'dmvic/motor/certificates/cancel-reasons',
  cancel: (invoiceId: number | string) =>
    `dmvic/motor/certificates/${invoiceId}/cancel`,
} as const

/** One option from GET cancel-reasons (keys match the DMVIC config casing). */
export type CancelReasonOption = {
  CancelReasonID: number
  CancelReason: string
}

/** Body sent to POST .../{invoice_id}/cancel */
export type CancelCertificatePayload = {
  cancel_reason_id: number
  description?: string
}

/**
 * Lifecycle status from the API. Casing may differ (e.g. "Issued" vs "issued"),
 * so always compare with `isCertificateCancellable` instead of `===`.
 */
export type MotorCertificateStatus =
  | 'Pending'
  | 'Issued'
  | 'Revoked'
  | 'Expired'
  | (string & {})

/**
 * A certificate can be cancelled only when DMVIC has issued a number and it
 * is not already revoked/expired. If the API omits `status`, fall back to
 * "has certificate number".
 */
export const isCertificateCancellable = (
  row: Pick<MotorCertificateRow, 'certificate_number' | 'status'>
): boolean => {
  if (!row.certificate_number) return false
  if (!row.status) return true
  return row.status.toString().toLowerCase() === 'issued'
}

export type MotorCertificateRow = {
  id: number
  invoice_id: number
  invoice_number?: string | null
  registration_number?: string | null
  certificate_number?: string | null
  policy_number?: string | null
  chassis_number?: string | null
  issued_date?: string | null
  expiry_date?: string | null
  is_active?: boolean
  status?: MotorCertificateStatus | null
  customer?: {
    id?: number | null
    name?: string | null
    email?: string | null
  } | null
}

export type FailedMotorCertificateRow = {
  invoice_id: number
  invoice_number?: string | null
  purchase_id?: number | null
  dmvic_issuance_failed_at?: string | null
  registration_number?: string | null
  chassis_number?: string | null
  paid_at_hint?: string | null
  customer?: {
    id?: number | null
    name?: string | null
    email?: string | null
  } | null
}

export type BulkIssuingResponse = {
  success: boolean
  message?: string
  data?: {
    issued?: Array<{
      invoice_id: number
      certificate_number?: string | null
      policy_number?: string | null
      motor_certificate_id?: number | null
    }>
    skipped?: Array<{ invoice_id: number; reason: string }>
    failed?: Array<{ invoice_id: number; reason: string }>
  }
}
