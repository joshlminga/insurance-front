import { PageHeader } from '@/components/shared'
import { MotorReceiptReportColumns } from '@/dev/columns/admin/reports/motor-reports'
import { CustomBaseTable, SearchTools } from '@/dev/table'
import { useDebounce } from '@/hooks'
import { UseApiQuery } from '@/hooks/hooks'
import type { SubmitResponse, TFilterOptions, TPaginationFilters } from '@/types/types'
import { FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts'
import { useReducer } from 'react'

export const ReceiptReportsMotorPage = () => {
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Receipt Reports — Motor"
        description="Paid motor receipts linked to quotations and vehicles."
      />
      <CustomBaseTable
        onPageChange={(page) =>
          optionsDispatcher({ payload: { page }, type: 'page' })
        }
        OtherToolsProps={{
          onChange: (term: string) =>
            optionsDispatcherDebounce({ payload: { term }, type: 'term' }),
          placeholder: 'Search receipt, invoice, plate…',
          includeFilter: true,
        }}
        columns={MotorReceiptReportColumns}
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
    </div>
  )
}
