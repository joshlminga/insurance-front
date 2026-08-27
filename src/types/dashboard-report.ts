/**
 * Types for GET /api/v1/reports/motor/dashboard
 * Matches the backend DashboardReport payload.
 */

/** Slim vehicle block returned on list rows */
export type MotorDashboardVehicle = {
  id: number
  registration_number?: string | null
  chassis_number?: string | null
  engine_number?: string | null
  make?: string | null
  model?: string | null
  body_type?: string | null
  color?: string | null
  year?: number | null
}

/** Slim customer block on list rows */
export type MotorDashboardCustomer = {
  id: number
  name?: string | null
  email?: string | null
}

/** KPI totals — period fields are only premium + quotations */
export type MotorDashboardSummary = {
  total_customers: number
  total_invoices: number
  /** All-time paid installment amounts (string decimal from API) */
  total_payments: string
  active_policies: number
  /** Paid amounts inside the selected period */
  total_premium: string
  /** Distinct vehicle plates quoted in the period */
  total_quotations: number
}

export type MotorDashboardListSection<T> = {
  total: number
  items: T[]
}

export type MotorDashboardPendingQuotation = {
  id: number
  quote_code: string
  status: string
  current_step?: number | null
  started_at?: string | null
  last_activity_at?: string | null
  vehicle?: MotorDashboardVehicle | null
  customer?: MotorDashboardCustomer | null
}

export type MotorDashboardPendingInstallment = {
  id: number
  invoice_number: string
  purchase_id: number
  installment_number: number
  total_installments: number
  installment_text: string
  installment_amount: string
  status: string
  due_date?: string | null
  vehicle?: MotorDashboardVehicle | null
  customer?: MotorDashboardCustomer | null
}

export type MotorDashboardCertificate = {
  id: number
  invoice_id: number
  certificate_number?: string | null
  policy_number?: string | null
  registration_number?: string | null
  chassis_number?: string | null
  issued_date?: string | null
  expiry_date?: string | null
  policy_allocation_status?: string | null
  vehicle?: MotorDashboardVehicle | null
  customer?: MotorDashboardCustomer | null
}

export type MotorDashboardFailedCertificate = {
  id: number
  invoice_number: string
  purchase_id: number
  installment_amount: string
  status: string
  dmvic_issuance_failed_at?: string | null
  vehicle?: MotorDashboardVehicle | null
  customer?: MotorDashboardCustomer | null
}

export type MotorDashboardNotification = {
  id: number
  event_type: string
  category: string
  user_id?: number | null
  session_id?: string | null
  entity_type?: string | null
  entity_id?: number | null
  insurer_id?: number | null
  metadata?: Record<string, unknown> | null
  occurred_at?: string | null
}

/** Full dashboard payload inside SubmitResponse.data */
export type MotorDashboardReport = {
  period: {
    date_from: string
    date_to: string
  }
  organization: {
    organization_id: number
    organization_location_id: number
  }
  summary: MotorDashboardSummary
  pending_quotations: MotorDashboardListSection<MotorDashboardPendingQuotation>
  pending_installments: MotorDashboardListSection<MotorDashboardPendingInstallment>
  certificates: MotorDashboardListSection<MotorDashboardCertificate>
  failed_certificates: MotorDashboardListSection<MotorDashboardFailedCertificate>
  recent_notifications: MotorDashboardListSection<MotorDashboardNotification>
}
