/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Finance > Payments
 * Lists successful charges from M-Pesa, Paystack, Pesapal, PayPal, and Credit.
 */
import { PageHeader } from '@/components/shared'
import { FinancePaymentColumns } from '@/dev/columns/admin/finance/payments'
import { CustomBaseTable, SearchTools } from '@/dev/table'
import { useDebounce } from '@/hooks'
import { UseApiQuery } from '@/hooks/hooks'
import type {
  SubmitResponse,
  TFilterOptions,
  TPaginationFilters,
} from '@/types/types'
import { FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts'
import { useReducer } from 'react'

const PaymentsPage = () => {
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
  }

  const { data, isLoading, isError } = UseApiQuery<SubmitResponse>({
    url: 'finance/payments',
    queryKey: ['finance/payments', listParams],
    params: listParams,
    queryOptions: { enabled: true },
  })

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Successful premium payments across M-Pesa, Paystack, Pesapal, PayPal, and Credit."
      />

      <div className="w-full">
        <CustomBaseTable
          onPageChange={(page) =>
            optionsDispatcher({ payload: { page }, type: 'page' })
          }
          OtherToolsProps={{
            onChange: (term: string) =>
              optionsDispatcherDebounce({ payload: { term }, type: 'term' }),
            placeholder: 'Search invoice, quote, or reference…',
            includeFilter: true,
          }}
          columns={[...FinancePaymentColumns]}
          OtherTools={SearchTools}
          data={data?.data ?? []}
          pageCount={data?.pagination?.last_page ?? filter.page}
          title="Payments"
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
    </div>
  )
}

export default PaymentsPage
