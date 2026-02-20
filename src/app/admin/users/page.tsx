/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from '@/components/shared'
import { ActionColumn } from '@/dev/columns'
import { CustomDialogComponent } from '@/dev/core'
import { CustomBaseTable, SearchTools } from '@/dev/table'
import { useCustomDialogContextFactory, useDebounce } from '@/hooks'
import { SingleActionsHandler, SubmitResponse, TFilterOptions, TPaginationFilters } from '@/types/types'
import { FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts'
import { useReducer } from 'react'
import { CreateUserModal } from './modals/create'
import { UseApiQuery } from '@/hooks/hooks'
import { UsersColumns } from '@/dev/columns/admin/users'

export const UsersPage = () => {
    const [filter, optionsDispatcher] = useReducer(
        ReusableReducer<TPaginationFilters & TFilterOptions>,
        { ...FILTEROPTIONS, page: 1, pageSize: 10 }
    );
    const optionsDispatcherDebounce = useDebounce({
        debounceCallback: optionsDispatcher,
    });

    const { handleDialogContextSwitch, dialogContent, dialogOpen } =
        useCustomDialogContextFactory<{
            refetch?: () => Promise<any>;
            data?: any;
        }>();

    const { data, isLoading, refetch } = UseApiQuery<SubmitResponse>({
        url: 'user',
        params: {
            page: filter.page,
            pageSize: filter.pageSize,
        },
        queryOptions: {
            enabled: true,
        },
    })
    console.log("Users data:", data?.data?.users);

    const ActionsHandlerMapping: SingleActionsHandler<any>[] = []

    return (
        <div>
            <PageHeader
                title="Users"
                description="Manage users, their details, and associated users"
                actions={[
                    {
                        label: 'Add User',
                        variant: 'default',
                        onClick: () => {
                            handleDialogContextSwitch({
                                // componentProps: { refetch },
                                Component: CreateUserModal,
                            })
                        },
                    },
                ]}
            />

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
                              ...UsersColumns,
                            ActionColumn({ ActionsHandlerMapping }),
                        ],
                        OtherTools: SearchTools,
                        data: data?.data?.users ?? [],
                        pageCount: 1,
                        title: 'Users',
                        showPagination: true,
                        setPageSize: (pageSize) =>
                            optionsDispatcher({
                                payload: { pageSize },
                                type: 'pageSize',
                            }),
                        pageSize: 10,
                        page: 1,
                        // isLoading: isLoading,
                    }}
                />
            </div>

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
