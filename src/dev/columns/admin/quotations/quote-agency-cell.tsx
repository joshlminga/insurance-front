/**
 * Agency column for Find / Listed quotation tables.
 *
 * API already picks the primary owner:
 * - agency_id when set
 * - otherwise processed_by_organization_id
 * - otherwise the country default organization
 *
 * processed_by_organization is only present when it differs from that primary.
 */
export function QuoteAgencyCell({
  agencyName,
  processedByName,
}: {
  agencyName?: string | null
  processedByName?: string | null
}) {
  return (
    <div className="space-y-0.5">
      <div>{agencyName?.trim() || '-'}</div>
      {processedByName?.trim() ? (
        <div className="text-xs text-[#C20C0C]">
          processed by {processedByName.trim()}
        </div>
      ) : null}
    </div>
  )
}
