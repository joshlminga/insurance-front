import { PageHeader } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { UseApiQuery } from '@/hooks/hooks'
import type { SubmitResponse } from '@/types/types'
import {
  CLAIMS_API,
  formatClaimAmount,
  normalizeClaimDetail,
} from '@/utils/claims'
import { EROUTES } from '@/utils/enums'
import { extractErrorMessage } from '@/utils/helpers'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ClaimGateBanners, ClaimTatBadge, ReadOnlyField } from '../claim-ui'
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

  const claimQuery = UseApiQuery<SubmitResponse>({
    url: CLAIMS_API.claim(uuid),
    queryOptions: { enabled: Boolean(uuid) },
  })

  // useMemo keeps the same claim object until the GET actually returns new JSON,
  // so the forms below are not wiped on every render.
  const claim = useMemo(() => normalizeClaimDetail(claimQuery.data), [claimQuery.data])

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={claim?.claim_number || 'Claim'}
        description="Update the handler, documents, status, and emails for this claim."
        actions={[{ label: 'All claims', variant: 'outline', href: EROUTES.CLAIMS }]}
      />

      {claimQuery.isPending && <p className="text-sm text-muted-foreground">Loading claim…</p>}
      {claimQuery.isError && (
        <p className="text-sm text-red-600">{extractErrorMessage(claimQuery.error)}</p>
      )}

      {claim && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-lg bg-gray-100 font-semibold text-gray-800">{claim.status_label}</Badge>
            <ClaimTatBadge badge={claim.tat_badge} />
            {claim.tat_due_date && (
              <span className="text-sm text-muted-foreground">Due {claim.tat_due_date}</span>
            )}
          </div>

          <ClaimGateBanners banners={claim.banners} />

          <div className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-3">
            <ReadOnlyField label="Registration" value={claim.registration_number} />
            <ReadOnlyField label="Policy number" value={claim.policy_number} />
            <ReadOnlyField label="Certificate number" value={claim.certificateNumber} />
            <ReadOnlyField label="Claimant" value={claim.claimant_name} />
            <ReadOnlyField label="Claimant email" value={claim.customerEmail} />
            <ReadOnlyField label="Handler" value={claim.handler_name} />
            <ReadOnlyField label="Category" value={claim.category} />
            <ReadOnlyField label="Claim type" value={claim.claimTypeName} />
            <ReadOnlyField label="Claimed amount" value={formatClaimAmount(claim.claimedAmount)} />
            <ReadOnlyField label="Date of loss" value={claim.loss_date} />
            <ReadOnlyField label="Notified to organization" value={claim.notifiedToOrganizationDate} />
            <ReadOnlyField label="Notified to insurer" value={claim.notifiedToInsurerDate} />
          </div>

          {claim.note && (
            <div className="rounded-lg border bg-card p-4">
              <h2 className="text-lg font-semibold">Note</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm">{claim.note}</p>
            </div>
          )}

          <ClaimActions claim={claim} onChanged={() => { void claimQuery.refetch() }} />
          <ClaimDocuments
            claim={claim}
            onChanged={() => { void claimQuery.refetch() }}
            onRequested={() => setEmailHint('document_request')}
          />
          <ClaimEmail
            claim={claim}
            logs={claim.emails}
            preferredTemplate={emailHint}
            onSent={() => { void claimQuery.refetch() }}
          />
          <ClaimTimeline history={claim.history} />
        </>
      )}
    </div>
  )
}
