import MotorCertificatesAllTab from '@/app/admin/motor-certificates/tabs/all'
import MotorCertificatesFailedTab from '@/app/admin/motor-certificates/tabs/failed'
import MotorCertificatesIssuedOnlyTab from '@/app/admin/motor-certificates/tabs/issued-only'
import AllTransactionsPage from '@/app/admin/credit/transactions/tabs/all-transactions'
import MyTransactionsPage from '@/app/admin/credit/transactions/tabs/my-transactions'
import MotorProductTab from '@/app/admin/finance/invoices/tabs/motor'
import {
  ECREDITTRANSACTIONS,
  EINVOICES,
  EMOTORCERTIFICATES,
} from '@/types/enums'
import { TTab } from '@/types/types'

export const InvoiceTabs: TTab<EINVOICES>[] = [
  {
    key: EINVOICES.MOTOR,
    Tab: MotorProductTab,
    title: 'Motor Product',
  },
  {
    key: EINVOICES.MARINE,
    Tab: MotorProductTab,
    title: 'Marine Product',
  },
  {
    key: EINVOICES.TRAVEL,
    Tab: MotorProductTab,
    title: 'Travel Product',
  },
]

export const CreditTransactionTabs: TTab<ECREDITTRANSACTIONS>[] = [
  {
    key: ECREDITTRANSACTIONS.MY_TRANSACTION,
    Tab: MyTransactionsPage,
    title: 'My Transactions',
  },
  {
    key: ECREDITTRANSACTIONS.ALL_TRANSACTION,
    Tab: AllTransactionsPage,
    title: 'All Transactions',
  },
]

export const MotorCertificateTabs: TTab<EMOTORCERTIFICATES>[] = [
  {
    key: EMOTORCERTIFICATES.ALL,
    Tab: MotorCertificatesAllTab,
    title: 'All',
  },
  {
    key: EMOTORCERTIFICATES.ISSUED,
    Tab: MotorCertificatesIssuedOnlyTab,
    title: 'Issued',
  },
  {
    key: EMOTORCERTIFICATES.FAILED,
    Tab: MotorCertificatesFailedTab,
    title: 'Failed',
  },
]
