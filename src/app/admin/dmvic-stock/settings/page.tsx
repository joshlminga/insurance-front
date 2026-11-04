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
import { DmvicOrganizationSettingColumns } from '@/dev/columns/admin/dmvic-organization-settings'
import { CustomDialogComponent } from '@/dev/core'
import { CustomBaseTable } from '@/dev/table'
import { useCustomDialogContextFactory, useDebounce } from '@/hooks'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import type {
  DmvicOrganizationSettingRow,
  SingleActionsHandler,
  SubmitResponse,
  TFilterOptions,
  TPaginationFilters,
} from '@/types/types'
import {
  EMETHODS,
  FILTEROPTIONS,
  ReusableReducer,
} from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { Building2, Plus } from 'lucide-react'
import { useReducer } from 'react'
import { DMVIC_STOCK_ORG_STORAGE_KEY } from '../dmvic-stock-org'
import { UpsertDmvicOrganizationSettingModal } from '../modals/upsert-setting'

/**
 * DMVIC Settings — per product, choose own credentials or another org's.
 * Broker org comes from the header picker (same as Stock list).
 */
export function DmvicStockSettingsPage() {
  const { canModuleAction } = useCan()
  const canManage = canModuleAction(MODULES.DMVIC_STOCK, 'settings')

  const {
    isBypass,
    selectedLocationId,
    setLocationId,
    orgContextHeaders,
    canFetch,
    allowedLocationIds,
  } = useBypassOrgLocation(DMVIC_STOCK_ORG_STORAGE_KEY)

  const [filter, optionsDispatcher] = useReducer(
    ReusableReducer<TPaginationFilters & TFilterOptions>,
    { ...FILTEROPTIONS, page: 1, pageSize: 20 },
  )
  const optionsDispatcherDebounce = useDebounce({
    debounceCallback: optionsDispatcher,
  })

  const { handleDialogContextSwitch, dialogContent, dialogOpen } =
    useCustomDialogContextFactory<{
      refetch?: () => Promise<any>
      data?: DmvicOrganizationSettingRow
      orgContextHeaders?: Record<string, string>
      currentOrganizationLocationId?: number | null
    }>()

  const { data, isLoading, refetch, isError } = UseApiQuery<SubmitResponse>({
    url: 'dmvic/settings',
    queryKey: ['dmvic/settings', filter, selectedLocationId || null],
    params: {
      page: filter.page,
      per_page: filter.pageSize,
      sort_by: 'product',
      direction: 'asc',
    },
    config: orgContextHeaders ? { headers: orgContextHeaders } : undefined,
    queryOptions: { enabled: canFetch && canManage },
  })

  const deleteMutation = UseApiMutation<SubmitResponse, { id: number | string }>({
    url: ({ id }) => `dmvic/settings/${id}`,
    method: EMETHODS.DELETE,
    config: orgContextHeaders ? { headers: orgContextHeaders } : undefined,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response?.message || 'Setting deleted')
        refetch()
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const openCreateModal = () => {
    handleDialogContextSwitch({
      componentProps: {
        refetch,
        orgContextHeaders,
        currentOrganizationLocationId: selectedLocationId
          ? Number(selectedLocationId)
          : null,
      },
      Component: UpsertDmvicOrganizationSettingModal,
    })
  }

  const pageHeaderActions = [
    ...(canManage && canFetch
      ? [
          {
            icon: Plus,
            label: 'Add setting',
            variant: 'default' as const,
            onClick: openCreateModal,
          },
        ]
      : []),
  ]

  const ActionsHandlerMapping: SingleActionsHandler<DmvicOrganizationSettingRow>[] = [
    {
      label: 'Edit',
      onSelect: (row) => {
        handleDialogContextSwitch({
          componentProps: {
            data: row,
            refetch,
            orgContextHeaders,
            currentOrganizationLocationId: selectedLocationId
              ? Number(selectedLocationId)
              : null,
          },
          Component: UpsertDmvicOrganizationSettingModal,
        })
      },
      conditional: () => canManage,
    },
    {
      label: 'Delete',
      onSelect: (row) => deleteMutation.mutate({ id: row.id }),
      conditional: () => canManage,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="DMVIC Settings"
        description="Per product, use this organization's DMVIC stock and tokens, or delegate to another organization."
        actions={pageHeaderActions.length > 0 ? pageHeaderActions : undefined}
      />

      {isBypass ? (
        <Card className="shadow-none p-6">
          <BypassOrgLocationPicker
            value={selectedLocationId}
            onChange={setLocationId}
            allowedLocationIds={allowedLocationIds}
            hint="Settings are scoped to the selected organization location."
          />
        </Card>
      ) : null}

      {!canFetch ? (
        <EmptyState
          icon={Building2}
          title="Select an organization location"
          description="Choose an organization above before loading DMVIC settings."
        />
      ) : (
        <div className="w-full">
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
                includeFilter: false,
              },
              columns: [
                ...DmvicOrganizationSettingColumns,
                ActionColumn({
                  ActionsHandlerMapping,
                }),
              ],
              data: data?.data ?? [],
              pageCount: data?.pagination?.last_page ?? 1,
              title: 'DMVIC Settings',
              showPagination: true,
              setPageSize: (pageSize) =>
                optionsDispatcher({
                  payload: { pageSize },
                  type: 'pageSize',
                }),
              pageSize: data?.pagination?.per_page ?? 20,
              page: data?.pagination?.current_page ?? filter.page,
              isLoading: isLoading,
              isError: isError,
            }}
          />
        </div>
      )}

      <CustomDialogComponent
        {...{ handleDialogContextSwitch, dialogOpen }}
        className="sm:max-w-fit w-[95vw] sm:w-auto p-4 sm:p-6"
      >
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

export default DmvicStockSettingsPage
