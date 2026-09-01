/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCan } from '@/auth/useCan'
import { MODULES } from '@/auth/module-keys'
import { PageHeader } from '@/components/shared'
import { ActionColumn } from '@/dev/columns'
import { DmvicStockColumns } from '@/dev/columns/admin/dmvic-stock'
import { CustomDialogComponent } from '@/dev/core'
import { CustomBaseTable, SearchTools } from '@/dev/table'
import { useCustomDialogContextFactory, useDebounce } from '@/hooks'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import type {
  SingleActionsHandler,
  SubmitResponse,
  TFilterOptions,
  TPaginationFilters,
} from '@/types/types'
import { EMETHODS, FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { EROUTES } from '@/utils/enums'
import { ShowToast } from '@/utils/utils'
import { Plus } from 'lucide-react'
import { useReducer } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DMVIC_STOCK_URLS,
  type DmvicBrokerStockRow,
} from './dmvic-stock-query'
import { CreateDmvicStockModal } from './modals/create-stock'
import { EditDmvicStockModal } from './modals/edit-stock'

/** List DMVIC broker stocks — each row links to policy-number rules on the detail page. */
export function DmvicStockPage() {
  const navigate = useNavigate()
  const { canModuleAction } = useCan()
  const canCreate = canModuleAction(MODULES.DMVIC_STOCK, 'create')
  const canUpdate = canModuleAction(MODULES.DMVIC_STOCK, 'update')
  const canDelete = canModuleAction(MODULES.DMVIC_STOCK, 'delete')
  const canAction = canModuleAction(MODULES.DMVIC_STOCK, 'action')
  const canRead = canModuleAction(MODULES.DMVIC_STOCK, 'read')

  const STOCK_PAGE_SIZE = 10

  const [filter, optionsDispatcher] = useReducer(
    ReusableReducer<TPaginationFilters & TFilterOptions>,
    { ...FILTEROPTIONS, page: 1, pageSize: STOCK_PAGE_SIZE },
  )
  const optionsDispatcherDebounce = useDebounce({
    debounceCallback: optionsDispatcher,
  })

  const { handleDialogContextSwitch, dialogContent, dialogOpen } =
    useCustomDialogContextFactory<{
      refetch?: () => Promise<any>
      data?: DmvicBrokerStockRow
    }>()

  const { data, isLoading, refetch } = UseApiQuery<SubmitResponse>({
    url: DMVIC_STOCK_URLS.list,
    params: {
      page: filter.page,
      sort_by: 'id',
      direction: 'desc',
      term: filter.term,
    },
  })

  const deleteMutation = UseApiMutation<SubmitResponse, { id: number | string }>({
    url: ({ id }) => DMVIC_STOCK_URLS.delete(id),
    method: EMETHODS.DELETE,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response?.message || 'Stock deleted successfully')
        refetch()
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const statusMutation = UseApiMutation<
    SubmitResponse,
    { id: number | string; is_active: boolean }
  >({
    url: ({ id }) => DMVIC_STOCK_URLS.status(id),
    method: EMETHODS.PATCH,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response?.message || 'Stock status updated')
        refetch()
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const ActionsHandlerMapping: SingleActionsHandler<DmvicBrokerStockRow>[] = [
    {
      label: 'View rules',
      onSelect: (row) => navigate(`${EROUTES.DMVIC_STOCK}/${row.id}`),
      conditional: () => canRead,
    },
    {
      label: 'Edit',
      onSelect: (row) => {
        handleDialogContextSwitch({
          componentProps: { data: row, refetch },
          Component: EditDmvicStockModal,
        })
      },
      conditional: () => canUpdate,
    },
    {
      label: 'Deactivate',
      onSelect: (row) => statusMutation.mutate({ id: row.id, is_active: false }),
      conditional: (row) => canAction && Boolean(row.is_active),
    },
    {
      label: 'Activate',
      onSelect: (row) => statusMutation.mutate({ id: row.id, is_active: true }),
      conditional: (row) => canAction && !row.is_active,
    },
    {
      label: 'Delete',
      onSelect: (row) => deleteMutation.mutate({ id: row.id }),
      conditional: () => canDelete,
    },
  ]

  const rawRows = (Array.isArray(data?.data) ? data.data : []) as DmvicBrokerStockRow[]
  const pagination = data?.pagination

  return (
    <div className="space-y-6">
      <PageHeader
        title="Policy Numbers"
        description="Manage certificate inventory per insurer office and configure policy-number rules."
        actions={
          canCreate
            ? [
                {
                  icon: Plus,
                  label: 'Add Stock',
                  variant: 'default' as const,
                  onClick: () => {
                    handleDialogContextSwitch({
                      componentProps: { refetch },
                      Component: CreateDmvicStockModal,
                    })
                  },
                },
              ]
            : undefined
        }
      />

      <CustomBaseTable
        {...{
          onPageChange: (page) =>
            optionsDispatcher({
              payload: { page },
              type: 'page',
            }),
          OtherToolsProps: {
            onChange: (term: string) =>
              optionsDispatcherDebounce({
                payload: { term, page: 1 },
                type: 'term',
              }),
            placeholder: 'Search by organization or location',
            includeFilter: true,
          },
          columns: [...DmvicStockColumns, ActionColumn({ ActionsHandlerMapping })],
          OtherTools: SearchTools,
          data: rawRows,
          pageCount: pagination?.last_page ?? 1,
          title: 'DMVIC Stocks',
          showPagination: true,
          pageSize: pagination?.per_page ?? STOCK_PAGE_SIZE,
          page: pagination?.current_page ?? filter.page,
          isLoading,
        }}
      />

      <CustomDialogComponent
        {...{ handleDialogContextSwitch, dialogOpen }}
        className="sm:max-w-fit w-[95vw] sm:w-auto p-4 sm:p-6"
      >
        {dialogContent?.Component ? (
          <dialogContent.Component
            componentProps={dialogContent.componentProps}
            handleDialogContextSwitch={handleDialogContextSwitch}
          />
        ) : null}
      </CustomDialogComponent>
    </div>
  )
}

export default DmvicStockPage
