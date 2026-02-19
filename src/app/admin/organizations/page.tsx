/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from '@/components/shared'
import { ActionColumn } from '@/dev/columns';
import { CustomBaseTable, SearchTools } from '@/dev/table'
import { useDebounce } from '@/hooks';
import { SingleActionsHandler, TFilterOptions, TPaginationFilters } from '@/types/types';
import { FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts';
import React, { useReducer } from 'react'

const OrganizationsPage = () => {

  const [filter, optionsDispatcher] = useReducer(
    ReusableReducer<TPaginationFilters & TFilterOptions>,
    { ...FILTEROPTIONS, page: 1, pageSize: 10 }
  );
  const optionsDispatcherDebounce = useDebounce({
    debounceCallback: optionsDispatcher,
  });

  const ActionsHandlerMapping: SingleActionsHandler<any>[] = [
  ];

  return (
    <div>
      <PageHeader
        title="Organizations"
        description="Manage organizations, their details, and associated users"
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
              // ...SuppliersColumns,
              ActionColumn({ ActionsHandlerMapping }),
            ],
            OtherTools: SearchTools,
            data: [],
            pageCount: 1,
            title: 'Organizations',
            showPagination: true,
            setPageSize: (pageSize) =>
              optionsDispatcher({
                payload: { pageSize },
                type: 'pageSize',
              }),
            pageSize: 10,
            page: 1,
          }}
        />
      </div>

    </div>
  )
}

export default OrganizationsPage