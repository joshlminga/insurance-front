/**
 * Report API URL constants + React Query keys (same pattern as credit-query.ts).
 */

export const REPORT_URLS = {
  /** Organization motor dashboard KPIs + limited lists */
  dashboard: "reports/motor/dashboard",
} as const

export function motorDashboardKey(params?: Record<string, unknown>) {
  return [REPORT_URLS.dashboard, params] as const
}
