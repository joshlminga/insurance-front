/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from "@/components/shared"
import { CurrenciesActivityLogsColumns } from "@/dev/columns/admin/currencies/activity-logs"
import { CustomBaseTable, SearchTools } from "@/dev/table"
import { useDebounce } from "@/hooks"
import { UseApiQuery } from "@/hooks/hooks"
import type {
  SubmitResponse,
  TFilterOptions,
  TPaginationFilters,
} from "@/types/types"
import { FILTEROPTIONS, ReusableReducer } from "@/utils/constatnts"
import { useReducer } from "react"

export function CurrenciesActivityLogsPage() {
  const [filter, optionsDispatcher] = useReducer(
    ReusableReducer<TPaginationFilters & TFilterOptions>,
    { ...FILTEROPTIONS, page: 1, pageSize: 10 },
  )
  const optionsDispatcherDebounce = useDebounce({
    debounceCallback: optionsDispatcher,
  })

  const { data, isLoading, isError } = UseApiQuery<SubmitResponse>({
    url: "atu/multicurrency/conversion-logs",
    params: {
      page: filter.page,
      per_page: filter.pageSize,
      search: filter.term || undefined,
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Currency Activity Logs"
        description="Read-only conversion history for audit and reporting."
      />

      <div className="w-full">
        <CustomBaseTable
          {...{
            onPageChange: (page) =>
              optionsDispatcher({
                payload: { page },
                type: "page",
              }),
            OtherToolsProps: {
              onChange: (searchTerm: any) =>
                optionsDispatcherDebounce({
                  payload: { term: searchTerm },
                  type: "term",
                }),
              placeholder: "Search conversion logs",
              includeFilter: true,
            },
            columns: CurrenciesActivityLogsColumns,
            OtherTools: SearchTools,
            data: data?.data ?? [],
            pageCount: data?.pagination?.last_page ?? 1,
            title: "Conversion Logs",
            showPagination: true,
            setPageSize: (pageSize) =>
              optionsDispatcher({
                payload: { pageSize },
                type: "pageSize",
              }),
            pageSize: data?.pagination?.per_page ?? filter.pageSize,
            page: data?.pagination?.current_page ?? filter.page,
            isLoading,
            isError,
          }}
        />
      </div>
    </div>
  )
}

export default CurrenciesActivityLogsPage
