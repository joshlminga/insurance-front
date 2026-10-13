import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { GateBanner, GateStatus, TatBadge } from '@/utils/claims'
import { tatBadgeLabel } from '@/utils/claims'
import type { FormEvent, ReactNode } from 'react'

const tatClass: Record<TatBadge, string> = {
  on_track: 'bg-emerald-100 text-emerald-800',
  due_soon: 'bg-amber-100 text-amber-900',
  overdue: 'bg-red-100 text-red-800',
  closed: 'bg-gray-100 text-gray-700',
}

/** Coloured pill from API tat.badge: on_track | due_soon | overdue | closed. */
export function ClaimTatBadge({ badge }: { badge: TatBadge | null }) {
  if (!badge) return <span className="text-muted-foreground">—</span>
  return (
    <Badge className={cn('rounded-full px-2.5 py-0.5 font-semibold shadow-none', tatClass[badge])}>
      {tatBadgeLabel(badge)}
    </Badge>
  )
}

const bannerTone: Record<GateStatus, string> = {
  pass: 'border-emerald-200/80 bg-emerald-50/80 text-emerald-950',
  warning: 'border-amber-200/80 bg-amber-50/80 text-amber-950',
  fail: 'border-red-200/80 bg-red-50/80 text-red-950',
  unknown: 'border-border/60 bg-muted/40 text-muted-foreground',
}

/**
 * Soft white/near-white panel — like a card wrapper in Blade.
 * Use for org picker, form sections, result shells, etc.
 */
export function ClaimSurface({
  children,
  className,
  rounded = '2xl',
  padding = 'md',
}: {
  children: ReactNode
  className?: string
  /** 2xl = default cards; 3xl = hero / success shells */
  rounded?: '2xl' | '3xl'
  padding?: 'sm' | 'md' | 'lg' | 'none'
}) {
  const pad =
    padding === 'none' ? '' :
      padding === 'sm' ? 'p-4' :
        padding === 'lg' ? 'p-6 md:p-8' :
          'p-5 md:p-6'

  return (
    <div
      className={cn(
        'border border-border/50 bg-card shadow-sm',
        rounded === '3xl' ? 'rounded-3xl' : 'rounded-2xl',
        pad,
        className,
      )}
    >
      {children}
    </div>
  )
}

/**
 * Responsive card grid: 1 → 2 → 3 columns on desktop.
 * When masonry=true, uses CSS columns so uneven cards pack like Pinterest.
 */
export function ClaimGrid({
  children,
  className,
  masonry = false,
}: {
  children: ReactNode
  className?: string
  masonry?: boolean
}) {
  if (masonry) {
    return (
      <div
        className={cn(
          'columns-1 gap-4 space-y-4 md:columns-2 xl:columns-3',
          className,
        )}
      >
        {children}
      </div>
    )
  }

  return (
    <div className={cn('grid gap-4 md:grid-cols-2 xl:grid-cols-3', className)}>
      {children}
    </div>
  )
}

/**
 * Compact label + value tile (policy snapshot, gate banners, summary).
 * status paints a soft pass/warn/fail background when provided.
 */
export function ClaimStatTile({
  label,
  value,
  className,
  status,
  children,
}: {
  label: string
  value?: ReactNode
  className?: string
  status?: GateStatus
  children?: ReactNode
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/40 bg-background/80 px-4 py-3 shadow-sm',
        status ? bannerTone[status] : null,
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground/90">
        {label}
      </p>
      {children ?? (
        <p className="mt-1 text-sm font-semibold break-words">{value ?? '—'}</p>
      )}
    </div>
  )
}

type SearchModeOption = { value: string; label: string }

/**
 * Wide search hero: mode chips (like radio tabs) + whatever inputs you pass as children.
 * Parent still owns the form submit / react-hook-form — this is only layout.
 */
export function ClaimSearchHero({
  modes,
  mode,
  onModeChange,
  children,
  onSubmit,
  className,
}: {
  modes: readonly SearchModeOption[]
  mode: string
  onModeChange: (value: string) => void
  children: ReactNode
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void
  className?: string
}) {
  return (
    <ClaimSurface rounded="3xl" padding="lg" className={cn('bg-card', className)}>
      <form className="flex flex-col gap-5" onSubmit={onSubmit}>
        <div className="flex flex-wrap gap-2">
          {modes.map((option) => {
            const active = option.value === mode
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onModeChange(option.value)}
                className={cn(
                  'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'border-foreground/15 bg-foreground text-background shadow-sm'
                    : 'border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted',
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          {children}
        </div>
      </form>
    </ClaimSurface>
  )
}

/**
 * Premium / risk / debit gate results as three soft tiles (not flat strips).
 */
export function ClaimGateBanners({ banners }: { banners: GateBanner[] }) {
  if (!banners.length) return null

  return (
    <ClaimSurface padding="sm" className="bg-muted/20">
      <ClaimGrid className="gap-3">
        {banners.map((banner) => (
          <ClaimStatTile
            key={banner.key}
            label={banner.title}
            status={banner.status}
            value={banner.message}
          />
        ))}
      </ClaimGrid>
    </ClaimSurface>
  )
}

/** A policy value the clerk can read but not edit. */
export function ReadOnlyField({ label, value }: { label: string; value?: string | null }) {
  return (
    <ClaimStatTile label={label} value={value || '—'} />
  )
}

export const claimFieldClass =
  'w-full h-10 rounded-xl border border-border/70 bg-background'

/** Soft page wash behind claims screens (neutral near-white). */
export const claimsPageClass = 'flex flex-col gap-5 rounded-3xl bg-muted/30 p-1 sm:p-2'
