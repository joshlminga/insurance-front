import { ActionColumn } from '@/dev/columns';
import { CustomDialogComponent } from '@/dev/core';
import { CustomBaseTable, SearchTools } from '@/dev/table';
import {
    useCustomDialogContextFactory,
    useDebounce
} from '@/hooks';
import { UseApiQuery } from '@/hooks/hooks';
import {
    SingleActionsHandler,
    SubmitResponse,
    TFilterOptions,
    TPaginationFilters
} from '@/types/types';
import {
    FILTEROPTIONS,
    ReusableReducer
} from '@/utils/constatnts';
import { useReducer } from 'react'

const MotorProductTab = ({
    product
}: { product: any }) => {

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

    const { data, isLoading, refetch, isError } = UseApiQuery<SubmitResponse>({
        url: `finance/invoices?product=${product}`,
        params: {
            page: filter.page,
            pageSize: filter.pageSize,
            term: filter.term,
        },
        queryOptions: {
            enabled: true,
        },
    })

    //   const deleteOrganizationMutation = UseApiMutation<SubmitResponse, { id: number | string }>({
    //     url: ({ id }) => `organization/${id}`,
    //     method: EMETHODS.DELETE,
    //     mutationOptions: {
    //       onSuccess: (response) => {
    //         ShowToast.success(response?.message || 'Organization deleted successfully')
    //         refetch()
    //       },
    //       onError: (error) => {
    //         ShowToast.error(extractErrorMessage(error))
    //       },
    //     },
    //   })

    //   const toggleOrganizationStatusMutation = UseApiMutation<SubmitResponse, { id: number | string, is_active: boolean }>({
    //     url: ({ id }) => `organization/${id}/status`,
    //     method: EMETHODS.PATCH,
    //     mutationOptions: {
    //       onSuccess: (response) => {
    //         ShowToast.success(response?.message || 'Organization status updated successfully')
    //         refetch()
    //       },
    //       onError: (error) => {
    //         ShowToast.error(extractErrorMessage(error))
    //       },
    //     },
    //   })

    const ActionsHandlerMapping: SingleActionsHandler<any>[] = [
        // {
        //   label: 'View',
        //   onSelect: (data) => {
        //     handleDialogContextSwitch({
        //       componentProps: { data, refetch },
        //       Component: ViewOrganizationModal,
        //     })
        //   }
        // },
        // {
        //   label: 'Edit',
        //   onSelect: (data) => {
        //     handleDialogContextSwitch({
        //       componentProps: { data, refetch },
        //       Component: EditOrganizationModal,
        //     })
        //   },
        // },
        // {
        //   label: 'Delete',
        //   onSelect: (data) => {
        //     const id = data?.organization_id
        //     if (!id) return
        //     setDeleteTarget({
        //       id,
        //       label: data?.organization_name ?? 'this organization',
        //     })
        //   },
        //   conditional: (data) => Boolean(data?.organization_id),
        // },
        // {
        //   label: 'Deactivate',
        //   onSelect: (data) => {
        //     toggleOrganizationStatusMutation.mutate({
        //       is_active: false,
        //       id: data?.organization_id,
        //     })
        //   },
        //   conditional: (data) => Boolean(data?.organization_id) && Boolean(data?.is_active),
        // },
        // {
        //   label: 'Activate',
        //   onSelect: (data) => {
        //     toggleOrganizationStatusMutation.mutate({
        //       is_active: true,
        //       id: data?.organization_id,
        //     })
        //   },
        //   conditional: (data) => Boolean(data?.organization_id) && !Boolean(data?.is_active),
        // },
    ];

    return (
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
                        //   ...OrganizationsColumns,
                        ActionColumn({ ActionsHandlerMapping }),
                    ],
                    OtherTools: SearchTools,
                    data: data?.data ?? [],
                    pageCount: data?.pagination?.last_page ?? filter.page,
                    title: 'Invoices',
                    showPagination: true,
                    setPageSize: (pageSize) =>
                        optionsDispatcher({
                            payload: { pageSize },
                            type: 'pageSize',
                        }),
                    pageSize: data?.pagination?.per_page ?? filter?.pageSize,
                    page: data?.pagination?.current_page ?? filter?.page,
                    isLoading: isLoading,
                    isError: isError
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
export default MotorProductTab