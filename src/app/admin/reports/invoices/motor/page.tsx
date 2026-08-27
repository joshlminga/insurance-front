/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from '@/components/shared'
import { ActionColumn } from '@/dev/columns'
import {
  MotorInvoiceReportColumns,
} from '@/dev/columns/admin/reports/motor-reports'
import { CustomBaseTable, SearchTools } from '@/dev/table'
import { useDebounce } from '@/hooks'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import type { SingleActionsHandler, SubmitResponse, TFilterOptions, TPaginationFilters } from '@/types/types'
import { EMETHODS, FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts'
import { EROUTES } from '@/utils/enums'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { useReducer } from 'react'
import { useNavigate } from 'react-router-dom'
import { persistAdminMotorIssueCoverFromInvoice } from '@/app/admin/quotations/motor/admin-motor-session'

export const InvoiceReportsMotorPage = () => {
  const navigate = useNavigate()
  const [filter, optionsDispatcher] = useReducer(
    ReusableReducer<TPaginationFilters & TFilterOptions>,
    { ...FILTEROPTIONS, page: 1, pageSize: 10 }
  )
  const optionsDispatcherDebounce = useDebounce({
    debounceCallback: optionsDispatcher,
  })

  const { data, isLoading, refetch, isError } = UseApiQuery<SubmitResponse>({
    url: 'reports/motor/user/invoices',
    params: {
      page: filter.page,
      per_page: filter.pageSize,
      term: filter.term,
      sort_by: 'id',
      direction: 'desc',
    },
    queryOptions: { enabled: true },
  })

  const retryIssuingMutation = UseApiMutation<SubmitResponse, { invoiceId: number | string }>({
    url: ({ invoiceId }) => `dmvic/motor/certificates/${invoiceId}/retry-issuing`,
    method: EMETHODS.POST,
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
    <div className="space-y-6">
      <PageHeader
        title="Invoice Reports — Motor"
        description="Motor invoices with actions to continue payment or retry certificate issuance."
      />
      <CustomBaseTable
        onPageChange={(page) =>
          optionsDispatcher({ payload: { page }, type: 'page' })
        }
        OtherToolsProps={{
          onChange: (term: string) =>
            optionsDispatcherDebounce({ payload: { term }, type: 'term' }),
          placeholder: 'Search invoice, quote, plate…',
          includeFilter: true,
        }}
        columns={[...MotorInvoiceReportColumns, ActionColumn({ ActionsHandlerMapping })]}
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
    </div>
  )
}
