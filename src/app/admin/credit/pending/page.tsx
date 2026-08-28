/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from "@/components/shared"
import { ActionColumn } from "@/dev/columns"
import { CustomBaseTable, SearchTools } from "@/dev/table"
import { CreditPendingScheduleColumns } from "@/dev/columns/admin/credit/pending-schedules"
import { creditPendingDetailPath } from "@/app/admin/credit/credit-payment"
import { CREDIT_URLS } from "@/app/admin/credit/credit-query"
import { useDebounce } from "@/hooks"
import { UseApiQuery } from "@/hooks/hooks"
import type {
  CreditTransaction,
  SingleActionsHandler,
  SubmitResponse,
  TPaginationFilters,
  TFilterOptions,
} from "@/types/types"
import { FILTEROPTIONS, ReusableReducer } from "@/utils/constatnts"
import { useReducer } from "react"
import { useNavigate } from "react-router-dom"

export function CreditPendingPage() {
  const navigate = useNavigate()

  const [filter, optionsDispatcher] = useReducer(
    ReusableReducer<TPaginationFilters & TFilterOptions>,
    { ...FILTEROPTIONS, page: 1, pageSize: 15 }
  )

  const optionsDispatcherDebounce = useDebounce({
    debounceCallback: optionsDispatcher,
  })

  const { data, isLoading, isError } = UseApiQuery<SubmitResponse>({
    url: CREDIT_URLS.transactionsMine,
    params: {
      page: filter.page,
      per_page: filter.pageSize,
      term: filter.term,
    },
    queryOptions: {
      enabled: true,
    },
  })

  const transactions: CreditTransaction[] =
    data?.data?.transactions ??
    data?.data?.credit_transactions ??
    data?.data?.data ??
    (Array.isArray(data?.data) ? data.data : [])

  const schedules = transactions.filter((txn) => txn.schedule)

  const ActionsHandlerMapping: SingleActionsHandler<CreditTransaction>[] = [
    {
      label: "View",
      onSelect: (row) => {
        const invoiceId = row.schedule?.invoice_id ?? row.transactionable_id
        if (!invoiceId) return
        navigate(creditPendingDetailPath(invoiceId))
      },
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Credit Approval Pending"
        description="Track credit payments waiting for approval, cover date updates, or that were rejected."
      />

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
            ...CreditPendingScheduleColumns,
            ActionColumn({ ActionsHandlerMapping }),
          ],
          OtherTools: SearchTools,
          data: schedules ?? [],
          pageCount: data?.data?.pagination?.last_page ?? filter.page,
          title: 'Credit Approvals',
          showPagination: true,
          setPageSize: (pageSize) =>
            optionsDispatcher({
              payload: { pageSize },
              type: 'pageSize',
            }),
          pageSize: data?.pagination?.per_page ?? filter?.pageSize,
          page: data?.pagination?.current_page ?? filter?.page,
          isLoading: isLoading,
          isError: isError
        }}
      />
    </div>
  )
}
export default CreditPendingPage;