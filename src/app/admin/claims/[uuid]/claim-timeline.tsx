import { humanizeStatus, type ClaimHistoryItem } from '@/utils/claims'
import { ClaimSurface } from '../claim-ui'

/** Append-only status history. Newest row is whatever order the API returned. */
export function ClaimTimeline({ history }: { history: ClaimHistoryItem[] }) {
  return (
    <ClaimSurface className="flex break-inside-avoid flex-col gap-3">
      <h2 className="text-base font-semibold">Status timeline</h2>
      {history.length === 0 && (
        <p className="text-sm text-muted-foreground">No status changes yet.</p>
      )}
      <ol className="flex flex-col gap-3">
        {history.map((item) => (
          <li key={item.id} className="rounded-xl border border-border/40 bg-muted/20 px-3 py-2">
            <p className="font-medium">
              {item.fromStatus ? `${humanizeStatus(item.fromStatus)} → ` : ''}
              {humanizeStatus(item.toStatus)}
            </p>
            {item.reason && <p className="text-sm">{item.reason}</p>}
            <p className="text-xs text-muted-foreground">
              {[item.userName, item.at].filter(Boolean).join(' · ') || '—'}
            </p>
          </li>
        ))}
      </ol>
    </ClaimSurface>
  )
}
