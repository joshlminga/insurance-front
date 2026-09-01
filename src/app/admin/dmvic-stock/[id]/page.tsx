/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCan } from '@/auth/useCan'
import { MODULES } from '@/auth/module-keys'
import { PageHeader } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ActionColumn } from '@/dev/columns'
import { DmvicPolicyNumberRuleColumns } from '@/dev/columns/admin/dmvic-policy-number-rules'
import { CustomDialogComponent } from '@/dev/core'
import { CustomBaseTable } from '@/dev/table'
import { useCustomDialogContextFactory } from '@/hooks'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import type { SingleActionsHandler, SubmitResponse } from '@/types/types'
import { dmvicCertificateTypeLabel, EMETHODS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { Plus } from 'lucide-react'
import { useParams } from 'react-router-dom'
import {
  DMVIC_POLICY_RULE_URLS,
  DMVIC_STOCK_URLS,
  formatDmvicOrganizationLocation,
  type DmvicBrokerStockRow,
  type DmvicPolicyNumberPreview,
  type DmvicPolicyNumberRuleRow,
} from '../dmvic-stock-query'
import { CreateDmvicPolicyNumberRuleModal } from '../modals/create-rule'
import { EditDmvicPolicyNumberRuleModal } from '../modals/edit-rule'

/** Stock detail — preview current/next policy numbers and manage numbering rules. */
export function DmvicStockDetailPage() {
  const { id } = useParams<{ id: string }>()
  const stockId = Number(id)
  const { canModuleAction } = useCan()
  const canCreate = canModuleAction(MODULES.DMVIC_STOCK, 'create')
  const canUpdate = canModuleAction(MODULES.DMVIC_STOCK, 'update')
  const canAction = canModuleAction(MODULES.DMVIC_STOCK, 'action')

  const { handleDialogContextSwitch, dialogContent, dialogOpen } =
    useCustomDialogContextFactory<{
      refetch?: () => Promise<any>
      stockId?: number
      data?: DmvicPolicyNumberRuleRow
    }>()

  const {
    data: stockResponse,
    isLoading: stockLoading,
    refetch: refetchStock,
  } = UseApiQuery<SubmitResponse>({
    url: DMVIC_STOCK_URLS.show(stockId),
    queryOptions: { enabled: Number.isFinite(stockId) && stockId > 0 },
  })

  const {
    data: previewResponse,
    isLoading: previewLoading,
    refetch: refetchPreview,
  } = UseApiQuery<SubmitResponse>({
    url: DMVIC_STOCK_URLS.policyNumbers(stockId),
    queryOptions: { enabled: Number.isFinite(stockId) && stockId > 0 },
  })

  const {
    data: rulesResponse,
    isLoading: rulesLoading,
    refetch: refetchRules,
  } = UseApiQuery<SubmitResponse>({
    url: DMVIC_POLICY_RULE_URLS.list,
    params: {
      dmvic_stock_id: stockId,
      per_page: 50,
      sort_by: 'id',
      direction: 'desc',
    },
    queryOptions: { enabled: Number.isFinite(stockId) && stockId > 0 },
  })

  const stock = stockResponse?.data as DmvicBrokerStockRow | undefined
  const preview = previewResponse?.data as DmvicPolicyNumberPreview | undefined
  const rules = (Array.isArray(rulesResponse?.data)
    ? rulesResponse.data
    : []) as DmvicPolicyNumberRuleRow[]

  const locationLabel = formatDmvicOrganizationLocation(stock?.organization_location)

  const refetchAll = async () => {
    await Promise.all([refetchStock(), refetchPreview(), refetchRules()])
  }

  const statusMutation = UseApiMutation<
    SubmitResponse,
    { id: number | string; is_active: boolean }
  >({
    url: ({ id: ruleId }) => DMVIC_POLICY_RULE_URLS.status(ruleId),
    method: EMETHODS.PATCH,
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
          componentProps: { data: row, refetch: refetchAll },
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

  if (!Number.isFinite(stockId) || stockId <= 0) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Invalid stock ID.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Stock #${stockId}`}
        description={`${locationLabel} · ${dmvicCertificateTypeLabel(stock?.type_of_certificate)} · Remaining: ${stock?.stock ?? 0}`}
        actions={
          canCreate
            ? [
                {
                  icon: Plus,
                  label: 'Add Policy Rule',
                  variant: 'default' as const,
                  onClick: () => {
                    handleDialogContextSwitch({
                      componentProps: { stockId, refetch: refetchAll },
                      Component: CreateDmvicPolicyNumberRuleModal,
                    })
                  },
                },
              ]
            : undefined
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Policy number preview</CardTitle>
        </CardHeader>
        <CardContent>
          {previewLoading ? (
            <p className="text-sm text-muted-foreground">Loading preview…</p>
          ) : preview ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <PreviewField label="Current" value={preview.current_policy_number ?? '—'} />
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

      <CustomBaseTable
        {...{
          columns: [...DmvicPolicyNumberRuleColumns, ActionColumn({ ActionsHandlerMapping })],
          data: rules,
          pageCount: 1,
          title: 'Policy number rules',
          showPagination: false,
          pageSize: rules.length || 10,
          page: 1,
          isLoading: rulesLoading || stockLoading,
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

function PreviewField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="font-mono font-semibold mt-1 break-all">{value}</p>
    </div>
  )
}

export default DmvicStockDetailPage
