/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionColumn } from '@/dev/columns'
import { Button, CustomDialogComponent } from '@/dev/core'
import { CustomBaseTable, SearchTools } from '@/dev/table'
import { useCustomDialogContextFactory, useDebounce } from '@/hooks'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import { SingleActionsHandler, SubmitResponse, TFilterOptions, TPaginationFilters } from '@/types/types'
import { EMETHODS, FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { Plus } from 'lucide-react'
import { useReducer } from 'react'
import { EditMotorRateBenefits } from './edit-rate-benefits'
import { AddMotorRateExcessBenefits } from './add-excess-benefits'
import { MotorRateExcessBenefitsColumns } from '@/dev/columns/admin/motor-excess-benefits'

export const MotorRateExcessBenefitsPage = ({ componentProps }: {
    handleDialogContextSwitch: (context?: any) => void
    componentProps?: any
}) => {
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
        url: "products/motor/rate-details",
        params: {
            product_rate_id: componentProps?.data?.id,
            page: filter.page,
            pageSize: filter.pageSize,
            term: filter.term,
        },
        queryOptions: {
            enabled: true,
        },
    })

    const deleteMotorRateBenefitMutation = UseApiMutation<SubmitResponse, { id: number | string }>({
        url: ({ id }) => `products/motor/rate-details/${id}`,
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

    const toggleMotorRatesBenefitsStatusMutation = UseApiMutation<SubmitResponse, { id: number | string, is_active: boolean }>({
        url: ({ id }) => `products/motor/rate-details/${id}/status`,
        method: EMETHODS.PATCH,
        mutationOptions: {
            onSuccess: (response) => {
                ShowToast.success(response?.message || 'Motor rate benefit status updated successfully')
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
                    Component: EditMotorRateBenefits,
                })
            },
        },
        {
            label: 'Delete',
            onSelect: (data) => {
                deleteMotorRateBenefitMutation.mutate({
                    id: data?.id,
                })
            },
            conditional: (data) => Boolean(data?.id),
        },
        {
            label: 'Deactivate',
            onSelect: (data) => {
                toggleMotorRatesBenefitsStatusMutation.mutate({
                    is_active: false,
                    id: data?.id,
                })
            },
            conditional: (data) => Boolean(data?.id) && (data?.is_active),
        },
        {
            label: 'Activate',
            onSelect: (data) => {
                toggleMotorRatesBenefitsStatusMutation.mutate({
                    is_active: true,
                    id: data?.id,
                })
            },
            conditional: (data) => Boolean(data?.id) && !(data?.is_active),
        },
    ];
    return (
        <div className="w-full min-w-[800px] max-w-[800px] p-6 space-y-4">
            <div className="border-b pb-3 flex items-start gap-4">
                <div className="flex-1">
                    <h2 className="text-xl font-semibold">
                        {componentProps?.data?.product?.name} - Excess Benefits
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Fill in the details below to register a motor Excess benefits.
                    </p>
                </div>
                <Button
                    type="button"
                    leftIcon={<Plus />}
                    onClick={() => {
                        handleDialogContextSwitch({
                            componentProps: { data: componentProps?.data, refetch },
                            Component: AddMotorRateExcessBenefits,
                        })
                    }}
                    className="flex items-center justify-center">
                    Add Excess Benefits
                </Button>
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
                            ...MotorRateExcessBenefitsColumns,
                            ActionColumn({ ActionsHandlerMapping }),
                        ],
                        OtherTools: SearchTools,
                        data: data?.data ?? [],
                        pageCount: data?.pagination?.last_page ?? 1,
                        title: 'Motor Excess Benefits',
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
