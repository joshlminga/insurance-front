import { OrganizationReportPage } from '@/app/admin/reports/organization-report-page'
import { MotorQuoteFetchDetailDialog } from '@/app/admin/quotations/motor/fetch/detail-dialog'
import { MODULES } from '@/auth/module-keys'
import { OrganizationQuotationReportColumns } from '@/dev/columns/admin/reports/organization-reports'

export const OrganizationMotorQuotationsReportPage = () => (
  <OrganizationReportPage
    title="Motor quotations report"
    description="Organization motor quotations and purchases. Rows processed by another organization are highlighted."
    listUrl="reports/motor/quotations"
    exportUrl="reports/motor/quotations/export"
    exportFilename="motor-quotation-report.xlsx"
    moduleKey={MODULES.REPORT_ORG_MOTOR_QUOTATION}
    columns={OrganizationQuotationReportColumns}
    searchPlaceholder="Search quote code, customer, registration…"
    showSummary
    showAgentFilter
    // Report-scoped show (not quotation/motor/fetch) so report-only users can preview
    detailUrl={(row) => `reports/motor/quotations/${row.id}`}
    DetailDialog={MotorQuoteFetchDetailDialog}
    extraFilters={[
      { key: 'quote_code', label: 'Quote code', placeholder: 'Q-…' },
      { key: 'processed_by_id', label: 'Processed by ID', type: 'number' },
      { key: 'referral_code', label: 'Referral code', placeholder: 'REF-…' },
      { key: 'insurer_id', label: 'Insurer ID', type: 'number' },
    ]}
  />
)

export default OrganizationMotorQuotationsReportPage
