import { useBypassOrgLocation } from '@/auth/use-bypass-org-location'
import { BypassOrgLocationPicker, EmptyState, PageHeader } from '@/components/shared'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button, ReusableSelect } from '@/dev/core'
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
import { EROUTES, claimsDetailPath } from '@/utils/enums'
import { Building2, Plus } from 'lucide-react'
import { useReducer } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import {
  ClaimGrid,
  ClaimStatTile,
  ClaimSurface,
  ClaimTatBadge,
  claimsPageClass,
} from '../claim-ui'
import { CLAIMS_ORG_STORAGE_KEY } from '../claims-org'

type ClaimFilters = TPaginationFilters & TFilterOptions & { status?: string }

/**
 * Browse existing claims as a card grid (not a dense table).
 * Motor landing is search-first at /claims; this page is "View all claims".
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

  const currentPage = pagination.current_page ?? filter.page
  const lastPage = pagination.last_page ?? 1

  return (
    <div className={claimsPageClass}>
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
        <ClaimSurface padding="sm">
          <BypassOrgLocationPicker
            value={selectedLocationId}
            onChange={setLocationId}
            hint="Claims are scoped to the selected organization location."
          />
        </ClaimSurface>
      ) : null}

      {!canFetch ? (
        <EmptyState
          icon={Building2}
          title="Select an organization location"
          description="Choose an organization above before loading claims."
        />
      ) : (
        <>
          {/* Top filter card: search + status */}
          <ClaimSurface padding="sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Label htmlFor="claims-list-search">Search</Label>
                <Input
                  id="claims-list-search"
                  className="h-10 rounded-xl"
                  placeholder="Claim number, registration, or policy"
                  defaultValue={filter.term ?? ''}
                  onChange={(event) => {
                    optionsDispatcherDebounce({
                      payload: { term: event.target.value, page: 1 },
                      type: 'term',
                    })
                  }}
                />
              </div>
              <div className="w-full md:w-64">
                <ReusableSelect
                  control={statusForm.control}
                  name="status"
                  label="Status"
                  options={CLAIM_STATUS_FILTERS.map((option) => ({ ...option }))}
                />
              </div>
            </div>
          </ClaimSurface>

          {isError && (
            <p className="text-sm text-red-600">
              Could not load claims. Check that you have claims access.
            </p>
          )}

          {isLoading && (
            <p className="text-sm text-muted-foreground">Loading claims…</p>
          )}

          {!isLoading && claims.length === 0 && (
            <ClaimSurface padding="sm">
              <p className="text-sm text-muted-foreground">No claims match this filter.</p>
            </ClaimSurface>
          )}

          {claims.length > 0 && (
            <ClaimGrid>
              {claims.map((claim) => (
                <Link
                  key={claim.uuid}
                  to={claimsDetailPath(claim.uuid)}
                  className="block h-full transition-opacity hover:opacity-90"
                >
                  <ClaimSurface className="flex h-full flex-col gap-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Claim
                        </p>
                        <p className="mt-0.5 text-lg font-semibold">{claim.claim_number}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-foreground">
                          {claim.status_label}
                        </span>
                        <ClaimTatBadge badge={claim.tat_badge} />
                      </div>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <ClaimStatTile label="Registration" value={claim.registration_number} />
                      <ClaimStatTile label="Policy" value={claim.policy_number} />
                      <ClaimStatTile label="Loss date" value={claim.loss_date} />
                      <ClaimStatTile label="Due" value={claim.tat_due_date} />
                    </div>
                  </ClaimSurface>
                </Link>
              ))}
            </ClaimGrid>
          )}

          {/* Simple pagination — same filter state the old table used */}
          {lastPage > 1 && (
            <ClaimSurface padding="sm" className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {lastPage}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  disabled={currentPage <= 1}
                  onClick={() => optionsDispatcher({ payload: { page: currentPage - 1 }, type: 'page' })}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  disabled={currentPage >= lastPage}
                  onClick={() => optionsDispatcher({ payload: { page: currentPage + 1 }, type: 'page' })}
                >
                  Next
                </Button>
              </div>
            </ClaimSurface>
          )}
        </>
      )}
    </div>
  )
}
