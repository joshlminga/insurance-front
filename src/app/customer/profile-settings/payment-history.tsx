/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionColumn } from '@/dev/columns';
import { MyPaymentHistory } from '@/dev/columns/customer/motor/payment-history';
import { CustomBaseTable } from '@/dev/table';
import { useDebounce } from '@/hooks';
import { UseApiQuery } from '@/hooks/hooks';
import { SingleActionsHandler, SubmitResponse, TFilterOptions, TPaginationFilters } from '@/types/types';
import { FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts';
import { Eye } from 'lucide-react';
import { useReducer } from 'react'

const PaymentHistoryPage = () => {
    const [filter, optionsDispatcher] = useReducer(
        ReusableReducer<TPaginationFilters & TFilterOptions>,
        { ...FILTEROPTIONS, page: 1, pageSize: 15 }
    );
    const optionsDispatcherDebounce = useDebounce({
        debounceCallback: optionsDispatcher,
    });

    const { data, isLoading } = UseApiQuery<SubmitResponse>({
        url: 'reports/motor/user/transactions',
        params: {
            page: filter.page,
            pageSize: filter.pageSize,
            term: filter.term,
        },
        queryOptions: {
            enabled: true,
        },
    })
    const ActionsHandlerMapping: SingleActionsHandler<any>[] = [
        {
            label: 'View',
            icon: Eye,
            onSelect: (data) => {
                console.log(data);
                // handleDialogContextSwitch({
                //   componentProps: { data, refetch },
                //   Component: ViewOrganizationModal,
                // })
            }
        },
    ];

    return (
        <section>
            <div className="grid grid-cols-1 lg:grid-cols-1">
                <div className="rounded-xl border border-[#EAEAEA] bg-white p-5 sm:p-8">
                    <h2 className="text-lg sm:text-xl font-bold text-[#111111] mb-1">
                        Payment History
                    </h2>
                    <p className="text-sm text-[#71717A] mb-5 sm:mb-6">
                        View payment history and receipts.
                    </p>

                    <div className='w-full'>
                        <CustomBaseTable
                            {...{
                                onPageChange: (page) =>
                                    optionsDispatcher({
                                        payload: { page },
                                        type: 'page',
                                    }),
                                OtherToolsProps: {
                                    onChange: (data: any) =>
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
                                // OtherTools: SearchTools,
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

export default PaymentHistoryPage;