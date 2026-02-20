/* eslint-disable no-extra-boolean-cast */
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
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import { UsersColumns } from '@/dev/columns/admin/users'
import { EMETHODS } from '@/utils/constatnts'
import { ShowToast } from '@/utils/utils'
import { extractErrorMessage } from '@/utils/helpers'
import { EditUserModal } from './modals/edit'
import { ViewUserModal } from './modals/view'

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
            term: filter.term,
        },
        queryOptions: {
            enabled: true,
        },
    })

    const deleteUserMutation = UseApiMutation<SubmitResponse, { id: number | string }>({
        url: ({ id }) => `user/${id}`,
        method: EMETHODS.DELETE,
        mutationOptions: {
            onSuccess: (response) => {
                ShowToast.success(response?.message || 'User deleted successfully')
                refetch()
            },
            onError: (error) => {
                ShowToast.error(extractErrorMessage(error))
            },
        },
    })

    const toggleUserStatusMutation = UseApiMutation<SubmitResponse, { id: number | string; is_active: boolean }>({
        url: ({ id }) => `user/${id}/status`,
        method: EMETHODS.PATCH,
        mutationOptions: {
            onSuccess: (response) => {
                ShowToast.success(response?.message || 'User status updated successfully')
                refetch()
            },
            onError: (error) => {
                ShowToast.error(extractErrorMessage(error))
            },
        },
    })
    
    const ActionsHandlerMapping: SingleActionsHandler<any>[] = [
        {
            label: "View Details",
            onSelect: (data) => {
                handleDialogContextSwitch({
                    componentProps: { data, refetch },
                    Component: ViewUserModal,
                })
            },
        },
        {
            label: "Edit",
            onSelect: (data) => {
                handleDialogContextSwitch({
                    componentProps: { data, refetch },
                     Component: EditUserModal,
                })
            },
        },
         {
            label: "Delete",
            onSelect: (data) => {
                const id = data?.user_id ?? data?.id
                if (!id) return
                deleteUserMutation.mutate({
                    id,
                })
            },
            conditional:(data) => Boolean(data?.user_id ?? data?.id),
        },
        {
            label: "Deactivate",
            onSelect: (data) => {
                const id = data?.user_id ?? data?.id
                if (!id) return
                toggleUserStatusMutation.mutate({
                    id,
                    is_active: false,
                })
            },
            conditional:(data) => Boolean(data?.user_id ?? data?.id) && Boolean(data?.is_active),
        },
        {
            label: "Activate",
            onSelect: (data) => {
                const id = data?.user_id ?? data?.id
                if (!id) return
                toggleUserStatusMutation.mutate({
                    id,
                    is_active: true,
                })
            },
            conditional:(data) => Boolean(data?.user_id ?? data?.id) && !Boolean(data?.is_active),
        }
    ]

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
                                componentProps: { refetch },
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
                        pageCount:
                            data?.data?.totalPages ??
                            data?.data?.total_pages ??
                            data?.data?.pagination?.totalPages ??
                            data?.data?.pagination?.total_pages ??
                            1,
                        title: 'Users',
                        showPagination: true,
                        setPageSize: (pageSize) =>
                            optionsDispatcher({
                                payload: { pageSize },
                                type: 'pageSize',
                            }),
                        pageSize: filter.pageSize,
                        page: filter.page,
                        isLoading: isLoading,
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
