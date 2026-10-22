import { OrganizationReportPage } from '@/app/admin/reports/organization-report-page'
import { MODULES } from '@/auth/module-keys'
import { OrganizationCertificateReportColumns } from '@/dev/columns/admin/reports/organization-reports'

export const OrganizationMotorCertificatesReportPage = () => (
  <OrganizationReportPage
    title="Motor policies / certificates"
    description="Certificates issued for quotations at your organization location."
    listUrl="reports/motor/certificates"
    exportUrl="reports/motor/certificates/export"
    exportFilename="motor-certificate-report.xlsx"
    moduleKey={MODULES.REPORT_ORG_MOTOR_CERTIFICATE}
    columns={OrganizationCertificateReportColumns}
    searchPlaceholder="Search certificate, policy, registration…"
    showSummary
    showAgentFilter
    extraFilters={[
      { key: 'policy_number', label: 'Policy number' },
      { key: 'certificate_number', label: 'Certificate number' },
      { key: 'registration_number', label: 'Registration number' },
      { key: 'insurer_id', label: 'Insurer ID', type: 'number' },
    ]}
  />
)

export default OrganizationMotorCertificatesReportPage
