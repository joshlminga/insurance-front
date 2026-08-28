/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionColumn } from '@/dev/columns';
import { CustomDialogComponent, ReusableSelect } from '@/dev/core';
import {
    CustomBaseTable,
    SearchTools
} from '@/dev/table';
import {
    useCustomDialogContextFactory,
    useDebounce
} from '@/hooks';
import { UseApiQuery } from '@/hooks/hooks';
import {
    SingleActionsHandler,
    SubmitResponse,
    TFilterOptions,
    TPaginationFilters
} from '@/types/types';
import {
    CREDITTRANSACTIONFILTEROPTIONS,
    FILTEROPTIONS,
    ReusableReducer
} from '@/utils/constatnts';
import { useReducer } from 'react'
import { CREDIT_URLS } from '../../credit-query';
import { ECREDITTRANSACTIONS } from '@/types/enums';
import { CreditTransactionsAllColumns } from '@/dev/columns/admin/credit/transactions';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreditTransactionSchema } from '@/types/form-schema';
import { CreditTransactionForm } from '@/types/schema';

const AllTransactionsPage = ({
    canListAll
}: { canListAll: boolean }) => {
    const [filter, optionsDispatcher] = useReducer(
        ReusableReducer<TPaginationFilters & TFilterOptions & { status?: string; user_id?: string }>,
        { ...FILTEROPTIONS, page: 1, pageSize: 15, status: "", user_id: "" }
    );
    const optionsDispatcherDebounce = useDebounce({
        debounceCallback: optionsDispatcher,
    });

    const { handleDialogContextSwitch, dialogContent, dialogOpen } =
        useCustomDialogContextFactory<{
            refetch?: () => Promise<any>;
            data?: any;
        }>();

    const { control, watch } = useForm<CreditTransactionForm>({
        resolver:zodResolver(CreditTransactionSchema),
        defaultValues: {
            status: 'all',
        },
    })
    const status = watch('status')
    const { data, isLoading, isError } = UseApiQuery<SubmitResponse>({
        url: CREDIT_URLS.transactions,
        params: {
            page: filter.page,
            per_page: filter.pageSize,
            term: filter.term,
            status: status === 'all' ? undefined : status,
            user_id: filter.user_id || undefined,
        },
        queryOptions: {
            enabled: !!(ECREDITTRANSACTIONS.ALL_TRANSACTION === "all"),
        },
    })

    const ActionsHandlerMapping: SingleActionsHandler<any>[] = [];
    return (
        <div className='w-full space-y-5'>
            {canListAll && (
                <>            
                <div className="flex w-full justify-end">
                    <div className="w-55">
                        <ReusableSelect
                            label='Filter Options'
                            name="status"
                            control={control}
                            options={CREDITTRANSACTIONFILTEROPTIONS}
                        />
                    </div>
                </div>
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
                                    ...CreditTransactionsAllColumns,
                                    ActionColumn({ ActionsHandlerMapping }),
                                ],
                                OtherTools: SearchTools,
                                data: data?.data ?? [],
                                pageCount: data?.pagination?.last_page ?? filter.page,
                                title: 'All transactions',
                                showPagination: true,
                                setPageSize: (pageSize) =>
                                    optionsDispatcher({
                                        payload: { pageSize },
                                        type: 'pageSize',
                                    }),
                                pageSize: data?.pagination?.per_page ?? filter?.pageSize,
                                page: data?.pagination?.current_page ?? filter?.page,
                                isLoading: isLoading,
                                isError: isError
                            }}
                        />
                        <CustomDialogComponent
                            {...{ handleDialogContextSwitch, dialogOpen }}
                            className='sm:max-w-fit w-[95vw] sm:w-auto p-4 sm:p-6'>
                            {dialogContent?.Component && (
                                <dialogContent.Component
                                    {...{
                                        componentProps: dialogContent.componentProps,
                                        handleDialogContextSwitch,
                                    }}
                                />
                            )}
                        </CustomDialogComponent>
                    </div>
                </>
            )}
        </div>
    )
}
export default AllTransactionsPage;