/* eslint-disable @typescript-eslint/no-explicit-any */
import { FINANCE_REPORTS_ORG_STORAGE_KEY } from '@/app/admin/finance/finance-reports-org'
import { useBypassOrgLocation } from '@/auth/use-bypass-org-location'
import { BypassOrgLocationPicker, EmptyState } from '@/components/shared'
import { Card } from '@/components/ui/card'
import { ActionColumn } from '@/dev/columns'
import { MotorReceiptReportColumns } from '@/dev/columns/admin/reports/motor-reports'
import { CustomBaseTable, SearchTools } from '@/dev/table'
import { useDebounce } from '@/hooks'
import { UseApiQuery } from '@/hooks/hooks'
import type { SingleActionsHandler, SubmitResponse, TFilterOptions, TPaginationFilters } from '@/types/types'
import { FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts'
import { useMotorDocumentDownload } from '@/utils/motor-document-download'
import { ShowToast } from '@/utils/utils'
import { Building2 } from 'lucide-react'
import { useReducer } from 'react'

const MotorReceiptReportTab = () => {
  const {
    isBypass,
    selectedLocationId,
    setLocationId,
    orgContextHeaders,
    canFetch,
  } = useBypassOrgLocation(FINANCE_REPORTS_ORG_STORAGE_KEY)

  const [filter, optionsDispatcher] = useReducer(
    ReusableReducer<TPaginationFilters & TFilterOptions>,
    { ...FILTEROPTIONS, page: 1, pageSize: 10 }
  )
  const optionsDispatcherDebounce = useDebounce({
    debounceCallback: optionsDispatcher,
  })

  const listParams = {
    page: filter.page,
    per_page: filter.pageSize,
    term: filter.term,
    sort_by: 'id',
    direction: 'desc',
  }

  // Org-location list (all receipts for current branch) — not the customer payment-history endpoint.
  // Super Admin must pick organization_location_id (sent as X-Organization-Location-Id).
  const { data, isLoading, isError } = UseApiQuery<SubmitResponse>({
    url: 'reports/motor/receipts',
    queryKey: ['reports/motor/receipts', listParams, selectedLocationId || null],
    params: listParams,
    config: orgContextHeaders ? { headers: orgContextHeaders } : undefined,
    queryOptions: { enabled: canFetch },
  })

  const receiptViewMutation = useMotorDocumentDownload(
    (id) => `document/motor/receipt/${id}`,
    'Receipt'
  )

  const ActionsHandlerMapping: SingleActionsHandler<any>[] = [
    {
      label: 'View Online',
      onSelect: (row) => {
        if (!row?.invoice_id) {
          ShowToast.error('Invoice id missing on this receipt')
          return
        }
        receiptViewMutation.mutate(String(row.invoice_id))
      },
    },
  ]

  return (
    <div className="space-y-4">
      {isBypass ? (
        <Card className="shadow-none p-4">
          <BypassOrgLocationPicker
            value={selectedLocationId}
            onChange={setLocationId}
            hint="Receipt list is scoped to the selected organization location."
          />
        </Card>
      ) : null}

      {!canFetch ? (
        <EmptyState
          icon={Building2}
          title="Select an organization location"
          description="Choose an organization location above to load motor receipts for that branch."
        />
      ) : (
        <CustomBaseTable
          onPageChange={(page) =>
            optionsDispatcher({ payload: { page }, type: 'page' })
          }
          OtherToolsProps={{
            onChange: (term: string) =>
              optionsDispatcherDebounce({ payload: { term }, type: 'term' }),
            placeholder: 'Search receipt, invoice, registration…',
            includeFilter: true,
          }}
          columns={[...MotorReceiptReportColumns, ActionColumn({ ActionsHandlerMapping })]}
          OtherTools={SearchTools}
          data={data?.data ?? []}
          pageCount={data?.pagination?.last_page ?? filter.page}
          title="Motor receipts"
          showPagination
          setPageSize={(pageSize) =>
            optionsDispatcher({ payload: { pageSize }, type: 'pageSize' })
          }
          pageSize={data?.pagination?.per_page ?? filter.pageSize}
          page={data?.pagination?.current_page ?? filter.page}
          isLoading={isLoading}
          isError={isError}
        />
      )}
    </div>
  )
}

export default MotorReceiptReportTab
