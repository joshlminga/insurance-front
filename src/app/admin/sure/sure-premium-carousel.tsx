import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SurePremiumOffer, SurePremiumOffersPayload } from './sure-message-sync'

/** Format amounts like Quote results (Ksh …). */
function formatPremiumAmount(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) {
    return '—'
  }
  return `Ksh\u00a0${Number(amount).toLocaleString()}`
}

/** Badge colors for Inclusive / N/A / compulsory like Quote results. */
function benefitBadgeClass(status: string): string {
  if (status === 'compulsory') return 'bg-blue-100 text-blue-700'
  if (status === 'inclusive' || status === 'selected') return 'bg-green-100 text-green-700'
  if (status === 'no') return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-600'
}

type SurePremiumCarouselProps = {
  payload: SurePremiumOffersPayload
}

/**
 * Horizontal snap carousel: ~2 insurer cards visible; arrows + swipe/scroll
 * for the rest of this page. Next API page is separate (ask Sure for page 2).
 */
export function SurePremiumCarousel({ payload }: SurePremiumCarouselProps) {
  const offers = payload.offers ?? []
  const page = payload.pagination?.page ?? 1
  const perPage = payload.pagination?.per_page ?? offers.length
  const total = payload.pagination?.total ?? offers.length
  const from = total === 0 ? 0 : (page - 1) * perPage + 1
  const to = Math.min(page * perPage, total)

  const scrollerRef = useRef<HTMLUListElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const updateScrollState = () => {
    const el = scrollerRef.current
    if (!el) {
      return
    }
    const maxScroll = el.scrollWidth - el.clientWidth
    const left = el.scrollLeft
    setCanPrev(left > 2)
    setCanNext(left < maxScroll - 2)
  }

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) {
      return
    }
    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    const ro = new ResizeObserver(() => updateScrollState())
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      ro.disconnect()
    }
    // offers length changes card count / overflow
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offers.length])

  const scrollByPage = (direction: -1 | 1) => {
    const el = scrollerRef.current
    if (!el) {
      return
    }
    // Move roughly one card (~half viewport) so two-at-a-time still snaps cleanly
    const step = Math.max(el.clientWidth * 0.5, 200)
    el.scrollBy({ left: direction * step, behavior: 'smooth' })
  }

  return (
    <div className="mt-1 space-y-2">
      <p className="text-xs text-muted-foreground">
        Premium offers
        {payload.quote_code ? ` · ${payload.quote_code}` : ''}
        {total > 0 ? ` · ${from}–${to} of ${total}` : ''}
      </p>

      <div className="relative">
        {/* Prev / next affordance — always visible when more cards exist */}
        {offers.length > 2 ? (
          <>
            <button
              type="button"
              aria-label="Previous offers"
              disabled={!canPrev}
              onClick={() => scrollByPage(-1)}
              className={cn(
                // Solid white chip so arrows stay visible over logos in light + dark
                'absolute top-1/2 left-0 z-10 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-md transition hover:bg-zinc-100 dark:border-zinc-300 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100',
                !canPrev && 'pointer-events-none opacity-35'
              )}
            >
              <ChevronLeft className="size-4" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              aria-label="Next offers"
              disabled={!canNext}
              onClick={() => scrollByPage(1)}
              className={cn(
                'absolute top-1/2 right-0 z-10 flex size-9 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-md transition hover:bg-zinc-100 dark:border-zinc-300 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100',
                !canNext && 'pointer-events-none opacity-35'
              )}
            >
              <ChevronRight className="size-4" strokeWidth={2.5} />
            </button>
          </>
        ) : null}

        {/* Fixed card basis so overflow is real (not % of growing flex track) */}
        <ul
          ref={scrollerRef}
          className="flex w-full snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Premium offer carousel"
        >
          {offers.map((offer: SurePremiumOffer, index) => {
            const insurer = offer.insurer?.trim() || `Insurer ${index + 1}`

            return (
              <li
                key={`${offer.rate_id ?? index}-${insurer}`}
                className="w-[calc(50%-0.375rem)] min-w-[calc(50%-0.375rem)] max-w-[calc(50%-0.375rem)] shrink-0 grow-0 snap-start rounded-lg border border-border bg-card px-3 py-3 text-sm"
              >
                <div className="mb-2 flex min-h-10 flex-col items-center justify-center gap-1">
                  {offer.insurer_logo ? (
                    <img
                      src={offer.insurer_logo}
                      alt={insurer}
                      className="max-h-10 max-w-full object-contain"
                    />
                  ) : null}
                  <p className="text-center text-xs font-medium text-foreground">
                    {insurer}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between gap-2">
                    <span className="text-xs text-muted-foreground">Basic Premium</span>
                    <span className="text-xs font-medium text-foreground">
                      {formatPremiumAmount(
                        offer.vehicle_premium ?? offer.basic_premium
                      )}
                    </span>
                  </div>
                  {(offer.benefit_rows ?? []).map((row) => (
                    <div
                      key={`${row.id}-${row.name}`}
                      className="flex justify-between gap-2"
                    >
                      <span className="text-xs text-muted-foreground">{row.name}</span>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium',
                          benefitBadgeClass(row.status)
                        )}
                      >
                        {row.text}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                      PHCF, TL & Stamp Duty
                    </span>
                    <span className="text-xs font-medium text-foreground">
                      {formatPremiumAmount(offer.total_duty)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2 border-y border-border py-1.5">
                    <span className="text-xs font-bold text-muted-foreground">
                      Total Premium
                    </span>
                    <span className="text-xs font-semibold text-[#C20C0C]">
                      {formatPremiumAmount(offer.total_premium)}
                    </span>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <p className="text-xs text-muted-foreground">
        Use the arrows or swipe to see more on this page
        {payload.pagination?.has_more
          ? ' · say “show more offers” for the next page'
          : ''}
        .
      </p>
    </div>
  )
}
