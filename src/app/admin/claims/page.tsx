import { useBypassOrgLocation } from '@/auth/use-bypass-org-location'
import { BypassOrgLocationPicker, EmptyState, PageHeader } from '@/components/shared'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Button, ReusableSelect, ReuseableInput } from '@/dev/core'
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
    <div className="flex flex-col gap-4">
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
        <Card className="shadow-none p-4">
          <BypassOrgLocationPicker
            value={selectedLocationId}
            onChange={setLocationId}
            hint="Search and registration are scoped to the selected organization location."
          />
        </Card>
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
            <div className="rounded-lg border bg-card p-6">
              <p className="text-sm text-muted-foreground">Claim registered</p>
              <p className="mt-1 text-2xl font-semibold text-primary">{created.claimNumber}</p>
              <div className="mt-4 flex gap-2">
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
            </div>
          )}

          {step === 'search' && (
            <form
              className="grid gap-4 rounded-lg border bg-card p-4 md:grid-cols-[16rem_1fr_auto] md:items-end"
              onSubmit={searchForm.handleSubmit(onSearch)}
            >
              <ReusableSelect
                control={searchForm.control}
                name="search_by"
                label="Search by"
                options={POLICY_SEARCH_MODES.map((mode) => ({ ...mode }))}
              />
              <ReuseableInput
                control={searchForm.control}
                name="term"
                label="Search"
                placeholder="Customer email, policy number, or vehicle registration"
                className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                required
              />
              <Button type="submit" disabled={search.isFetching}>
                {search.isFetching ? 'Searching…' : 'Search'}
              </Button>
            </form>
          )}

          {step === 'search' && query && (
            <div className="rounded-lg border bg-card">
              {search.isError && (
                <p className="p-4 text-sm text-red-600">{extractErrorMessage(search.error)}</p>
              )}
              {!search.isFetching && !search.isError && hits.length === 0 && (
                <p className="p-4 text-sm text-muted-foreground">No issued cover matched that search.</p>
              )}
              {hits.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b text-left text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-medium">Registration</th>
                        <th className="px-4 py-3 font-medium">Policy</th>
                        <th className="px-4 py-3 font-medium">Certificate</th>
                        <th className="px-4 py-3 font-medium">Insured</th>
                        <th className="px-4 py-3 font-medium">Insurer</th>
                        <th className="px-4 py-3 font-medium">Cover to</th>
                        <th className="px-4 py-3 font-medium" />
                      </tr>
                    </thead>
                    <tbody>
                      {hits.map((hit) => (
                        <tr key={hit.certificateId} className="border-b last:border-b-0">
                          <td className="px-4 py-3">{hit.registration || '—'}</td>
                          <td className="px-4 py-3">{hit.policyNumber || '—'}</td>
                          <td className="px-4 py-3">{hit.certificateNumber || '—'}</td>
                          <td className="px-4 py-3">{hit.insuredName || '—'}</td>
                          <td className="px-4 py-3">{hit.insurerName || '—'}</td>
                          <td className="px-4 py-3">{hit.coverTo || '—'}</td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => {
                                setCertificateId(hit.certificateId)
                                setRegistrationHint(hit.registration)
                                setStep('form')
                              }}
                            >
                              Register
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {step === 'form' && (
            <div className="flex flex-col gap-4">
              {policyQuery.isPending && <p className="text-sm text-muted-foreground">Loading cover…</p>}
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
