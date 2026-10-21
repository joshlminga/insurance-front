import { OrganizationReportPage } from '@/app/admin/reports/organization-report-page'
import { MODULES } from '@/auth/module-keys'
import { OrganizationCustomerReportColumns } from '@/dev/columns/admin/reports/organization-reports'

export const OrganizationCustomersReportPage = () => (
  <OrganizationReportPage
    title="Customer report"
    description="Members at your organization location. Search by name, email, or phone."
    listUrl="reports/customers"
    exportUrl="reports/customers/export"
    exportFilename="customer-report.xlsx"
    moduleKey={MODULES.REPORT_CUSTOMER}
    columns={OrganizationCustomerReportColumns}
    searchPlaceholder="Search name, email, phone…"
    extraFilters={[
      {
        key: 'product',
        label: 'Product',
        placeholder: 'Motor, Travel, …',
      },
      {
        key: 'insurer_id',
        label: 'Insurer ID',
        placeholder: 'Organization id',
        type: 'number',
      },
    ]}
  />
)

export default OrganizationCustomersReportPage
