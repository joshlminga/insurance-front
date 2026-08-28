/* eslint-disable no-extra-boolean-cast */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionColumn } from '@/dev/columns';
import { LocationUsersColumns } from '@/dev/columns/admin/users';
import { CustomBaseTable } from '@/dev/table';
import { useCustomDialogContextFactory, useDebounce } from '@/hooks';
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks';
import { SingleActionsHandler, SubmitResponse, TFilterOptions, TPaginationFilters } from '@/types/types';
import { EMETHODS, FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts';
import { extractErrorMessage } from '@/utils/helpers';
import { ShowToast } from '@/utils/utils';
import { useReducer } from 'react'
import { ViewUserModal } from '../../users/modals/view';
import { CustomDialogComponent } from '@/dev/core';
import { EditUserModal } from '../../users/modals/edit';

export const ViewMemberLocationModal = ({ componentProps }: {
    handleDialogContextSwitch: (context?: any) => void,
    componentProps?: { data?: Record<string, any> }
}) => {

    const [filter, optionsDispatcher] = useReducer(
        ReusableReducer<TPaginationFilters & TFilterOptions>,
        { ...FILTEROPTIONS, page: 1, pageSize: 100 }
    );

    const { handleDialogContextSwitch, dialogContent, dialogOpen } =
        useCustomDialogContextFactory<{
            refetch?: () => Promise<any>;
            data?: any;
        }>();

    const optionsDispatcherDebounce = useDebounce({
        debounceCallback: optionsDispatcher,
    });

    const { data, isLoading, refetch } = UseApiQuery<SubmitResponse>({
        url: `admin/organization-location-member-list?organization_location_id=${componentProps?.data}`,
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
                const id = data?.id ?? data?.id
                if (!id) return
                deleteUserMutation.mutate({
                    id,
                })
            },
            conditional: (data) => Boolean(data?.id ?? data?.id),
        },
        {
            label: "Deactivate",
            onSelect: (data) => {
                const id = data?.id ?? data?.id
                if (!id) return
                toggleUserStatusMutation.mutate({
                    id,
                    is_active: false,
                })
            },
            conditional: (data) => Boolean(data?.id ?? data?.id) && Boolean(data?.is_active),
        },
        {
            label: "Activate",
            onSelect: (data) => {
                const id = data?.id ?? data?.id
                if (!id) return
                toggleUserStatusMutation.mutate({
                    id,
                    is_active: true,
                })
            },
            conditional: (data) => Boolean(data?.id ?? data?.id) && !Boolean(data?.is_active),
        }
    ]

    return (
        <div className="w-full min-w-150 max-w-200 p-6 space-y-6">
            <div className="border-b pb-3">
                <h2 className="text-xl font-semibold">Members Per Organization Location</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    View members associated with this organization location.
                </p>
            </div>
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
                        ...LocationUsersColumns,
                        ActionColumn({ ActionsHandlerMapping }),
                    ],
                    // OtherTools: SearchTools,
                    data: data?.data?.members ?? [],
                    pageCount: 1,
                    title: '',
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
