/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from '@/components/shared';
import { ActionColumn } from '@/dev/columns';
import { MotorAddOnBenefitsColumns } from '@/dev/columns/admin/motor-addon-benefits';
import { CustomDialogComponent } from '@/dev/core';
import { CustomBaseTable, SearchTools } from '@/dev/table';
import { useCustomDialogContextFactory, useDebounce } from '@/hooks';
import { UseApiQuery } from '@/hooks/hooks';
import { SingleActionsHandler, SubmitResponse, TFilterOptions, TPaginationFilters } from '@/types/types';
import { FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts';
import { Plus } from 'lucide-react';
import { useReducer } from 'react'
import { CreateMotorAddonBenefitsModal } from './modals/create-addons';

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

    // const deleteCoverTypeMutation = UseApiMutation<SubmitResponse, { id: number | string }>({
    //     url: ({ id }) => `motor/cover-type/${id}`,
    //     method: EMETHODS.DELETE,
    //     mutationOptions: {
    //         onSuccess: (response) => {
    //             ShowToast.success(response?.message || 'Cover Type deleted successfully')
    //             refetch()
    //         },
    //         onError: (error) => {
    //             ShowToast.error(extractErrorMessage(error))
    //         },
    //     },
    // })

    // const toggleCovertypeStatusMutation = UseApiMutation<SubmitResponse, { id: number | string, is_active: boolean }>({
    //     url: ({ id }) => `motor/cover-type/${id}/status`,
    //     method: EMETHODS.PATCH,
    //     mutationOptions: {
    //         onSuccess: (response) => {
    //             ShowToast.success(response?.message || 'Cover Type status updated successfully')
    //             refetch()
    //         },
    //         onError: (error) => {
    //             ShowToast.error(extractErrorMessage(error))
    //         },
    //     },
    // })

    const ActionsHandlerMapping: SingleActionsHandler<any>[] = [
        // {
        //     label: 'Edit',
        //     onSelect: (data) => {
        //         handleDialogContextSwitch({
        //             componentProps: { data, refetch },
        //             Component: EditCoverTypesModal,
        //         })
        //     },
        // },
        // {
        //     label: 'Delete',
        //     onSelect: (data) => {
        //         deleteCoverTypeMutation.mutate({
        //             id: data?.id,
        //         })
        //     },
        //     conditional: (data) => Boolean(data?.id),
        // },
        // {
        //     label: 'Deactivate',
        //     onSelect: (data) => {
        //         toggleCovertypeStatusMutation.mutate({
        //             is_active: false,
        //             id: data?.id,
        //         })
        //     },
        //     conditional: (data) => Boolean(data?.id) && Boolean(data?.is_active),
        // },
        // {
        //     label: 'Activate',
        //     onSelect: (data) => {
        //         toggleCovertypeStatusMutation.mutate({
        //             is_active: true,
        //             id: data?.id,
        //         })
        //     },
        //     conditional: (data) => Boolean(data?.id) && !Boolean(data?.is_active),
        // },
    ];

    return (
        <div>
            <PageHeader
                title="Motor AddOn Benefits"
                description="Manage Motor AddOn Benefits, their details, and associated users"
                actions={[
                    {
                        icon: Plus,
                        label: 'Add Motor AddOn Benefits',
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
                        title: 'Motor AddOn Benefits',
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
