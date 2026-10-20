import { useBypassOrgLocation } from '@/auth/use-bypass-org-location'
import { BypassOrgLocationPicker, EmptyState, PageHeader } from '@/components/shared'
import { UseApiQuery } from '@/hooks/hooks'
import type { SubmitResponse } from '@/types/types'
import {
  CLAIMS_API,
  formatClaimAmount,
  normalizeClaimDetail,
} from '@/utils/claims'
import { EROUTES } from '@/utils/enums'
import { extractErrorMessage } from '@/utils/helpers'
import { Building2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CLAIMS_ORG_STORAGE_KEY } from '../claims-org'
import {
  ClaimGateBanners,
  ClaimGrid,
  ClaimStatTile,
  ClaimSurface,
  ClaimTatBadge,
  claimsPageClass,
} from '../claim-ui'
import { ClaimActions } from './claim-actions'
import { ClaimDocuments } from './claim-documents'
import { ClaimEmail } from './claim-email'
import { ClaimTimeline } from './claim-timeline'

/**
 * One claim. useParams reads :uuid from the address bar
 * (same idea as a route parameter in Laravel).
 * Email logs come from the claim detail payload (no separate GET emails route).
 */
export function ClaimsDetailPage() {
  const { uuid = '' } = useParams()
  const [emailHint, setEmailHint] = useState<string | null>(null)
  const {
    isBypass,
    selectedLocationId,
    setLocationId,
    orgContextHeaders,
    canFetch,
    allowedLocationIds,
  } = useBypassOrgLocation(CLAIMS_ORG_STORAGE_KEY)

  const claimQuery = UseApiQuery<SubmitResponse>({
    url: CLAIMS_API.claim(uuid),
    queryKey: ['claims/detail', uuid, selectedLocationId || null],
    config: orgContextHeaders ? { headers: orgContextHeaders } : undefined,
    queryOptions: { enabled: canFetch && Boolean(uuid) },
  })

  const claim = useMemo(() => normalizeClaimDetail(claimQuery.data), [claimQuery.data])

  return (
    <div className={claimsPageClass}>
      <PageHeader
        title={claim?.claim_number || 'Claim'}
        description="Update the handler, documents, status, and emails for this claim."
        actions={[
          { label: 'Motor search', variant: 'outline', href: EROUTES.CLAIMS },
          { label: 'All claims', variant: 'outline', href: EROUTES.CLAIMS_LIST },
        ]}
      />

      {isBypass ? (
        <ClaimSurface padding="sm">
          <BypassOrgLocationPicker
            value={selectedLocationId}
            onChange={setLocationId}
            allowedLocationIds={allowedLocationIds}
            hint="Claim actions are scoped to the selected organization location."
          />
        </ClaimSurface>
      ) : null}

      {!canFetch ? (
        <EmptyState
          icon={Building2}
          title="Select an organization location"
          description="Choose an organization above before opening this claim."
        />
      ) : (
        <>
          {claimQuery.isPending && <p className="text-sm text-muted-foreground">Loading claim…</p>}
          {claimQuery.isError && (
            <p className="text-sm text-red-600">{extractErrorMessage(claimQuery.error)}</p>
          )}

          {claim && (
            <>
              {/* Header card: claim number, status, TAT */}
              <ClaimSurface rounded="3xl" padding="lg">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Claim</p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight">{claim.claim_number}</h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-muted px-3 py-1 text-sm font-semibold">
                      {claim.status_label}
                    </span>
                    <ClaimTatBadge badge={claim.tat_badge} />
                    {claim.tat_due_date && (
                      <span className="text-sm text-muted-foreground">Due {claim.tat_due_date}</span>
                    )}
                  </div>
                </div>
              </ClaimSurface>

              <ClaimGateBanners banners={claim.banners} />

              <ClaimActions
                claim={claim}
                orgContextHeaders={orgContextHeaders}
                onChanged={() => { void claimQuery.refetch() }}
              />

              {/* Masonry body: summary / docs / timeline pack by height */}
              <ClaimGrid masonry>
                <ClaimSurface className="mb-4 break-inside-avoid">
                  <h2 className="mb-4 text-base font-semibold">Summary</h2>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <ClaimStatTile label="Registration" value={claim.registration_number} />
                    <ClaimStatTile label="Policy number" value={claim.policy_number} />
                    <ClaimStatTile label="Certificate" value={claim.certificateNumber} />
                    <ClaimStatTile label="Claimant" value={claim.claimant_name} />
                    <ClaimStatTile label="Claimant email" value={claim.customerEmail} />
                    <ClaimStatTile label="Handler" value={claim.handler_name} />
                    <ClaimStatTile label="Category" value={claim.category} />
                    <ClaimStatTile label="Claim type" value={claim.claimTypeName} />
                    <ClaimStatTile label="Claimed amount" value={formatClaimAmount(claim.claimedAmount)} />
                    <ClaimStatTile label="Date of loss" value={claim.loss_date} />
                    <ClaimStatTile label="Notified to organization" value={claim.notifiedToOrganizationDate} />
                    <ClaimStatTile label="Notified to insurer" value={claim.notifiedToInsurerDate} />
                  </div>
                  {claim.note && (
                    <div className="mt-4 rounded-2xl border border-border/40 bg-muted/20 px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Note</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm">{claim.note}</p>
                    </div>
                  )}
                </ClaimSurface>

                <div className="mb-4 break-inside-avoid">
                  <ClaimDocuments
                    claim={claim}
                    orgContextHeaders={orgContextHeaders}
                    onChanged={() => { void claimQuery.refetch() }}
                    onRequested={() => setEmailHint('document_request')}
                  />
                </div>

                <div className="mb-4 break-inside-avoid">
                  <ClaimTimeline history={claim.history} />
                </div>
              </ClaimGrid>

              <ClaimEmail
                claim={claim}
                logs={claim.emails}
                preferredTemplate={emailHint}
                orgContextHeaders={orgContextHeaders}
                onSent={() => { void claimQuery.refetch() }}
              />
            </>
          )}
        </>
      )}
    </div>
  )
}
