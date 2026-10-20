/* eslint-disable @typescript-eslint/no-explicit-any */
import { useBypassOrgLocation } from '@/auth/use-bypass-org-location'
import { useCan } from '@/auth/useCan'
import { MODULES } from '@/auth/module-keys'
import {
  BypassOrgLocationPicker,
  EmptyState,
  PageHeader,
} from '@/components/shared'
import { Card } from '@/components/ui/card'
import { ActionColumn } from '@/dev/columns'
import { DmvicStockColumns } from '@/dev/columns/admin/dmvic-stock'
import { CustomDialogComponent } from '@/dev/core'
import { CustomBaseTable, SearchTools } from '@/dev/table'
import { useCustomDialogContextFactory, useDebounce } from '@/hooks'
import {
  UseApiMutation,
  UseApiQuery
} from '@/hooks/hooks'
import type {
  DmvicBrokerStockRow,
  SingleActionsHandler,
  SubmitResponse,
  TFilterOptions,
  TPaginationFilters,
} from '@/types/types'
import {
  EMETHODS,
  FILTEROPTIONS,
  ReusableReducer
} from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { EROUTES } from '@/utils/enums'
import { ShowToast } from '@/utils/utils'
import { Building2, Plus } from 'lucide-react'
import { useReducer } from 'react'
import { useNavigate } from 'react-router-dom'
import { DMVIC_STOCK_ORG_STORAGE_KEY } from './dmvic-stock-org'
import { CreateDmvicStockModal } from './modals/create-stock'
import { EditDmvicStockModal } from './modals/edit-stock'

/**
 * DMVIC Policy Numbers list.
 * Broker org is chosen via the header picker (X-Organization-Location-Id).
 * Insurer office is chosen only on create/edit forms (insurer_location_id).
 */
export function DmvicStockPage() {
  const navigate = useNavigate()
  const { canModuleAction } = useCan()
  const canCreate = canModuleAction(MODULES.DMVIC_STOCK, 'create')
  const canUpdate = canModuleAction(MODULES.DMVIC_STOCK, 'update')
  const canDelete = canModuleAction(MODULES.DMVIC_STOCK, 'delete')
  const canAction = canModuleAction(MODULES.DMVIC_STOCK, 'action')
  const canRead = canModuleAction(MODULES.DMVIC_STOCK, 'read')

  const {
    isBypass,
    selectedLocationId,
    setLocationId,
    orgContextHeaders,
    canFetch,
    allowedLocationIds,
  } = useBypassOrgLocation(DMVIC_STOCK_ORG_STORAGE_KEY)

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
      orgContextHeaders?: Record<string, string>
    }>()

  const { data, isLoading, refetch, isError } = UseApiQuery<SubmitResponse>({
    url: 'dmvic/stocks',
    queryKey: ['dmvic/stocks', filter, selectedLocationId || null],
    params: {
      page: filter.page,
      sort_by: 'id',
      direction: 'desc',
      term: filter.term,
    },
    config: orgContextHeaders ? { headers: orgContextHeaders } : undefined,
    // Wait until a broker org is selected (super admin / multi-location).
    queryOptions: { enabled: canFetch },
  })

  const deleteMutation = UseApiMutation<SubmitResponse, { id: number | string }>({
    url: ({ id }) => `dmvic/stocks/${id}`,
    method: EMETHODS.DELETE,
    config: orgContextHeaders ? { headers: orgContextHeaders } : undefined,
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
    { id: number | string; is_active: boolean }>({
      url: ({ id }) => `dmvic/stocks/${id}/status`,
      method: EMETHODS.PATCH,
      config: orgContextHeaders ? { headers: orgContextHeaders } : undefined,
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

  const openCreateModal = () => {
    handleDialogContextSwitch({
      componentProps: { refetch, orgContextHeaders },
      Component: CreateDmvicStockModal,
    })
  }

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
          componentProps: { data: row, refetch, orgContextHeaders },
          Component: EditDmvicStockModal,
        })
      },
      conditional: () => canUpdate,
    },
    {
      label: 'Deactivate',
      onSelect: (row) => statusMutation.mutate({ id: row.id, is_active: false }),
      conditional: (row) => canAction && !!(row.is_active),
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Policy Numbers"
        description="Manage certificate inventory per insurer office and configure policy-number rules."
        actions={
          canCreate && canFetch
            ? [
              {
                icon: Plus,
                label: 'Add Stock',
                variant: 'default' as const,
                onClick: openCreateModal,
              },
            ]
            : undefined
        }
      />

      {isBypass ? (
        <Card className="shadow-none p-6">
          <BypassOrgLocationPicker
            value={selectedLocationId}
            onChange={setLocationId}
            allowedLocationIds={allowedLocationIds}
            hint="Stock list and create/edit are scoped to the selected broker organization."
          />
        </Card>
      ) : null}

      {!canFetch ? (
        <EmptyState
          icon={Building2}
          title="Select an organization location"
          description="Choose a broker organization above before loading DMVIC stock."
        />
      ) : (
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
                ...DmvicStockColumns,
                ActionColumn({ ActionsHandlerMapping }),
              ],
              OtherTools: SearchTools,
              data: data?.data ?? [],
              pageCount: data?.pagination?.last_page ?? 1,
              title: 'Policy Numbers',
              showPagination: true,
              setPageSize: (pageSize) =>
                optionsDispatcher({
                  payload: { pageSize },
                  type: 'pageSize',
                }),
              pageSize: data?.pagination?.per_page ?? STOCK_PAGE_SIZE,
              page: data?.pagination?.current_page ?? filter.page,
              isLoading: isLoading,
              isError: isError
            }}
          />
        </div>
      )}

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

export default DmvicStockPage
