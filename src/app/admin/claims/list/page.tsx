import { useBypassOrgLocation } from '@/auth/use-bypass-org-location'
import { BypassOrgLocationPicker, EmptyState, PageHeader } from '@/components/shared'
import { Card } from '@/components/ui/card'
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
import { Building2, Plus } from 'lucide-react'
import { useReducer } from 'react'
import { useForm } from 'react-hook-form'
import { CLAIMS_ORG_STORAGE_KEY } from '../claims-org'
import { claimColumns } from '../columns'

type ClaimFilters = TPaginationFilters & TFilterOptions & { status?: string }

/**
 * Browse existing claims (table). Motor landing is search-first at /claims;
 * this page is linked as "View all claims".
 */
export function ClaimsListPage() {
  const {
    isBypass,
    selectedLocationId,
    setLocationId,
    orgContextHeaders,
    canFetch,
  } = useBypassOrgLocation(CLAIMS_ORG_STORAGE_KEY)

  const [filter, optionsDispatcher] = useReducer(
    ReusableReducer<ClaimFilters>,
    { ...FILTEROPTIONS, page: 1, pageSize: 15, status: 'all' },
  )
  const optionsDispatcherDebounce = useDebounce({
    debounceCallback: optionsDispatcher,
  })

  const statusForm = useForm<{ status: string }>({
    defaultValues: { status: 'all' },
  })
  const status = statusForm.watch('status')

  const { data, isLoading, isError } = UseApiQuery<SubmitResponse>({
    url: CLAIMS_API.claims,
    queryKey: ['claims', filter, status, selectedLocationId || null],
    params: {
      page: filter.page,
      per_page: filter.pageSize,
      q: filter.term || undefined,
      status: status === 'all' ? undefined : status,
    },
    config: orgContextHeaders ? { headers: orgContextHeaders } : undefined,
    queryOptions: { enabled: canFetch },
  })

  const { rows, pagination } = readPaginated<unknown>(data, ['claims'])
  const claims = rows
    .map((row) => normalizeClaimRow(row))
    .filter((row): row is NonNullable<typeof row> => row != null)

  return (
    <div>
      <PageHeader
        title="All claims"
        description="Browse registered motor claims for this organization."
        actions={[
          {
            label: 'Motor search',
            variant: 'outline',
            href: EROUTES.CLAIMS,
          },
          {
            icon: Plus,
            label: 'New Claim',
            variant: 'default',
            href: EROUTES.CLAIMS,
          },
        ]}
      />

      {isBypass ? (
        <Card className="mb-4 shadow-none p-4">
          <BypassOrgLocationPicker
            value={selectedLocationId}
            onChange={setLocationId}
            hint="Claims are scoped to the selected organization location."
          />
        </Card>
      ) : null}

      {!canFetch ? (
        <EmptyState
          icon={Building2}
          title="Select an organization location"
          description="Choose an organization above before loading claims."
        />
      ) : (
        <>
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
            <p className="mb-3 text-sm text-red-600">
              Could not load claims. Check that you have claims access.
            </p>
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
              setPageSize={(pageSize) =>
                optionsDispatcher({ payload: { pageSize }, type: 'pageSize' })
              }
              pageSize={pagination.per_page ?? filter.pageSize}
              page={pagination.current_page ?? filter.page}
              isLoading={isLoading}
            />
          </div>
        </>
      )}
    </div>
  )
}
