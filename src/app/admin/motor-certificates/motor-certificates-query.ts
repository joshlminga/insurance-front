export const DMVIC_CERT_URLS = {
  list: 'dmvic/motor/certificates',
  failed: 'dmvic/motor/certificates/failed',
  download: (invoiceId: number | string) =>
    `dmvic/motor/certificates/${invoiceId}`,
  retry: (invoiceId: number | string) =>
    `dmvic/motor/certificates/${invoiceId}/retry-issuing`,
  bulk: 'dmvic/motor/certificates/bulk-issuing',
} as const

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
