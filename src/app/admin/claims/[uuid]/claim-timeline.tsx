import { humanizeStatus, type ClaimHistoryItem } from '@/utils/claims'

/** Append-only status history. Newest row is whatever order the API returned. */
export function ClaimTimeline({ history }: { history: ClaimHistoryItem[] }) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <h2 className="text-lg font-semibold">Status timeline</h2>
      {history.length === 0 && (
        <p className="text-sm text-muted-foreground">No status changes yet.</p>
      )}
      <ol className="flex flex-col gap-3">
        {history.map((item) => (
          <li key={item.id} className="border-l-2 border-primary pl-3">
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
    </section>
  )
}
