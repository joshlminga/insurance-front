/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionColumn } from '@/dev/columns';
import { MyCoversColumns } from '@/dev/columns/customer/motor/my-covers';
import { CustomBaseTable } from '@/dev/table';
import { useDebounce } from '@/hooks';
import { UseApiQuery } from '@/hooks/hooks';
import { SingleActionsHandler, SubmitResponse, TFilterOptions, TPaginationFilters } from '@/types/types';
import { FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts';
import { useReducer } from 'react'

export const CustomerCoversPage = () => {

    const [filter, optionsDispatcher] = useReducer(
        ReusableReducer<TPaginationFilters & TFilterOptions>,
        { ...FILTEROPTIONS, page: 1, pageSize: 15 }
    );
    const optionsDispatcherDebounce = useDebounce({
        debounceCallback: optionsDispatcher,
    });

    const { data, isLoading } = UseApiQuery<SubmitResponse>({
        url: '',
        params: {
            page: filter.page,
            pageSize: filter.pageSize,
            term: filter.term,
        },
        queryOptions: {
            enabled: true,
        },
    })
    const ActionsHandlerMapping: SingleActionsHandler<any>[] = [];
    return (
        <section>
            <div className="grid grid-cols-1 lg:grid-cols-1">
                <div className="rounded-xl border border-[#EAEAEA] bg-white p-5 sm:p-8">
                    <h2 className="text-lg sm:text-xl font-bold text-[#111111] mb-1">
                        Covers Overview
                    </h2>
                    <p className="text-sm text-[#71717A] mb-5 sm:mb-6">
                        View and manage your covers.
                    </p>
                    <div>

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
                                    ...MyCoversColumns,
                                    ActionColumn({ ActionsHandlerMapping }),
                                ],
                                // OtherTools: SearchTools,
                                data: data?.data ?? [],
                                pageCount: data?.pagination?.last_page ?? 1,
                                title: '',
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
