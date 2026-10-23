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
import { Building2, Plus, RefreshCw } from 'lucide-react'
import { useEffect, useReducer, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DMVIC_STOCK_ORG_STORAGE_KEY } from './dmvic-stock-org'
import { CreateDmvicStockModal } from './modals/create-stock'
import { EditDmvicStockModal } from './modals/edit-stock'

/** How long Sync stays disabled after a successful queue (seconds). */
const SYNC_COOLDOWN_MS = 120_000

/**
 * DMVIC Stock list — inventory, sync, create/edit.
 * Broker org is chosen via the header picker (X-Organization-Location-Id).
 * Insurer office is chosen only on create/edit forms (insurer_location_id).
 * Jump to policy-number rules from a row via "View rules".
 * After Sync succeeds, the button stays disabled for 120 seconds (no status polling).
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

  // Local cooldown so Sync cannot be clicked again for 120s after a successful submit.
  const [orgSyncCooldown, setOrgSyncCooldown] = useState(false)
  const [entrySyncCooldownIds, setEntrySyncCooldownIds] = useState<number[]>([])

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

  // Clear org cooldown after 120s, then refresh the stock table once.
  useEffect(() => {
    if (!orgSyncCooldown) {
      return
    }
    const timer = window.setTimeout(() => {
      setOrgSyncCooldown(false)
      void refetch()
    }, SYNC_COOLDOWN_MS)
    return () => window.clearTimeout(timer)
  }, [orgSyncCooldown, refetch])

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

  // Starts one background job that syncs every insurer member id for this broker org.
  // After success, hold the button for 120 seconds (email confirms when the job finishes).
  const syncMutation = UseApiMutation<SubmitResponse, Record<string, never>>({
    url: 'dmvic/stocks/sync',
    method: EMETHODS.POST,
    config: orgContextHeaders ? { headers: orgContextHeaders } : undefined,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(
          response?.message ||
            'DMVIC stock sync has started for this organization. You will be emailed when it finishes.',
        )
        setOrgSyncCooldown(true)
      },
      onError: (error: any) => {
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

  const syncBusy = syncMutation.isPending || orgSyncCooldown

  // Build header actions: Sync (queues refresh) + Add Stock when allowed.
  const pageHeaderActions = [
    ...(canAction && canFetch
      ? [
          {
            icon: RefreshCw,
            label: syncBusy ? 'Syncing…' : 'Sync stock',
            variant: 'outline' as const,
            // Red outline so Sync stands out from Add Stock.
            className:
              'border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive',
            disabled: syncBusy,
            onClick: () => {
              if (syncBusy) {
                return
              }
              syncMutation.mutate({})
            },
          },
        ]
      : []),
    ...(canCreate && canFetch
      ? [
          {
            icon: Plus,
            label: 'Add Stock',
            variant: 'default' as const,
            onClick: openCreateModal,
          },
        ]
      : []),
  ]

  // Sync one insurer office only (uses that row's stock entry id).
  const syncEntryMutation = UseApiMutation<
    SubmitResponse,
    { id: number | string }
  >({
    url: ({ id }) => `dmvic/stocks/${id}/sync`,
    method: EMETHODS.POST,
    config: orgContextHeaders ? { headers: orgContextHeaders } : undefined,
    mutationOptions: {
      onSuccess: (response, variables) => {
        ShowToast.success(
          response?.message ||
            'DMVIC stock sync has started for this insurer. You will be emailed when it finishes.',
        )
        const entryId = Number(variables.id)
        setEntrySyncCooldownIds((prev) =>
          prev.includes(entryId) ? prev : [...prev, entryId],
        )
        window.setTimeout(() => {
          setEntrySyncCooldownIds((prev) => prev.filter((id) => id !== entryId))
          void refetch()
        }, SYNC_COOLDOWN_MS)
      },
      onError: (error: any) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const isEntryOnCooldown = (row: DmvicBrokerStockRow): boolean => {
    if (orgSyncCooldown) {
      return true
    }
    return entrySyncCooldownIds.includes(Number(row.id))
  }

  const ActionsHandlerMapping: SingleActionsHandler<DmvicBrokerStockRow>[] = [
    {
      label: 'View rules',
      onSelect: (row) => navigate(`${EROUTES.DMVIC_STOCK}/${row.id}`),
      conditional: () => canRead,
    },
    {
      label: 'Sync',
      onSelect: (row) => {
        if (isEntryOnCooldown(row) || syncEntryMutation.isPending) {
          return
        }
        syncEntryMutation.mutate({ id: row.id })
      },
      // Hide row Sync while org cooldown or this row's 120s hold is active.
      conditional: (row) => canAction && !isEntryOnCooldown(row) && !syncEntryMutation.isPending,
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
        title="Stock list"
        description="Manage certificate inventory per insurer office. Open a row to jump to its policy-number rules."
        actions={pageHeaderActions.length > 0 ? pageHeaderActions : undefined}
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
                ActionColumn({
                  ActionsHandlerMapping,
                }),
              ],
              OtherTools: SearchTools,
              data: data?.data ?? [],
              pageCount: data?.pagination?.last_page ?? 1,
              title: 'Stock list',
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
