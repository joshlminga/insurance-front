import { ActionColumn } from '@/dev/columns'
import { MyPaymentHistory } from '@/dev/columns/customer/motor/payment-history'
import { CustomBaseTable, SearchTools } from '@/dev/table'
import { useDebounce } from '@/hooks'
import { UseApiQuery } from '@/hooks/hooks'
import type {
    SingleActionsHandler,
    SubmitResponse,
    TFilterOptions,
    TPaginationFilters,
} from '@/types/types'
import { EMETHODS, FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts'
import {
    documentInvoiceUrl,
    useDocumentDownload,
    useMotorDocumentDownload,
} from '@/utils/motor-document-download'
import { ShowToast } from '@/utils/utils'
import { useReducer } from 'react'

type PaymentHistoryRow = {
    invoice_id?: number | string | null
    purchase_id?: number | string | null
    product?: string | null
}

export const PaymentHistoryPage = () => {
    const [filter, optionsDispatcher] = useReducer(
        ReusableReducer<TPaginationFilters & TFilterOptions>,
        { ...FILTEROPTIONS, page: 1, pageSize: 15 }
    )
    const optionsDispatcherDebounce = useDebounce({
        debounceCallback: optionsDispatcher,
    })

    const { data, isLoading } = UseApiQuery<SubmitResponse>({
        url: 'reports/motor/user/receipts',
        params: {
            page: filter.page,
            pageSize: filter.pageSize,
            term: filter.term,
        },
        queryOptions: {
            enabled: true,
        },
    })

    const motorInvoiceMutation = useMotorDocumentDownload(
        (id) => documentInvoiceUrl('Motor', id),
        'Invoice'
    )
    const motorReceiptMutation = useMotorDocumentDownload(
        (id) => `document/motor/receipt/${id}`,
        'Receipt'
    )
    const travelInvoiceMutation = useMotorDocumentDownload(
        (id) => documentInvoiceUrl('Travel', id),
        'Invoice'
    )
    // Travel receipt is POST by purchase id (optional target_invoice_id in body).
    const travelReceiptMutation = useDocumentDownload({
        url: (variables) => {
            const purchaseId =
                typeof variables === 'object' && variables && 'purchase_id' in variables
                    ? String((variables as { purchase_id: string | number }).purchase_id)
                    : '0'
            return `document/travel/receipt/${purchaseId}`
        },
        label: 'Receipt',
        method: EMETHODS.POST,
    })

    const isTravelRow = (row: PaymentHistoryRow) =>
        String(row.product ?? '').toLowerCase() === 'travel'

    const ActionsHandlerMapping: SingleActionsHandler<PaymentHistoryRow>[] = [
        {
            label: 'View Invoice',
            onSelect: (row) => {
                if (!row?.invoice_id) {
                    ShowToast.error('Invoice id missing on this payment')
                    return
                }
                if (isTravelRow(row)) {
                    travelInvoiceMutation.mutate(String(row.invoice_id))
                    return
                }
                motorInvoiceMutation.mutate(String(row.invoice_id))
            },
        },
        {
            label: 'View Receipt',
            onSelect: (row) => {
                if (isTravelRow(row)) {
                    if (!row?.purchase_id) {
                        ShowToast.error('Purchase id missing on this payment')
                        return
                    }
                    const body: Record<string, unknown> = {
                        purchase_id: row.purchase_id,
                    }
                    if (row.invoice_id != null) {
                        body.target_invoice_id = Number(row.invoice_id)
                    }
                    travelReceiptMutation.mutate(body)
                    return
                }
                if (!row?.invoice_id) {
                    ShowToast.error('Invoice id missing on this payment')
                    return
                }
                motorReceiptMutation.mutate(String(row.invoice_id))
            },
        },
    ]

    return (
        <section>
            <div className="grid grid-cols-1 lg:grid-cols-1">
                <div className="rounded-xl border border-[#EAEAEA] bg-white p-5 sm:p-8">
                    <h2 className="text-lg sm:text-xl font-bold text-[#111111] mb-1">
                        Payment History
                    </h2>
                    <p className="text-sm text-[#71717A] mb-5 sm:mb-6">
                        View payment history and download invoices or receipts.
                    </p>

                    <div className="w-full">
                        <CustomBaseTable
                            {...{
                                onPageChange: (page) =>
                                    optionsDispatcher({
                                        payload: { page },
                                        type: 'page',
                                    }),
                                OtherToolsProps: {
                                    onChange: (data: string) =>
                                        optionsDispatcherDebounce({
                                            payload: { term: data },
                                            type: 'term',
                                        }),
                                    placeholder: 'Search',
                                    includeFilter: true,
                                },
                                columns: [
                                    ...MyPaymentHistory,
                                    ActionColumn({ ActionsHandlerMapping }),
                                ],
                                OtherTools: SearchTools,
                                data: data?.data ?? [],
                                pageCount: data?.pagination?.last_page ?? 1,
                                title: 'Payment History',
                                showPagination: true,
                                setPageSize: (pageSize) =>
                                    optionsDispatcher({
                                        payload: { pageSize },
                                        type: 'pageSize',
                                    }),
                                pageSize: data?.pagination?.per_page ?? 10,
                                page: data?.pagination?.current_page ?? 1,
                                isLoading: isLoading,
                            }}
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
