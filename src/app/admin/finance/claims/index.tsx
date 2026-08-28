/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from '@/components/shared';
import { ActionColumn } from '@/dev/columns';
import { CustomDialogComponent } from '@/dev/core';
import {
    CustomBaseTable,
    SearchTools
} from '@/dev/table';
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
import { Plus } from 'lucide-react';
import { useReducer } from 'react'

const ClaimsPage = () => {
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

    const { isLoading, refetch } = UseApiQuery<SubmitResponse>({
        url: '',
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
        <div>
            <PageHeader
                title="Claims"
                description="Manage Claims On Premiums"
                actions={[
                    {
                        icon: Plus,
                        label: 'Add Invoice',
                        variant: 'default',
                        onClick: () => {
                            handleDialogContextSwitch({
                                componentProps: { refetch },
                                // Component: '',
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
                            //   ...OrganizationsColumns,
                            ActionColumn({ ActionsHandlerMapping }),
                        ],
                        OtherTools: SearchTools,
                        data: [],
                        pageCount: filter.page,
                        title: 'Claims',
                        showPagination: true,
                        setPageSize: (pageSize) =>
                            optionsDispatcher({
                                payload: { pageSize },
                                type: 'pageSize',
                            }),
                        pageSize: filter?.pageSize,
                        page: filter?.page,
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

            {/* <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete organization?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. You are about to delete &quot;
              {deleteTarget?.label}&quot;. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: 'destructive' })}
              disabled={deleteOrganizationMutation.isPending}
              onClick={() => {
                if (!deleteTarget) return
                deleteOrganizationMutation.mutate({ id: deleteTarget.id })
              }}>
              {deleteOrganizationMutation.isPending ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}

        </div>
    )
}

export default ClaimsPage;