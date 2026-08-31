/* eslint-disable no-extra-boolean-cast */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from '@/components/shared'
import { Plus } from 'lucide-react'
import { CreateProductModal } from './modals/create-product'
import { useCustomDialogContextFactory, useDebounce } from '@/hooks'
import { CustomDialogComponent } from '@/dev/core'
import { CustomBaseTable, SearchTools } from '@/dev/table'
import { SingleActionsHandler, SubmitResponse, TFilterOptions, TPaginationFilters } from '@/types/types'
import { EMETHODS, FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts'
import { useReducer } from 'react'
import { ActionColumn } from '@/dev/columns'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import { MotorProductsColumns } from '@/dev/columns/admin/products'
import { ShowToast } from '@/utils/utils'
import { extractErrorMessage } from '@/utils/helpers'
import { EditProductModal } from './modals/edit-product'
import { ViewProductModal } from './modals/view-product'
import { EPREFIX } from '@/utils/enums'

export const MotorProductPage = () => {

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
        url: 'products/motor',
        params: {
            page: filter.page,
            pageSize: filter.pageSize,
            term: filter.term,
        },
        queryOptions: {
            enabled: true,
        },
    })

    const deleteMotorProductMutation = UseApiMutation<SubmitResponse, { id: number | string }>({
        url: ({ id }) => `products/motor/${id}`,
        method: EMETHODS.DELETE,
        mutationOptions: {
            onSuccess: (response) => {
                ShowToast.success(response?.message || 'Motor product deleted successfully')
                refetch()
            },
            onError: (error) => {
                ShowToast.error(extractErrorMessage(error))
            },
        },
    })

    const toggleMotorProductActivateMutation = UseApiMutation<SubmitResponse, { id: number | string, is_active: boolean }>({
        url: ({ id }) => `products/motor/${id}/activate`,
        method: EMETHODS.PATCH,
        mutationOptions: {
            onSuccess: (response) => {
                ShowToast.success(response?.message || 'Motor product status updated successfully')
                refetch()
            },
            onError: (error) => {
                ShowToast.error(extractErrorMessage(error))
            },
        },
    })

    const toggleMotorProductDeactivateMutation = UseApiMutation<SubmitResponse, { id: number | string, is_active: boolean }>({
        url: ({ id }) => `products/motor/${id}/deactivate`,
        method: EMETHODS.PATCH,
        mutationOptions: {
            onSuccess: (response) => {
                ShowToast.success(response?.message || 'Motor product status updated successfully')
                refetch()
            },
            onError: (error) => {
                ShowToast.error(extractErrorMessage(error))
            },
        },
    })

    const ActionsHandlerMapping: SingleActionsHandler<any>[] = [
        {
            label: 'View Details',
            onSelect: (data) => {
                handleDialogContextSwitch({
                    componentProps: { data, refetch },
                    Component: ViewProductModal,
                })
            },
        },
        {
            label: 'View Rates',
            onSelect: (data) => {
                const path = `/${EPREFIX.DASHBOARD}/${EPREFIX.PRODUCTS}/motor-rates/${data?.id}`;
                window.open(path, '_blank', 'noopener,noreferrer');
                // navigate(`/${EPREFIX.DASHBOARD}/${EPREFIX.PRODUCTS}/motor-rates/${data?.id}`)
            },
        },
        {
            label: 'Edit',
            onSelect: (data) => {
                handleDialogContextSwitch({
                    componentProps: { data, refetch },
                    Component: EditProductModal,
                })
            },
        },
        {
            label: 'Delete',
            onSelect: (data) => {
                deleteMotorProductMutation.mutate({
                    id: data?.id,
                })
            },
            conditional: (data) => Boolean(data?.id),
        },
        {
            label: 'Deactivate',
            onSelect: (data) => {
                toggleMotorProductDeactivateMutation.mutate({
                    is_active: false,
                    id: data?.id,
                })
            },
            conditional: (data) => Boolean(data?.id) && Boolean(data?.is_active),
        },
        {
            label: 'Activate',
            onSelect: (data) => {
                toggleMotorProductActivateMutation.mutate({
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
                title="Motor Product"
                description="Manage motor products, their details, and associated products"
                actions={[
                    {
                        icon: Plus,
                        label: 'Add Motor Product',
                        variant: 'default',
                        onClick: () => {
                            handleDialogContextSwitch({
                                componentProps: { refetch },
                                Component: CreateProductModal,
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
                            ...MotorProductsColumns,
                            ActionColumn({ ActionsHandlerMapping }),
                        ],
                        OtherTools: SearchTools,
                        data: data?.data?.products ?? [],
                        pageCount: data?.data?.pagination?.last_page ?? 1,
                        title: 'Motor Products',
                        showPagination: true,
                        setPageSize: (pageSize) =>
                            optionsDispatcher({
                                payload: { pageSize },
                                type: 'pageSize',
                            }),
                        pageSize: data?.data?.pagination?.per_page ?? 10,
                        page: data?.data?.pagination?.current_page ?? 1,
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
