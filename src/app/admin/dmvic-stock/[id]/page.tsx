/* eslint-disable @typescript-eslint/no-explicit-any */
import { useBypassOrgLocation } from '@/auth/use-bypass-org-location'
import { useCan } from '@/auth/useCan'
import { MODULES } from '@/auth/module-keys'
import {
  EmptyState,
  PageHeader,
} from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { ActionColumn } from '@/dev/columns'
import {
  DmvicPolicyNumberRuleColumns
} from '@/dev/columns/admin/dmvic-policy-number-rules'
import { CustomDialogComponent } from '@/dev/core'
import { CustomBaseTable } from '@/dev/table'
import {
  useCustomDialogContextFactory,
  useDebounce
} from '@/hooks'
import {
  UseApiMutation,
  UseApiQuery
} from '@/hooks/hooks'
import type {
  DmvicBrokerStockRow,
  DmvicPolicyNumberPreview,
  DmvicPolicyNumberRuleRow,
  SingleActionsHandler,
  SubmitResponse,
  TFilterOptions,
  TPaginationFilters
} from '@/types/types'
import {
  dmvicCertificateTypeLabel,
  EMETHODS,
  FILTEROPTIONS,
  ReusableReducer
} from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { EROUTES } from '@/utils/enums'
import { formatDmvicOrganizationLocation, ShowToast } from '@/utils/utils'
import { Building2, Plus } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { useReducer } from 'react'
import { DMVIC_STOCK_ORG_STORAGE_KEY } from '../dmvic-stock-org'
import { CreateDmvicPolicyNumberRuleModal } from '../modals/create-rule'
import { EditDmvicPolicyNumberRuleModal } from '../modals/edit-rule'

/**
 * One stock’s policy-number rules.
 * Broker org is the one stored on Policy Numbers (same localStorage key) and is
 * sent as X-Organization-Location-Id. This page does not show another picker.
 */
