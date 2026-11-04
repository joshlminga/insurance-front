/**
 * Admin motor cover-reminder API paths.
 *
 * Assumed under quotation/motor (same prefix as fetch / premium), matching claims
 * settings style: GET/PATCH .../settings and GET paginated list.
 * Align with the backend agent if they choose a different path.
 */
export const MOTOR_REMINDERS_API = {
  /** GET/PATCH — { notify_agent, notify_customer } */
  settings: 'quotation/motor/reminders/settings',
  /** GET — paginated reminder rows (?status=&page=&per_page=) */
  list: 'quotation/motor/reminders',
} as const

export const MOTOR_REMINDER_STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'sent', label: 'Sent' },
  { value: 'failed', label: 'Failed' },
  { value: 'skipped', label: 'Skipped' },
] as const

export type MotorReminderStatus =
  | 'pending'
  | 'sent'
  | 'failed'
  | 'skipped'

export type MotorReminderSettings = {
  notify_agent: boolean
  notify_customer: boolean
}

export type MotorReminderListRow = {
  id?: number
  quote_code?: string | null
  registration?: string | null
  recipient?: string | null
  /** Days before expiry; 0 = expiry day */
  days_before?: number | null
  /** Optional display label from API (falls back to days_before formatting) */
  milestone?: string | null
  scheduled_for?: string | null
  status?: string | null
  sent_at?: string | null
  email?: string | null
}

/** Human-readable milestone from days_before (0 = cover expired). */
export function formatReminderMilestone(
  daysBefore: number | null | undefined,
  milestone?: string | null,
): string {
  if (milestone && milestone.trim()) {
    return milestone
  }
  if (daysBefore === null || daysBefore === undefined) {
    return '—'
  }
  if (daysBefore === 0) {
    return 'Expired (day 0)'
  }
  if (daysBefore === 1) {
    return '1 day before'
  }
  return `${daysBefore} days before`
}
