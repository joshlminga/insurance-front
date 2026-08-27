import AllTransactionsPage from "@/app/admin/credit/transactions/tabs/all-transactions";
import MyTransactionsPage from "@/app/admin/credit/transactions/tabs/my-transactions";
import MotorProductTab from "@/app/admin/finance/invoices/tabs/motor";
import { ECREDITTRANSACTIONS, EINVOICES } from "@/types/enums";
import { TTab } from "@/types/types";

export const InvoiceTabs: TTab<EINVOICES>[]=[
    {
        key: EINVOICES.MOTOR,
        Tab: MotorProductTab,
        title: 'Motor Product',
    },
    {
        key: EINVOICES.MARINE,
        Tab: MotorProductTab,
        title: 'Marine Product'
    },
    {
        key: EINVOICES.TRAVEL,
        Tab: MotorProductTab,
        title: 'Travel Product'
    }
]

export const CreditTransactionTabs: TTab<ECREDITTRANSACTIONS>[]=[
    {
        key: ECREDITTRANSACTIONS.MY_TRANSACTION,
        Tab: MyTransactionsPage,
        title: 'My Transactions',
    },
    {
        key: ECREDITTRANSACTIONS.ALL_TRANSACTION,
        Tab: AllTransactionsPage,
        title: 'All Transactions'
    }
]