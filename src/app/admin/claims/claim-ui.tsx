import { Badge } from '@/components/ui/badge'
import type { GateBanner, GateStatus, TatBadge } from '@/utils/claims'
import { tatBadgeLabel } from '@/utils/claims'

const tatClass: Record<TatBadge, string> = {
  on_track: 'bg-emerald-100 text-emerald-800',
  due_soon: 'bg-amber-100 text-amber-900',
  overdue: 'bg-red-100 text-red-800',
  closed: 'bg-gray-100 text-gray-800',
}

/** Coloured pill from API tat.badge: on_track | due_soon | overdue | closed. */
export function ClaimTatBadge({ badge }: { badge: TatBadge | null }) {
  if (!badge) return <span className="text-muted-foreground">—</span>
  return (
    <Badge className={`rounded-lg font-semibold ${tatClass[badge]}`}>
      {tatBadgeLabel(badge)}
    </Badge>
  )
}

const bannerClass: Record<GateStatus, string> = {
  pass: 'border-emerald-200 bg-emerald-50 text-emerald-950',
  warning: 'border-amber-200 bg-amber-50 text-amber-950',
  fail: 'border-red-200 bg-red-50 text-red-950',
  unknown: 'border-border bg-muted text-muted-foreground',
}

/** Premium, risk note, and debit note strips shown above the claim form. */
export function ClaimGateBanners({ banners }: { banners: GateBanner[] }) {
  return (
    <div className="grid gap-3">
      {banners.map((banner) => (
        <div
          key={banner.key}
          className={`rounded-lg border px-4 py-3 ${bannerClass[banner.status]}`}
        >
          <p className="text-sm font-semibold">{banner.title}</p>
          <p className="text-sm">{banner.message}</p>
        </div>
      ))}
    </div>
  )
}

/** A policy value the clerk can read but not edit. */
export function ReadOnlyField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex h-10 items-center rounded-[5px] border border-[#ADABAB] bg-muted px-3 text-sm">
        {value || '—'}
      </div>
    </div>
  )
}

export const claimFieldClass = 'w-full h-10 rounded-[5px] border border-[#ADABAB]'
