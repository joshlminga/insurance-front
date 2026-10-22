/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Finance > Invoices > Travel
 * Lists travel invoices for the selected org location (same header pattern as motor).
 * Actions: View Online (PDF), Email (InvoiceEmail), WhatsApp (PDF + attachment), Issue Cover.
 */
import { FINANCE_REPORTS_ORG_STORAGE_KEY } from '@/app/admin/finance/finance-reports-org'
import { persistAdminTravelIssueCoverFromInvoice } from '@/app/admin/quotations/travel/admin-travel-session'
import { useBypassOrgLocation } from '@/auth/use-bypass-org-location'
import { BypassOrgLocationPicker, EmptyState } from '@/components/shared'
import { Card } from '@/components/ui/card'
import { ActionColumn } from '@/dev/columns'
import { TravelInvoiceReportColumns } from '@/dev/columns/admin/reports/travel-invoice-reports'
import { CustomDialogComponent, SendInvoiceViaEmail } from '@/dev/core'
import { CustomBaseTable, SearchTools } from '@/dev/table'
import { useCustomDialogContextFactory, useDebounce } from '@/hooks'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import type {
  SingleActionsHandler,
  SubmitResponse,
  TFilterOptions,
  TPaginationFilters,
} from '@/types/types'
import apiClient from '@/lib/api-client'
import { EMETHODS, FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts'
import { EROUTES } from '@/utils/enums'
import { extractErrorMessage } from '@/utils/helpers'
import { useMotorDocumentDownload } from '@/utils/motor-document-download'
import { ShowToast } from '@/utils/utils'
import { Building2 } from 'lucide-react'
import { useReducer, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const TravelInvoiceTab = () => {
  const navigate = useNavigate()
  const {
    isBypass,
    selectedLocationId,
    setLocationId,
    orgContextHeaders,
    canFetch,
    allowedLocationIds,
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
      endpointUrl?: string
    }>()

  const listParams = {
    page: filter.page,
    per_page: filter.pageSize,
    term: filter.term,
    sort_by: 'id',
    direction: 'desc',
  }

  // Org-location travel invoices — Super Admin picks X-Organization-Location-Id
  const { data, isLoading, refetch, isError } = UseApiQuery<SubmitResponse>({
    url: 'finance/invoices/travel',
    queryKey: ['finance/invoices/travel', listParams, selectedLocationId || null],
    params: listParams,
    config: orgContextHeaders ? { headers: orgContextHeaders } : undefined,
    queryOptions: { enabled: canFetch },
  })

  // Opens the travel invoice PDF in a popup (same helper as motor docs)
  const invoiceViewMutation = useMotorDocumentDownload(
    (id) => `document/travel/invoice/${id}`,
    'Invoice'
  )

  // Track which invoice is mid WhatsApp send (download PDF → attach)
  const [whatsappInvoiceId, setWhatsappInvoiceId] = useState<string | null>(null)

  const sendTravelInvoiceWhatsApp = async (invoiceId: string | number, phone: string) => {
    const id = String(invoiceId)
    setWhatsappInvoiceId(id)
    try {
      const pdfResponse = await apiClient.get(`document/travel/invoice/${id}`, {
        responseType: 'blob',
      })
      const blob = pdfResponse.data as Blob
      const formData = new FormData()
      formData.append('to', phone)
      formData.append('type', 'document')
      formData.append(
        'file',
        new File([blob], `travel-invoice-${id}.pdf`, { type: 'application/pdf' })
      )
      formData.append('filename', `travel-invoice-${id}.pdf`)
      formData.append('caption', 'Your travel insurance invoice')

      await apiClient.post('whatsapp/send-attachment', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      ShowToast.success('Invoice sent via WhatsApp')
    } catch (error) {
      ShowToast.error(extractErrorMessage(error) || 'WhatsApp send failed')
    } finally {
      setWhatsappInvoiceId(null)
    }
  }

  // Issue Cover → seed purchase session, then open admin travel purchase stepper
  const issueCoverMutation = UseApiMutation<
    SubmitResponse,
    { purchaseId: number | string; invoiceId: number | string; row: any }
  >({
    url: ({ purchaseId }) => `purchase/travel/${purchaseId}/summary`,
    method: EMETHODS.GET,
    config: orgContextHeaders ? { headers: orgContextHeaders } : undefined,
    mutationOptions: {
      onSuccess: (response, variables) => {
        const summary = response?.data ?? {}
        persistAdminTravelIssueCoverFromInvoice({
          purchaseId: variables.purchaseId,
          invoiceId: variables.invoiceId,
          hasKycMeta:
            Boolean(variables.row?.has_kyc_meta) ||
            (summary?.kyc && Object.keys(summary.kyc).length > 0),
          hasInvoiceMeta:
            Boolean(variables.row?.has_invoice_meta) ||
            (summary?.invoice && Object.keys(summary.invoice).length > 0),
        })
        navigate(EROUTES.TRAVEL_QUOTATION_PURCHASE)
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error) || 'Cannot issue cover for this invoice')
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
            // Travel uses InvoiceEmail via this route (not the motor PDF mailer)
            endpointUrl: 'document/travel/send-invoice-via-email',
            refetch,
          },
          Component: SendInvoiceViaEmail,
        })
      },
    },
    {
      label: 'WhatsApp',
      onSelect: (row) => {
        const phone = row?.payer_phone || row?.customer?.phone || ''
        if (!row?.id) {
          ShowToast.error('Invoice id missing on this row')
          return
        }
        if (!String(phone).trim()) {
          ShowToast.error('Payer phone missing on this invoice')
          return
        }
        void sendTravelInvoiceWhatsApp(row.id, String(phone).trim())
      },
    },
    {
      label: 'Issue Cover',
      onSelect: (row) => {
        if (!row?.purchase_id || !row?.id) {
          ShowToast.error('Purchase or invoice id missing')
          return
        }
        issueCoverMutation.mutate({
          purchaseId: row.purchase_id,
          invoiceId: row.id,
          row,
        })
      },
      conditional: (row) => {
        const status = String(row?.status ?? '').toLowerCase()
        return status === 'pending' || status === 'overdue' || Boolean(row?.is_overdue)
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
            allowedLocationIds={allowedLocationIds}
            hint="Invoice list is scoped to the selected organization location."
          />
        </Card>
      ) : null}

      {!canFetch ? (
        <EmptyState
          icon={Building2}
          title="Select an organization location"
          description="Choose an organization location above to load travel invoices for that branch."
        />
      ) : (
        <CustomBaseTable
          onPageChange={(page) =>
            optionsDispatcher({ payload: { page }, type: 'page' })
          }
          OtherToolsProps={{
            onChange: (term: string) =>
              optionsDispatcherDebounce({ payload: { term }, type: 'term' }),
            placeholder: 'Search invoice, quote…',
            includeFilter: true,
          }}
          columns={[
            ...TravelInvoiceReportColumns,
            ActionColumn({
              ActionsHandlerMapping,
              isRowLoading: (row) =>
                (issueCoverMutation.isPending &&
                  String(issueCoverMutation.variables?.invoiceId) === String(row?.id)) ||
                whatsappInvoiceId === String(row?.id),
            }),
          ]}
          OtherTools={SearchTools}
          data={data?.data ?? []}
          pageCount={data?.pagination?.last_page ?? filter.page}
          title="Travel invoices"
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

export default TravelInvoiceTab
