import { OrganizationReportPage } from '@/app/admin/reports/organization-report-page'
import { MODULES } from '@/auth/module-keys'
import { OrganizationMotorVehicleReportColumns } from '@/dev/columns/admin/reports/organization-reports'

export const OrganizationMotorVehiclesReportPage = () => (
  <OrganizationReportPage
    title="Motor vehicles report"
    description="Vehicles linked to quotations at your organization location."
    listUrl="reports/motor/vehicles"
    exportUrl="reports/motor/vehicles/export"
    exportFilename="motor-vehicle-report.xlsx"
    moduleKey={MODULES.REPORT_ORG_MOTOR_VEHICLE}
    columns={OrganizationMotorVehicleReportColumns}
    searchPlaceholder="Search registration, chassis, make, model…"
  />
)

export default OrganizationMotorVehiclesReportPage
