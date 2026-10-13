import { useBypassOrgLocation } from '@/auth/use-bypass-org-location'
import { BypassOrgLocationPicker, EmptyState, PageHeader } from '@/components/shared'
import { buttonVariants } from '@/components/ui/button'
import { Button, ReuseableInput } from '@/dev/core'
import { UseApiQuery } from '@/hooks/hooks'
import type { SubmitResponse } from '@/types/types'
import {
  CLAIMS_API,
  normalizePolicy,
  normalizePolicyHit,
  normalizeRegistration,
  readPaginated,
  POLICY_SEARCH_MODES,
  type PolicySearchMode,
} from '@/utils/claims'
import { EROUTES, claimsDetailPath } from '@/utils/enums'
import { extractErrorMessage } from '@/utils/helpers'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, List } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import {
  ClaimGrid,
  ClaimSearchHero,
  ClaimStatTile,
  ClaimSurface,
  claimFieldClass,
  claimsPageClass,
} from './claim-ui'
import { CLAIMS_ORG_STORAGE_KEY } from './claims-org'
import { claimSearchSchema, type ClaimSearchValues } from './claims-schema'
import { ClaimRegisterForm } from './new/register-form'

type Step = 'search' | 'form' | 'done'

/**
 * Claims > Motor landing: search an issued cover first (email, policy, registration).
 * Super admins must pick an organization before Search runs.
 */
