/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomBaseTable } from '@/dev/table'
import { ActionColumn } from '@/dev/columns'
import { SingleActionsHandler, TFilterOptions, TPaginationFilters } from '@/types/types'
import { useReducer } from 'react'
import { FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts'
import { MyCoversColumns } from '@/dev/columns/customer/motor/my-covers'
import { useDebounce } from '@/hooks'
import { myCoversTestData } from '@/utils/enums'

export function CoversPage() {
    const [filter, optionsDispatcher] = useReducer(
        ReusableReducer<TPaginationFilters & TFilterOptions>,
        { ...FILTEROPTIONS, page: 1, pageSize: 15 }
    );

    const optionsDispatcherDebounce = useDebounce({
        debounceCallback: optionsDispatcher,
    });


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
                        ...MyCoversColumns,
                        ActionColumn({ ActionsHandlerMapping }),
                    ],
                    // OtherTools: SearchTools,
                    data: myCoversTestData ?? [],
                    pageCount: 1,
                    title: 'Covers',
                    showPagination: true,
                    setPageSize: (pageSize) =>
                        optionsDispatcher({
                            payload: { pageSize },
                            type: 'pageSize',
                        }),
                    pageSize: filter.pageSize,
                    page: filter.page,
                    // isLoading: isLoading,
                }}
            />
        </div>
    )
}
