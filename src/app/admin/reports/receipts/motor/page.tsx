import { Navigate } from 'react-router-dom'
import { EROUTES } from '@/utils/enums'

export const ReceiptReportsMotorPage = () => (
  <Navigate to={EROUTES.FINANCE_RECEIPTS} replace />
)
