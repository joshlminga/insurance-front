/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionColumn } from '@/dev/columns';
import { CustomBaseTable, SearchTools } from '@/dev/table';
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
    FILTEROPTIONS, 
    ReusableReducer 
} from '@/utils/constatnts';
import { useReducer } from 'react'
import { CREDIT_URLS } from '../../credit-query';
import { CustomDialogComponent } from '@/dev/core';
import { ECREDITTRANSACTIONS } from '@/types/enums';
import { CreditTransactionsMineColumns } from '@/dev/columns/admin/credit/transactions';

const MyTransactionsPage = () => {
    const [filter, optionsDispatcher] = useReducer(
        ReusableReducer<TPaginationFilters & TFilterOptions>,
        { ...FILTEROPTIONS, page: 1, pageSize: 15 }
    );
    const optionsDispatcherDebounce = useDebounce({
        debounceCallback: optionsDispatcher,
    });

    const { handleDialogContextSwitch, dialogContent, dialogOpen } =
        useCustomDialogContextFactory<{
            refetch?: () => Promise<any>;
            data?: any;
        }>();

    const { data, isLoading, isError } = UseApiQuery<SubmitResponse>({
        url: CREDIT_URLS.transactionsMine,
        params: {
            page: filter.page,
            pageSize: filter.pageSize,
            term: filter.term,
        },
        queryOptions: {
            enabled: !!(ECREDITTRANSACTIONS.MY_TRANSACTION === "mine"),
        },
    })

    const ActionsHandlerMapping: SingleActionsHandler<any>[] = [];
    return (
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
                        ...CreditTransactionsMineColumns,
                        ActionColumn({ ActionsHandlerMapping }),
                    ],
                    OtherTools: SearchTools,
                    data: data?.data ?? [],
                    pageCount: data?.pagination?.last_page ?? filter.page,
                    title: 'My transactions',
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
    )
}

export default MyTransactionsPage;