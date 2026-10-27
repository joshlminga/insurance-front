/* eslint-disable no-extra-boolean-cast */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from '@/components/shared'
import { Plus } from 'lucide-react'
import { CreateTravelProductModal } from './modals/create-product'
import { EditTravelProductModal } from './modals/edit-product'
import { ViewTravelProductModal } from './modals/view-product'
import { useCustomDialogContextFactory, useDebounce } from '@/hooks'
import { CustomDialogComponent } from '@/dev/core'
import { CustomBaseTable, SearchTools } from '@/dev/table'
import { SingleActionsHandler, SubmitResponse, TFilterOptions, TPaginationFilters } from '@/types/types'
import { EMETHODS, FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts'
import { useReducer } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActionColumn } from '@/dev/columns'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import { TravelProductsColumns } from '@/dev/columns/admin/products'
import { ShowToast } from '@/utils/utils'
import { extractErrorMessage } from '@/utils/helpers'
import { EPREFIX } from '@/utils/enums'

export const TravelProductsPage = () => {
    const navigate = useNavigate();
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
        url: 'products/travel',
        params: {
            page: filter.page,
            per_page: filter.pageSize,
            term: filter.term,
        },
        queryOptions: {
            enabled: true,
        },
    })

    const deleteTravelProductMutation = UseApiMutation<SubmitResponse, { id: number | string }>({
        url: ({ id }) => `products/travel/${id}`,
        method: EMETHODS.DELETE,
        mutationOptions: {
            onSuccess: (response) => {
                ShowToast.success(response?.message || 'Travel product deleted successfully')
                refetch()
            },
            onError: (error) => {
                ShowToast.error(extractErrorMessage(error))
            },
        },
    })

    const toggleTravelProductStatusMutation = UseApiMutation<SubmitResponse, { id: number | string, is_active: boolean }>({
        url: ({ id }) => `products/travel/${id}/status`,
        method: EMETHODS.PATCH,
        mutationOptions: {
            onSuccess: (response) => {
                ShowToast.success(response?.message || 'Travel product status updated successfully')
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
            onSelect: (row) => {
                handleDialogContextSwitch({
                    componentProps: { data: row, refetch },
                    Component: ViewTravelProductModal,
                })
            },
        },
        {
            label: 'View Rates',
            onSelect: (row) => {
                navigate(`/${EPREFIX.DASHBOARD}/${EPREFIX.PRODUCTS}/travel-rates/${row?.id}`)
            },
        },
        {
            label: 'View Benefits',
            onSelect: (row) => {
                navigate(`/${EPREFIX.DASHBOARD}/${EPREFIX.PRODUCTS}/travel-benefits/${row?.id}`)
            },
        },
        {
            label: 'Edit',
            onSelect: (row) => {
                handleDialogContextSwitch({
                    componentProps: { data: row, refetch },
                    Component: EditTravelProductModal,
                })
            },
        },
        {
            label: 'Delete',
            onSelect: (row) => {
                deleteTravelProductMutation.mutate({
                    id: row?.id,
                })
            },
            conditional: (row) => Boolean(row?.id),
        },
        {
            label: 'Deactivate',
            onSelect: (row) => {
                toggleTravelProductStatusMutation.mutate({
                    is_active: false,
                    id: row?.id,
                })
            },
            conditional: (row) => Boolean(row?.id) && Boolean(row?.is_active),
        },
        {
            label: 'Activate',
            onSelect: (row) => {
                toggleTravelProductStatusMutation.mutate({
                    is_active: true,
                    id: row?.id,
                })
            },
            conditional: (row) => Boolean(row?.id) && !Boolean(row?.is_active),
        },
    ];

    return (
        <div>
            <PageHeader
                title="Travel Products"
                description="Manage travel products, who can see them, and whether they use insurer APIs"
                actions={[
                    {
                        icon: Plus,
                        label: 'Add Travel Product',
                        variant: 'default',
                        onClick: () => {
                            handleDialogContextSwitch({
                                componentProps: { refetch },
                                Component: CreateTravelProductModal,
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
                                    payload: { term: data, page: 1 },
                                    type: 'term',
                                }),
                            placeholder: 'Search by name or insurer',
                            includeFilter: true,
                        },
                        columns: [
                            ...TravelProductsColumns,
                            ActionColumn({ ActionsHandlerMapping }),
                        ],
                        OtherTools: SearchTools,
                        data: data?.data?.products ?? [],
                        pageCount: data?.data?.pagination?.last_page ?? 1,
                        title: 'Travel Products',
                        showPagination: true,
                        // TEMP: show real product IDs in # column — remove later
                        showRowIds: true,
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
                className='sm:max-w-fit w-[95vw] sm:w-auto h-auto max-h-[80dvh]'>
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
