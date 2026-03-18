/* eslint-disable no-extra-boolean-cast */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from '@/components/shared';
import { ActionColumn } from '@/dev/columns';
import { MotorAddOnBenefitsColumns } from '@/dev/columns/admin/motor-addon-benefits';
import { CustomDialogComponent } from '@/dev/core';
import { CustomBaseTable, SearchTools } from '@/dev/table';
import { useCustomDialogContextFactory, useDebounce } from '@/hooks';
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks';
import { SingleActionsHandler, SubmitResponse, TFilterOptions, TPaginationFilters } from '@/types/types';
import { EMETHODS, FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts';
import { Plus } from 'lucide-react';
import { useReducer } from 'react'
import { CreateMotorAddonBenefitsModal } from './modals/create-addons';
import { extractErrorMessage } from '@/utils/helpers';
import { ShowToast } from '@/utils/utils';
import { EditMotorAddonsBenefitsModal } from './modals/edit-addons';

export const MotorAddonBenefitsPage = () => {
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
        url: 'motor/addon-benefit',
        params: {
            page: filter.page,
            pageSize: filter.pageSize,
            term: filter.term,
        },
        queryOptions: {
            enabled: true,
        },
    })

    const deleteAddOnBenefitMutation = UseApiMutation<SubmitResponse, { id: number | string }>({
        url: ({ id }) => `motor/addon-benefit/${id}`,
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

    const toggleAddOnBenefitStatusMutation = UseApiMutation<SubmitResponse, { id: number | string, is_active: boolean }>({
        url: ({ id }) => `motor/addon-benefit/${id}/status`,
        method: EMETHODS.PATCH,
        mutationOptions: {
            onSuccess: (response) => {
                ShowToast.success(response?.message || 'AddOn Benefit status updated successfully')
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
                    Component: EditMotorAddonsBenefitsModal,
                })
            },
        },
        {
            label: 'Delete',
            onSelect: (data) => {
                deleteAddOnBenefitMutation.mutate({
                    id: data?.id,
                })
            },
            conditional: (data) => Boolean(data?.id),
        },
        {
            label: 'Deactivate',
            onSelect: (data) => {
                toggleAddOnBenefitStatusMutation.mutate({
                    is_active: false,
                    id: data?.id,
                })
            },
            conditional: (data) => Boolean(data?.id) && Boolean(data?.is_active),
        },
        {
            label: 'Activate',
            onSelect: (data) => {
                toggleAddOnBenefitStatusMutation.mutate({
                    is_active: true,
                    id: data?.id,
                })
            },
            conditional: (data) => Boolean(data?.id) && !Boolean(data?.is_active),
        },
    ];

    return (
        <div>
            <PageHeader
                title="Motor Add-on Benefits"
                description="Manage Motor Add-on Benefits, their details, and associated users"
                actions={[
                    {
                        icon: Plus,
                        label: 'Add Motor Add-on Benefits',
                        variant: 'default',
                        onClick: () => {
                            handleDialogContextSwitch({
                                componentProps: { refetch },
                                Component: CreateMotorAddonBenefitsModal,
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
                            ...MotorAddOnBenefitsColumns,
                            ActionColumn({ ActionsHandlerMapping }),
                        ],
                        OtherTools: SearchTools,
                        data: data?.data ?? [],
                        pageCount: data?.pagination?.last_page ?? 1,
                        title: 'Motor Add-On Benefits',
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
