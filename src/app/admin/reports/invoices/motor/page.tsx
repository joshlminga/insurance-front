import { Navigate } from 'react-router-dom'
import { EROUTES } from '@/utils/enums'

export const InvoiceReportsMotorPage = () => (
  <Navigate to={EROUTES.FINANCE_INVOICES} replace />
)
