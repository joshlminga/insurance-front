import { OrganizationReportPage } from '@/app/admin/reports/organization-report-page'
import { TravelQuoteFetchDetailDialog } from '@/app/admin/quotations/travel/fetch/detail-dialog'
import { MODULES } from '@/auth/module-keys'
import { OrganizationQuotationReportColumns } from '@/dev/columns/admin/reports/organization-reports'

export const OrganizationTravelQuotationsReportPage = () => (
  <OrganizationReportPage
    title="Travel quotations report"
    description="Organization travel quotations and purchases. Rows processed by another organization are highlighted."
    listUrl="reports/travel/quotations"
    exportUrl="reports/travel/quotations/export"
    exportFilename="travel-quotation-report.xlsx"
    moduleKey={MODULES.REPORT_ORG_TRAVEL_QUOTATION}
    columns={OrganizationQuotationReportColumns}
    searchPlaceholder="Search quote code, customer…"
    // Report-scoped show (not quotation/travel/fetch) so report-only users can preview
    detailUrl={(row) => `reports/travel/quotations/${row.id}`}
    DetailDialog={TravelQuoteFetchDetailDialog}
    extraFilters={[
      { key: 'quote_code', label: 'Quote code', placeholder: 'Q-…' },
      { key: 'agent_id', label: 'Agent ID', type: 'number' },
      { key: 'processed_by_id', label: 'Processed by ID', type: 'number' },
      { key: 'referral_code', label: 'Referral code', placeholder: 'REF-…' },
      { key: 'insurer_id', label: 'Insurer ID', type: 'number' },
    ]}
  />
)

export default OrganizationTravelQuotationsReportPage
