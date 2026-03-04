/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from '@/components/shared';
import { ActionColumn } from '@/dev/columns';
import { CustomDialogComponent } from '@/dev/core';
import { CustomBaseTable, SearchTools } from '@/dev/table';
import { useCustomDialogContextFactory, useDebounce } from '@/hooks';
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks';
import { SingleActionsHandler, SubmitResponse, TFilterOptions, TPaginationFilters } from '@/types/types';
import { EMETHODS, FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts';
// import { extractErrorMessage } from '@/utils/helpers';
// import { ShowToast } from '@/utils/utils';
import { Plus } from 'lucide-react';
import { useReducer } from 'react'
import { useParams } from 'react-router-dom';
import { AddMotorProductRatesPage } from './modals/add-rates';
import { MotorRateColumns } from '@/dev/columns/admin/motor-rates';
import { ShowToast } from '@/utils/utils';
import { extractErrorMessage } from '@/utils/helpers';
import { EditMotorProductRatesPage } from './modals/edit-rates';
import { MotorRateBenefitsPage } from './modals/rate-benefits';

export const MotorProductRatesPage = () => {
    const { slung } = useParams();
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
        url: `products/motor/rates/${slung}`,
        params: {
            page: filter.page,
            pageSize: filter.pageSize,
            term: filter.term,
        },
        queryOptions: {
            enabled: !!slung,
        },
    })

    const deleteMotorRateMutation = UseApiMutation<SubmitResponse, { id: number | string }>({
        url: ({ id }) => `products/motor/rates/${slung}/${id}`,
        method: EMETHODS.DELETE,
        mutationOptions: {
            onSuccess: (response) => {
                ShowToast.success(response?.message || 'Cover Type deleted successfully')
                refetch()
            },
            onError: (error) => {
                ShowToast.error(extractErrorMessage(error))
            },
        },
    })

    const toggleMotorRatesStatusMutation = UseApiMutation<SubmitResponse, { id: number | string, is_active: boolean }>({
        url: ({ id }) => `products/motor/rates/${slung}/${id}/status`,
        method: EMETHODS.PATCH,
        mutationOptions: {
            onSuccess: (response) => {
                ShowToast.success(response?.message || 'Motor rate status updated successfully')
                refetch()
            },
            onError: (error) => {
                ShowToast.error(extractErrorMessage(error))
            },
        },
    })

    const toggleMotorRatesDuplicateStatusMutation = UseApiMutation<SubmitResponse, { id: number | string, is_active: boolean }>({
        url: ({ id }) => `products/motor/rates/${slung}/copy/${id}`,
        method: EMETHODS.POST,
        mutationOptions: {
            onSuccess: (response) => {
                ShowToast.success(response?.message || 'Motor rate status updated successfully')
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
                    Component: EditMotorProductRatesPage,
                })
            },
        },
        {
            label: 'Duplicate',
            onSelect: (data) => {
                toggleMotorRatesDuplicateStatusMutation.mutate({
                    is_active: true,
                    id: data?.id,
                })
            },
        },
        {
            label: 'Delete',
            onSelect: (data) => {
                deleteMotorRateMutation.mutate({
                    id: data?.id,
                })
            },
            conditional: (data) => Boolean(data?.id),
        },
        {
            label: 'Deactivate',
            onSelect: (data) => {
                toggleMotorRatesStatusMutation.mutate({
                    is_active: false,
                    id: data?.id,
                })
            },
            conditional: (data) => Boolean(data?.id) && (data?.is_active),
        },
        {
            label: 'Activate',
            onSelect: (data) => {
                toggleMotorRatesStatusMutation.mutate({
                    is_active: true,
                    id: data?.id,
                })
            },
            conditional: (data) => Boolean(data?.id) && !(data?.is_active),
        },
         {
            label: 'Optional Benefits',
            onSelect: (data) => {
                handleDialogContextSwitch({
                    componentProps: { data, refetch },
                    Component: MotorRateBenefitsPage,
                })
            },
        },
    ];

    return (
        <div>
            <PageHeader
                title="Motor Product Rates"
                description="Manage Motor Product Rates, their details, and associated users"
                actions={[
                    {
                        icon: Plus,
                        label: 'Add Motor Product Rates',
                        variant: 'default',
                        onClick: () => {
                            handleDialogContextSwitch({
                                componentProps: { refetch },
                                Component: AddMotorProductRatesPage,
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
                            ...MotorRateColumns,
                            ActionColumn({ ActionsHandlerMapping }),
                        ],
                        OtherTools: SearchTools,
                        data: data?.data ?? [],
                        pageCount: data?.pagination?.last_page ?? 1,
                        title: 'Motor Product Rates',
                        showPagination: true,
                        setPageSize: (pageSize) =>
                            optionsDispatcher({
                                payload: { pageSize },
                                type: 'pageSize',
                            }),
                        pageSize: data?.pagination?.per_page ?? filter?.pageSize,
                        page: data?.pagination?.current_page ?? filter?.page,
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
