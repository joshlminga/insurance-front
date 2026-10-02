/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BuildFinanceTransactionsParams,
  FINANCE_TRANSACTIONS_URL,
} from '@/app/admin/finance/transactions/finance-transactions-query'
import { FinanceTransactionsColumns } from '@/dev/columns/admin/finance/transactions'
import { CustomBaseTable, SearchTools } from '@/dev/table'
import { useDebounce } from '@/hooks'
import { UseApiQuery } from '@/hooks/hooks'
import type {
  FinanceLedgerEntry,
  SubmitResponse,
  TFilterOptions,
  TPaginationFilters,
} from '@/types/types'
import { FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts'
import { useReducer } from 'react'

type LedgerListTabProps = {
  /** Maps to API `?view=invoice|purchase` */
  view: 'invoice' | 'purchase'
  title: string
}

/**
 * Shared list for both Finance Transactions tabs.
 * Same table + pagination pattern as finance parameters / motor certificates.
 */
export function FinanceLedgerListTab({ view, title }: LedgerListTabProps) {
  // Local filter state (page, pageSize, search term) — same reducer as other admin lists
  const [filter, optionsDispatcher] = useReducer(
    ReusableReducer<TPaginationFilters & TFilterOptions>,
    { ...FILTEROPTIONS, page: 1, pageSize: 15 }
  )
  const optionsDispatcherDebounce = useDebounce({
    debounceCallback: optionsDispatcher,
  })

  // GET finance/transactions?view=invoice|purchase&page=&per_page=&term=
  // Default queryKey is [url, params], so view is already part of the cache key
  const { data, isLoading, isError } = UseApiQuery<SubmitResponse>({
    url: FINANCE_TRANSACTIONS_URL,
    params: BuildFinanceTransactionsParams({
      view,
      page: filter.page,
      pageSize: filter.pageSize,
      term: filter.term,
    }),
  })

  const rows = (data?.data ?? []) as FinanceLedgerEntry[]

  return (
    <div className="w-full space-y-4">
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
            placeholder: 'Search account, note, invoice, purchase…',
            includeFilter: true,
          },
          columns: FinanceTransactionsColumns,
          OtherTools: SearchTools,
          data: rows,
          pageCount: data?.pagination?.last_page ?? filter.page,
          title,
          showPagination: true,
          setPageSize: (pageSize) =>
            optionsDispatcher({
              payload: { pageSize },
              type: 'pageSize',
            }),
          pageSize: data?.pagination?.per_page ?? filter?.pageSize,
          page: data?.pagination?.current_page ?? filter?.page,
          isLoading: isLoading,
          isError: isError,
        }}
      />
    </div>
  )
}

export default FinanceLedgerListTab
