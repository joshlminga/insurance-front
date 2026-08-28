/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from '@/components/shared';
import { ActionColumn } from '@/dev/columns';
import { CustomDialogComponent } from '@/dev/core';
import { CustomBaseTable, SearchTools } from '@/dev/table';
import { useCustomDialogContextFactory, useDebounce } from '@/hooks';
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks';
import {
  SingleActionsHandler,
  SubmitResponse,
  TFilterOptions,
  TPaginationFilters
} from '@/types/types';
import {
  EMETHODS,
  FILTEROPTIONS,
  ReusableReducer
} from '@/utils/constatnts';
import { Plus } from 'lucide-react';
import { useReducer } from 'react'
import { CreateParameter } from './modals/create';
import { ParametersColumns } from '@/dev/columns/admin/finance/parameters';
import { ShowToast } from '@/utils/utils';
import { extractErrorMessage } from '@/utils/helpers';
import { EditParameter } from './modals/edit';

const FinanceParametersIndexPage = () => {
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
    url: 'finance/parameters',
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

  const toggleOrganizationStatusMutation = UseApiMutation<SubmitResponse, { id: number | string, is_active: boolean }>({
    url: ({ id }) => `finance/parameters/${id}/status`,
    method: EMETHODS.PATCH,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response?.message || 'Parameter status updated successfully')
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
          Component: EditParameter,
        })
      },
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
      conditional: (data) => Boolean(data?.organization_id) && !data?.is_active,
    },
  ];
  return (
    <div>
      <PageHeader
        title="Finance Parameters"
        description="Manage Finance Parameters (Commissions, Premiums etc.)"
        actions={[
          {
            icon: Plus,
            label: 'Add Parameter',
            variant: 'default',
            onClick: () => {
              handleDialogContextSwitch({
                componentProps: { refetch },
                Component: CreateParameter,
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
              ...ParametersColumns,
              ActionColumn({ ActionsHandlerMapping }),
            ],
            OtherTools: SearchTools,
            data: data?.data ?? [],
            pageCount: data?.pagination?.last_page ?? filter.page,
            title: 'Finance Parameters',
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

export default FinanceParametersIndexPage;