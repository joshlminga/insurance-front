/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionColumn } from '@/dev/columns'
import { MotorReceiptReportColumns } from '@/dev/columns/admin/reports/motor-reports'
import { CustomBaseTable, SearchTools } from '@/dev/table'
import { useDebounce } from '@/hooks'
import { UseApiQuery } from '@/hooks/hooks'
import type { SingleActionsHandler, SubmitResponse, TFilterOptions, TPaginationFilters } from '@/types/types'
import { FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts'
import { useMotorDocumentDownload } from '@/utils/motor-document-download'
import { ShowToast } from '@/utils/utils'
import { useReducer } from 'react'

const MotorReceiptReportTab = () => {
  const [filter, optionsDispatcher] = useReducer(
    ReusableReducer<TPaginationFilters & TFilterOptions>,
    { ...FILTEROPTIONS, page: 1, pageSize: 10 }
  )
  const optionsDispatcherDebounce = useDebounce({
    debounceCallback: optionsDispatcher,
  })

  const { data, isLoading, isError } = UseApiQuery<SubmitResponse>({
    url: 'reports/motor/user/receipts',
    params: {
      page: filter.page,
      per_page: filter.pageSize,
      term: filter.term,
      sort_by: 'id',
      direction: 'desc',
    },
    queryOptions: { enabled: true },
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
  )
}

export default MotorReceiptReportTab
