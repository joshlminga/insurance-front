import { PageHeader } from '@/components/shared'
import { ReusableSelect } from '@/dev/core'
import { CustomBaseTable, SearchTools } from '@/dev/table'
import { useDebounce } from '@/hooks'
import { UseApiQuery } from '@/hooks/hooks'
import type { SubmitResponse, TFilterOptions, TPaginationFilters } from '@/types/types'
import {
  CLAIM_STATUS_FILTERS,
  CLAIMS_API,
  normalizeClaimRow,
  readPaginated,
} from '@/utils/claims'
import { FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts'
import { EROUTES } from '@/utils/enums'
import { Plus } from 'lucide-react'
import { useReducer } from 'react'
import { useForm } from 'react-hook-form'
import { claimColumns } from './columns'

type ClaimFilters = TPaginationFilters & TFilterOptions & { status?: string }

/**
 * Claims list. UseApiQuery GETs `claims` and already unwraps axios so
 * `data` here is the JSON body (message, data, pagination).
 */
export function ClaimsListPage() {
  const [filter, optionsDispatcher] = useReducer(
    ReusableReducer<ClaimFilters>,
    { ...FILTEROPTIONS, page: 1, pageSize: 15, status: 'all' },
  )
  const optionsDispatcherDebounce = useDebounce({
    debounceCallback: optionsDispatcher,
  })

  // The status dropdown is a tiny form so we can reuse ReusableSelect.
  const statusForm = useForm<{ status: string }>({
    defaultValues: { status: 'all' },
  })
  const status = statusForm.watch('status')

  const { data, isLoading, isError } = UseApiQuery<SubmitResponse>({
    url: CLAIMS_API.claims,
    params: {
      page: filter.page,
      per_page: filter.pageSize,
      q: filter.term || undefined,
      status: status === 'all' ? undefined : status,
    },
  })

  const { rows, pagination } = readPaginated<unknown>(data, ['claims'])
  const claims = rows
    .map((row) => normalizeClaimRow(row))
    .filter((row): row is NonNullable<typeof row> => row != null)

  return (
    <div>
      <PageHeader
        title="Claims"
        description="Register and follow motor claims."
        actions={[
          {
            icon: Plus,
            label: 'New Claim',
            variant: 'default',
            href: EROUTES.CLAIMS_NEW,
          },
        ]}
      />

      <div className="mb-4 flex w-full justify-end">
        <div className="w-64">
          <ReusableSelect
            control={statusForm.control}
            name="status"
            label="Status"
            options={CLAIM_STATUS_FILTERS.map((option) => ({ ...option }))}
          />
        </div>
      </div>

      {isError && (
        <p className="mb-3 text-sm text-red-600">Could not load claims. Check that you have claims access.</p>
      )}

      <div className="w-full">
        <CustomBaseTable
          onPageChange={(page) => optionsDispatcher({ payload: { page }, type: 'page' })}
          OtherToolsProps={{
            onChange: (term: string) =>
              optionsDispatcherDebounce({ payload: { term }, type: 'term' }),
            placeholder: 'Search claim number, registration, or policy',
            includeFilter: true,
          }}
          columns={claimColumns}
          OtherTools={SearchTools}
          data={claims}
          pageCount={pagination.last_page ?? 1}
          title="Claims"
          showPagination
          setPageSize={(pageSize) => optionsDispatcher({ payload: { pageSize }, type: 'pageSize' })}
          pageSize={pagination.per_page ?? filter.pageSize}
          page={pagination.current_page ?? filter.page}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
