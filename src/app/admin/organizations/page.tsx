/* eslint-disable no-extra-boolean-cast */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from '@/components/shared'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { buttonVariants } from '@/components/ui/button'
import { ActionColumn } from '@/dev/columns';
import { CustomDialogComponent } from '@/dev/core';
import { CustomBaseTable, SearchTools } from '@/dev/table'
import { useCustomDialogContextFactory, useDebounce } from '@/hooks';
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks';
import { SingleActionsHandler, SubmitResponse, TFilterOptions, TPaginationFilters } from '@/types/types';
import { FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts';
import { useReducer, useState } from 'react'
import CreateOrganizationModal from './modals/create';
import { OrganizationsColumns } from '@/dev/columns/admin/organizations';
import { EditOrganizationModal } from './modals/edit';
import { EMETHODS } from '@/utils/constatnts';
import { ShowToast } from '@/utils/utils';
import { extractErrorMessage } from '@/utils/helpers';
import { ViewOrganizationModal } from './modals/view';
import { Plus } from 'lucide-react';

const OrganizationsPage = () => {
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number | string
    label: string
  } | null>(null)

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
    url: 'admin/organization',
    params: {
      page: filter.page,
      pageSize: filter.pageSize,
      term: filter.term,
    },
    queryOptions: {
      enabled: true,
    },
  })

  const deleteOrganizationMutation = UseApiMutation<SubmitResponse, { id: number | string }>({
    url: ({ id }) => `organization/${id}`,
    method: EMETHODS.DELETE,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response?.message || 'Organization deleted successfully')
        refetch()
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const toggleOrganizationStatusMutation = UseApiMutation<SubmitResponse, { id: number | string, is_active: boolean }>({
    url: ({ id }) => `organization/${id}/status`,
    method: EMETHODS.PATCH,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response?.message || 'Organization status updated successfully')
        refetch()
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const ActionsHandlerMapping: SingleActionsHandler<any>[] = [
    {
      label: 'View',
      onSelect: (data) => {
        handleDialogContextSwitch({
          componentProps: { data, refetch },
          Component: ViewOrganizationModal,
        })
      }
    },
    {
      label: 'Edit',
      onSelect: (data) => {
        handleDialogContextSwitch({
          componentProps: { data, refetch },
          Component: EditOrganizationModal,
        })
      },
    },
    {
      label: 'Delete',
      onSelect: (data) => {
        const id = data?.organization_id
        if (!id) return
        setDeleteTarget({
          id,
          label: data?.organization_name ?? 'this organization',
        })
      },
      conditional: (data) => Boolean(data?.organization_id),
    },
    {
      label: 'Deactivate',
      onSelect: (data) => {
        toggleOrganizationStatusMutation.mutate({
          is_active: false,
          id: data?.organization_id,
        })
      },
      conditional: (data) => Boolean(data?.organization_id) && Boolean(data?.is_active),
    },
    {
      label: 'Activate',
      onSelect: (data) => {
        toggleOrganizationStatusMutation.mutate({
          is_active: true,
          id: data?.organization_id,
        })
      },
      conditional: (data) => Boolean(data?.organization_id) && !Boolean(data?.is_active),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Organizations"
        description="Manage organizations, their details, and associated Admins"
        actions={[
          {
            icon: Plus,
            label: 'Add Organization',
            variant: 'default',
            onClick: () => {
              handleDialogContextSwitch({
                componentProps: { refetch },
                Component: CreateOrganizationModal,
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
              ...OrganizationsColumns,
              ActionColumn({ ActionsHandlerMapping }),
            ],
            OtherTools: SearchTools,
            data: data?.data?.organizations ?? [],
            pageCount: data?.data?.pagination?.last_page ?? 1,
            title: 'Organizations',
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

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
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
              }}
            >
              {deleteOrganizationMutation.isPending ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
export default OrganizationsPage