export function DmvicStockDetailPage() {
  const [filter, optionsDispatcher] = useReducer(
    ReusableReducer<TPaginationFilters & TFilterOptions>,
    { ...FILTEROPTIONS, page: 1, pageSize: 10 },
  )

  const { id } = useParams<{ id: string }>()
  const stockId = Number(id)

  const { canModuleAction } = useCan()
  const canCreate = canModuleAction(MODULES.DMVIC_STOCK, 'create')
  const canUpdate = canModuleAction(MODULES.DMVIC_STOCK, 'update')
  const canAction = canModuleAction(MODULES.DMVIC_STOCK, 'action')

  const {
    selectedLocationId,
    orgContextHeaders,
    canFetch,
  } = useBypassOrgLocation(DMVIC_STOCK_ORG_STORAGE_KEY)

  const { handleDialogContextSwitch, dialogContent, dialogOpen } =
    useCustomDialogContextFactory<{
      refetch?: () => Promise<any>
      stockId?: number
      data?: DmvicPolicyNumberRuleRow
      orgContextHeaders?: Record<string, string>
    }>()
  const optionsDispatcherDebounce = useDebounce({
    debounceCallback: optionsDispatcher,
  })

  const stockEnabled = canFetch && Number.isFinite(stockId) && stockId > 0

  const { data: stockResponse, isLoading: stockLoading, refetch: refetchStock, } = UseApiQuery<SubmitResponse>({
    url: `dmvic/stocks/${stockId}`,
    queryKey: ['dmvic/stocks', stockId, selectedLocationId || null],
    config: orgContextHeaders ? { headers: orgContextHeaders } : undefined,
    queryOptions: {
      enabled: stockEnabled,
    },
  })

  const { data: previewResponse, isLoading: previewLoading, refetch: refetchPreview, } = UseApiQuery<SubmitResponse>({
    url: `dmvic/stocks/${stockId}/policy-numbers`,
    queryKey: ['dmvic/stocks', stockId, 'policy-numbers', selectedLocationId || null],
    config: orgContextHeaders ? { headers: orgContextHeaders } : undefined,
    queryOptions: {
      enabled: stockEnabled,
    },
  })

  const { data: rulesResponse, isLoading: rulesLoading, refetch: refetchRules, isError: isErrorRules } = UseApiQuery<SubmitResponse>({
    url: 'dmvic/policy-number-rules',
    queryKey: ['dmvic/policy-number-rules', stockId, filter, selectedLocationId || null],
    params: {
      dmvic_stock_id: stockId,
      page: filter.page,
      per_page: filter?.pageSize,
      sort_by: 'id',
      direction: 'desc',
    },
    config: orgContextHeaders ? { headers: orgContextHeaders } : undefined,
    queryOptions: {
      enabled: stockEnabled,
    },
  })

  const stock = stockResponse?.data as DmvicBrokerStockRow | undefined
  const preview = previewResponse?.data as DmvicPolicyNumberPreview | undefined
  // Header still shows the insurer office (what the stock screen is about).
  const locationLabel = formatDmvicOrganizationLocation(stock?.insurer_location)
  const refetchAll = async () => {
    await Promise.all([refetchStock(), refetchPreview(), refetchRules()])
  }

  const statusMutation = UseApiMutation<
    SubmitResponse,
    { id: number | string; is_active: boolean }>({
      url: ({ id: ruleId }) => `dmvic/policy-number-rules/${ruleId}`,
      method: EMETHODS.PATCH,
      config: orgContextHeaders ? { headers: orgContextHeaders } : undefined,
      mutationOptions: {
        onSuccess: (response) => {
          ShowToast.success(response?.message || 'Rule status updated')
          refetchAll()
        },
        onError: (error) => {
          ShowToast.error(extractErrorMessage(error))
        },
      },
    })

  const ActionsHandlerMapping: SingleActionsHandler<DmvicPolicyNumberRuleRow>[] = [
    {
      label: 'Edit',
      onSelect: (row) => {
        handleDialogContextSwitch({
          componentProps: { data: row, refetch: refetchAll, orgContextHeaders },
          Component: EditDmvicPolicyNumberRuleModal,
        })
      },
      conditional: () => canUpdate,
    },
    {
      label: 'Deactivate',
      onSelect: (row) => statusMutation.mutate({ id: row.id, is_active: false }),
      conditional: (row) => canAction && row.is_active,
    },
    {
      label: 'Activate',
      onSelect: (row) => statusMutation.mutate({ id: row.id, is_active: true }),
      conditional: (row) => canAction && !row.is_active,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stocks"
        description={`${locationLabel} · ${dmvicCertificateTypeLabel(stock?.type_of_certificate)} · Remaining: ${stock?.stock ?? 0}`}
        actions={
          canCreate && canFetch
            ? [
              {
                icon: Plus,
                label: 'Add Policy Rule',
                onClick: () => {
                  handleDialogContextSwitch({
                    componentProps: { stockId, refetch: refetchAll, orgContextHeaders },
                    Component: CreateDmvicPolicyNumberRuleModal,
                  })
                },
              },
            ]
            : undefined
        }
      />

      {!canFetch ? (
        <EmptyState
          icon={Building2}
          title="Select an organization location"
          description="Choose a broker organization on Policy Numbers before opening this stock."
          action={{
            label: 'Back to Policy Numbers',
            href: EROUTES.DMVIC_STOCK,
          }}
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Policy number preview</CardTitle>
            </CardHeader>
            <CardContent>
              {previewLoading ? (
                <p className="text-sm text-muted-foreground">Loading preview…</p>
              ) : preview ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <PreviewField label="Current" value={preview.current_policy_number ?? '-'} />
                  <PreviewField label="Next" value={preview.next_policy_number} />
                  <PreviewField label="Cover" value={preview.cover_policy_number} />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Remaining</p>
                    <p className="font-semibold mt-1">{preview.remaining}</p>
                    {preview.is_exhausted ? (
                      <Badge className="mt-2 bg-amber-100 text-amber-900">Exhausted</Badge>
                    ) : (
                      <Badge className="mt-2 bg-green-100 text-green-800">Available</Badge>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No active policy rule for this stock. Add a rule to seed certificates and start the
                  numbering sequence.
                </p>
              )}
            </CardContent>
          </Card>
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
                  ...DmvicPolicyNumberRuleColumns,
                  ActionColumn({ ActionsHandlerMapping }),
                ],
                data: rulesResponse?.data ?? [],
                pageCount: rulesResponse?.pagination?.last_page ?? 1,
                title: 'Rules',
                showPagination: true,
                setPageSize: (pageSize) =>
                  optionsDispatcher({
                    payload: { pageSize },
                    type: 'pageSize',
                  }),
                pageSize: rulesResponse?.pagination?.per_page ?? filter?.pageSize,
                page: rulesResponse?.pagination?.current_page ?? filter.page,
                isLoading: rulesLoading || stockLoading,
                isError: isErrorRules
              }}
            />
          </div>
        </>
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

function PreviewField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="font-mono font-semibold mt-1 break-all">{value}</p>
    </div>
  )
}

export default DmvicStockDetailPage
