/* eslint-disable no-extra-boolean-cast */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from '@/components/shared';
import { ActionColumn } from '@/dev/columns';
import { VehicleUsesColumns } from '@/dev/columns/admin/vehicle-uses';
import { CustomDialogComponent } from '@/dev/core';
import { CustomBaseTable, SearchTools } from '@/dev/table';
import { useCustomDialogContextFactory, useDebounce } from '@/hooks';
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks';
import { SingleActionsHandler, SubmitResponse, TFilterOptions, TPaginationFilters } from '@/types/types';
import { EMETHODS, FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts';
import { extractErrorMessage } from '@/utils/helpers';
import { ShowToast } from '@/utils/utils';
import { Plus } from 'lucide-react';
import { useReducer } from 'react'
import { CreateVehicleUsesModal } from './modals/create-vehicle-use';
import { EditVehicleUseModal } from './modals/edit-vehicle-use';

export const VehicleUsePage = () => {
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

    const { data, isLoading, refetch } = UseApiQuery<SubmitResponse>({
        url: 'motor/vehicle-use',
        params: {
            page: filter.page,
            pageSize: filter.pageSize,
            term: filter.term,
        },
        queryOptions: {
            enabled: true,
        },
    })

    const deleteVehicleUsesMutation = UseApiMutation<SubmitResponse, { id: number | string }>({
        url: ({ id }) => `motor/vehicle-use/${id}`,
        method: EMETHODS.DELETE,
        mutationOptions: {
            onSuccess: (response) => {
                ShowToast.success(response?.message || 'Vehicle use deleted successfully')
                refetch()
            },
            onError: (error) => {
                ShowToast.error(extractErrorMessage(error))
            },
        },
    })

    const toggleVehicleUsesStatusMutation = UseApiMutation<SubmitResponse, { id: number | string, is_active: boolean }>({
        url: ({ id }) => `motor/vehicle-use/${id}/status`,
        method: EMETHODS.PATCH,
        mutationOptions: {
            onSuccess: (response) => {
                ShowToast.success(response?.message || 'Vehicle class status updated successfully')
                refetch()
            },
            onError: (error) => {
                ShowToast.error(extractErrorMessage(error))
            },
        },
    })

    const ActionsHandlerMapping: SingleActionsHandler<any>[] = [
        {
            label: 'Edit',
            onSelect: (data) => {
                handleDialogContextSwitch({
                    componentProps: { data, refetch },
                    Component: EditVehicleUseModal,
                })
            },
        },
        {
            label: 'Delete',
            onSelect: (data) => {
                deleteVehicleUsesMutation.mutate({
                    id: data?.id,
                })
            },
            conditional: (data) => Boolean(data?.id),
        },
        {
            label: 'Deactivate',
            onSelect: (data) => {
                toggleVehicleUsesStatusMutation.mutate({
                    is_active: false,
                    id: data?.id,
                })
            },
            conditional: (data) => Boolean(data?.id) && Boolean(data?.is_active),
        },
        {
            label: 'Activate',
            onSelect: (data) => {
                toggleVehicleUsesStatusMutation.mutate({
                    is_active: true,
                    id: data?.id,
                })
            },
            conditional: (data) => Boolean(data?.id) && !Boolean(data?.is_active),
        },
    ];

    const rawRows = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.data?.data)
            ? data.data.data
            : []

    const pagination = data?.pagination ?? data?.data?.pagination

    const tableRows = rawRows.map((item: any) => ({
        ...item,
        cover_for:
            item?.cover_for ??
            item?.coverFor ??
            item?.class ??
            (item?.parent_name
                ? { id: item?.parent_id, name: item?.parent_name }
                : item?.parent),
        covering: Array.isArray(item?.covering)
            ? item.covering
            : Array.isArray(item?.coverings)
                ? item.coverings
                : [],
        meta: item?.meta ?? { description: item?.description ?? "" },
    }))

    return (
        <div>
            <PageHeader
                title="Vehicle Uses"
                description="Manage Vehicle Uses, their details, and associated users"
                actions={[
                    {
                        icon: Plus,
                        label: 'Add Vehicle Uses',
                        variant: 'default',
                        onClick: () => {
                            handleDialogContextSwitch({
                                componentProps: { refetch },
                                Component: CreateVehicleUsesModal,
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
                            ...VehicleUsesColumns,
                            ActionColumn({ ActionsHandlerMapping }),
                        ],
                        OtherTools: SearchTools,
                        data: tableRows,
                        pageCount: pagination?.last_page ?? 1,
                        title: 'Vehicle Uses',
                        showPagination: true,
                        setPageSize: (pageSize) =>
                            optionsDispatcher({
                                payload: { pageSize },
                                type: 'pageSize',
                            }),
                        pageSize: pagination?.per_page ?? 10,
                        page: pagination?.current_page ?? 1,
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
