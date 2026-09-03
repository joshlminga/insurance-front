/* eslint-disable @typescript-eslint/no-explicit-any */
import { FINANCE_REPORTS_ORG_STORAGE_KEY } from '@/app/admin/finance/finance-reports-org'
import { persistAdminMotorIssueCoverFromInvoice } from '@/app/admin/quotations/motor/admin-motor-session'
import { useBypassOrgLocation } from '@/auth/use-bypass-org-location'
import { BypassOrgLocationPicker, EmptyState } from '@/components/shared'
import { Card } from '@/components/ui/card'
import { ActionColumn } from '@/dev/columns'
import { MotorInvoiceReportColumns } from '@/dev/columns/admin/reports/motor-reports'
import { CustomDialogComponent, SendInvoiceViaEmail } from '@/dev/core'
import { CustomBaseTable, SearchTools } from '@/dev/table'
import { useCustomDialogContextFactory, useDebounce } from '@/hooks'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import type { SingleActionsHandler, SubmitResponse, TFilterOptions, TPaginationFilters } from '@/types/types'
import { EMETHODS, FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts'
import { EROUTES } from '@/utils/enums'
import { extractErrorMessage } from '@/utils/helpers'
import { useMotorDocumentDownload } from '@/utils/motor-document-download'
import { ShowToast } from '@/utils/utils'
import { Building2 } from 'lucide-react'
import { useReducer } from 'react'
import { useNavigate } from 'react-router-dom'

const MotorInvoiceReportTab = () => {
  const navigate = useNavigate()
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

  const { handleDialogContextSwitch, dialogContent, dialogOpen } =
    useCustomDialogContextFactory<{
      refetch?: () => Promise<any>
      data?: any
      requireRecipientEmail?: boolean
      defaultEmail?: string
    }>()

  const listParams = {
    page: filter.page,
    per_page: filter.pageSize,
    term: filter.term,
    sort_by: 'id',
    direction: 'desc',
  }

  // Org-location list (all invoices for current branch) — not the customer "my invoices" endpoint.
  // Super Admin must pick organization_location_id (sent as X-Organization-Location-Id).
  const { data, isLoading, refetch, isError } = UseApiQuery<SubmitResponse>({
    url: 'reports/motor/invoices',
    queryKey: ['reports/motor/invoices', listParams, selectedLocationId || null],
    params: listParams,
    config: orgContextHeaders ? { headers: orgContextHeaders } : undefined,
    queryOptions: { enabled: canFetch },
  })

  const invoiceViewMutation = useMotorDocumentDownload(
    (id) => `document/motor/invoice/${id}`,
    'Invoice'
  )

  const retryIssuingMutation = UseApiMutation<SubmitResponse, { invoiceId: number | string }>({
    url: ({ invoiceId }) => `dmvic/motor/certificates/${invoiceId}/retry-issuing`,
    method: EMETHODS.POST,
    config: orgContextHeaders ? { headers: orgContextHeaders } : undefined,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response?.message || 'Certificate issuance started')
        void refetch()
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error) || 'Failed to issue certificate')
      },
    },
  })

  const ActionsHandlerMapping: SingleActionsHandler<any>[] = [
    {
      label: 'View Online',
      onSelect: (row) => {
        if (!row?.id) {
          ShowToast.error('Invoice id missing on this row')
          return
        }
        invoiceViewMutation.mutate(String(row.id))
      },
    },
    {
      label: 'Email',
      onSelect: (row) => {
        const purchaseId = row?.purchase_id
        if (!purchaseId) {
          ShowToast.error('Purchase id missing on this invoice')
          return
        }
        handleDialogContextSwitch({
          componentProps: {
            data: purchaseId,
            requireRecipientEmail: true,
            defaultEmail: row?.customer?.email,
            refetch,
          },
          Component: SendInvoiceViaEmail,
        })
      },
    },
    {
      label: 'WhatsApp',
      onSelect: () => {
        ShowToast.info('WhatsApp sharing coming soon')
      },
    },
    {
      label: 'Issue cover',
      onSelect: (row) => {
        const purchaseId = row?.purchase_id
        if (!purchaseId) {
          ShowToast.error('Purchase id missing on this invoice')
          return
        }
        persistAdminMotorIssueCoverFromInvoice({
          purchaseId,
          invoiceId: row?.id,
          lockPaymentPlan: Boolean(row?.lock_payment_plan),
          installmentAmount: row?.installment_amount,
        })
        navigate(EROUTES.MOTOR_QUOTATION_PURCHASE)
      },
      conditional: (row) => {
        const status = String(row?.status ?? '').toLowerCase()
        return status === 'pending' || status === 'overdue' || Boolean(row?.is_overdue)
      },
    },
    {
      label: 'Retry issue',
      onSelect: (row) => {
        if (!row?.id) return
        retryIssuingMutation.mutate({ invoiceId: row.id })
      },
      conditional: (row) => {
        const status = String(row?.status ?? '').toLowerCase()
        return status === 'paid'
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
            hint="Invoice list is scoped to the selected organization location."
          />
        </Card>
      ) : null}

      {!canFetch ? (
        <EmptyState
          icon={Building2}
          title="Select an organization location"
          description="Choose an organization location above to load motor invoices for that branch."
        />
      ) : (
        <CustomBaseTable
          onPageChange={(page) =>
            optionsDispatcher({ payload: { page }, type: 'page' })
          }
          OtherToolsProps={{
            onChange: (term: string) =>
              optionsDispatcherDebounce({ payload: { term }, type: 'term' }),
            placeholder: 'Search invoice, quote, registration…',
            includeFilter: true,
          }}
          columns={[
            ...MotorInvoiceReportColumns,
            ActionColumn({
              ActionsHandlerMapping,
              // Spinner on the Action button while this row's retry is in flight
              isRowLoading: (row) =>
                retryIssuingMutation.isPending &&
                String(retryIssuingMutation.variables?.invoiceId) === String(row?.id),
            }),
          ]}
          OtherTools={SearchTools}
          data={data?.data ?? []}
          pageCount={data?.pagination?.last_page ?? filter.page}
          title="Motor invoices"
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

export default MotorInvoiceReportTab