export function ClaimsMotorPage() {
  const {
    isBypass,
    selectedLocationId,
    setLocationId,
    orgContextHeaders,
    canFetch,
  } = useBypassOrgLocation(CLAIMS_ORG_STORAGE_KEY)

  const [step, setStep] = useState<Step>('search')
  const [certificateId, setCertificateId] = useState<string | null>(null)
  const [registrationHint, setRegistrationHint] = useState<string | null>(null)
  const [created, setCreated] = useState<{ claimNumber: string; uuid: string | null } | null>(null)
  const [query, setQuery] = useState<{ search_by: PolicySearchMode; term: string } | null>(null)

  const searchForm = useForm<ClaimSearchValues>({
    resolver: zodResolver(claimSearchSchema),
    defaultValues: { search_by: 'registration', term: '' },
  })

  const searchBy = searchForm.watch('search_by')

  const search = UseApiQuery<SubmitResponse>({
    url: CLAIMS_API.policies,
    queryKey: ['claims/policies', query, selectedLocationId || null],
    params: {
      search_by: query?.search_by,
      term: query?.term,
    },
    config: orgContextHeaders ? { headers: orgContextHeaders } : undefined,
    queryOptions: { enabled: canFetch && Boolean(query?.term) },
  })

  const policyQuery = UseApiQuery<SubmitResponse>({
    url: CLAIMS_API.policy(certificateId ?? '0'),
    queryKey: ['claims/policy', certificateId, registrationHint, selectedLocationId || null],
    params: {
      registration: registrationHint || undefined,
    },
    config: orgContextHeaders ? { headers: orgContextHeaders } : undefined,
    queryOptions: { enabled: canFetch && step === 'form' && Boolean(certificateId) },
  })

  const hits = readPaginated<unknown>(search.data, ['policies']).rows
    .map((row) => normalizePolicyHit(row))
    .filter((row): row is NonNullable<typeof row> => row != null)
  const policy = policyQuery.data ? normalizePolicy(policyQuery.data) : null

  const onSearch = (values: ClaimSearchValues) => {
    if (!canFetch) {
      return
    }

    let term = values.term.trim()
    if (values.search_by === 'registration') {
      term = normalizeRegistration(term)
    } else if (values.search_by === 'email') {
      term = term.toLowerCase()
    }

    setQuery({ search_by: values.search_by, term })
    setStep('search')
  }

  return (
    <div className={claimsPageClass}>
      <PageHeader
        title="Motor claims"
        description="Search by customer email, policy number, or vehicle registration, then register the claim."
        actions={[
          {
            icon: List,
            label: 'View all claims',
            variant: 'outline',
            href: EROUTES.CLAIMS_LIST,
          },
        ]}
      />

      {isBypass ? (
        <ClaimSurface padding="sm">
          <BypassOrgLocationPicker
            value={selectedLocationId}
            onChange={setLocationId}
            hint="Search and registration are scoped to the selected organization location."
          />
        </ClaimSurface>
      ) : null}

      {!canFetch ? (
        <EmptyState
          icon={Building2}
          title="Select an organization location"
          description="Choose an organization above before searching for a cover."
        />
      ) : (
        <>
          {step === 'done' && created && (
            <ClaimSurface rounded="3xl" padding="lg" className="text-center sm:text-left">
              <p className="text-sm text-muted-foreground">Claim registered</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                {created.claimNumber}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2 sm:justify-start">
                {created.uuid && (
                  <Link className={buttonVariants()} to={claimsDetailPath(created.uuid)}>
                    Open claim
                  </Link>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCreated(null)
                    setCertificateId(null)
                    setQuery(null)
                    setStep('search')
                    searchForm.reset({ search_by: 'registration', term: '' })
                  }}
                >
                  Register another
                </Button>
                <Link className={buttonVariants({ variant: 'outline' })} to={EROUTES.CLAIMS_LIST}>
                  View all claims
                </Link>
              </div>
            </ClaimSurface>
          )}

          {step === 'search' && (
            <ClaimSearchHero
              modes={POLICY_SEARCH_MODES}
              mode={searchBy}
              onModeChange={(value) => {
                searchForm.setValue('search_by', value as PolicySearchMode, { shouldValidate: true })
              }}
              onSubmit={searchForm.handleSubmit(onSearch)}
            >
              <div className="min-w-0 flex-1">
                <ReuseableInput
                  control={searchForm.control}
                  name="term"
                  label="Search"
                  placeholder="Customer email, policy number, or vehicle registration"
                  className={claimFieldClass}
                  required
                />
              </div>
              <Button type="submit" className="h-10 shrink-0 rounded-xl px-6" disabled={search.isFetching}>
                {search.isFetching ? 'Searching…' : 'Search'}
              </Button>
            </ClaimSearchHero>
          )}

          {step === 'search' && query && (
            <div className="flex flex-col gap-4">
              {search.isError && (
                <ClaimSurface padding="sm">
                  <p className="text-sm text-red-600">{extractErrorMessage(search.error)}</p>
                </ClaimSurface>
              )}
              {!search.isFetching && !search.isError && hits.length === 0 && (
                <ClaimSurface padding="sm">
                  <p className="text-sm text-muted-foreground">No issued cover matched that search.</p>
                </ClaimSurface>
              )}
              {hits.length > 0 && (
                <ClaimGrid>
                  {hits.map((hit) => (
                    <ClaimSurface key={hit.certificateId} className="flex h-full flex-col gap-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Registration
                          </p>
                          <p className="mt-1 text-lg font-semibold">{hit.registration || '—'}</p>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                          Issued
                        </span>
                      </div>
                      <ClaimGrid className="gap-2 md:grid-cols-2 xl:grid-cols-2">
                        <ClaimStatTile label="Policy" value={hit.policyNumber} />
                        <ClaimStatTile label="Insured" value={hit.insuredName} />
                        <ClaimStatTile label="Insurer" value={hit.insurerName} />
                        <ClaimStatTile label="Cover to" value={hit.coverTo} />
                      </ClaimGrid>
                      <Button
                        type="button"
                        className="mt-auto w-full rounded-xl"
                        onClick={() => {
                          setCertificateId(hit.certificateId)
                          setRegistrationHint(hit.registration)
                          setStep('form')
                        }}
                      >
                        Register
                      </Button>
                    </ClaimSurface>
                  ))}
                </ClaimGrid>
              )}
            </div>
          )}

          {step === 'form' && (
            <div className="flex flex-col gap-4">
              {policyQuery.isPending && (
                <p className="text-sm text-muted-foreground">Loading cover…</p>
              )}
              {policyQuery.isError && (
                <p className="text-sm text-red-600">{extractErrorMessage(policyQuery.error)}</p>
              )}
              {policy && (
                <ClaimRegisterForm
                  policy={policy}
                  orgContextHeaders={orgContextHeaders}
                  onBack={() => setStep('search')}
                  onCreated={(result) => {
                    setCreated(result)
                    setStep('done')
                  }}
                />
              )}
              {!policyQuery.isPending && !policy && (
                <Button type="button" variant="outline" onClick={() => setStep('search')}>
                  Back to Search
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
