/* eslint-disable @typescript-eslint/no-explicit-any */
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Button,
  EmptyState,
  ReusableCard,
  ReusablePagination,
  SkeletonCard,
} from '@/dev/core'
import { UseApiQuery } from '@/hooks/hooks'
import type { CustomerVerificationDetailsProps, SubmitResponse } from '@/types/types'
import {
  FILTEROPTIONS,
  ReusableReducer,
} from '@/utils/constatnts'
import { TRAVEL_QUOTE_SESSION_STORAGE_KEY } from '@/utils/travel-enums'
import {
  formatTravelDisplayAmount,
  resolveDefaultTravelCurrency,
  type TravelDisplayCurrency,
} from '@/utils/travel-display-currency'
import { SIDEBAR_LAYOUT_QUERY } from '@/utils/utils'
import { ArrowLeftCircle, ArrowRightCircle, ListFilter } from 'lucide-react'
import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react'

type TravelCurrencyPanelProps = {
  idPrefix?: string
  currencies: TravelDisplayCurrency[]
  selectedCode: string
  onCurrencyChange: (code: string) => void
  disabled?: boolean
  className?: string
}

/** Sidebar: display-currency switch only (no benefits / price filters yet). */
function TravelCurrencyPanel({
  idPrefix = 'travel-quotation',
  currencies,
  selectedCode,
  onCurrencyChange,
  disabled = false,
  className,
}: TravelCurrencyPanelProps) {
  const selectId = `${idPrefix}-display-currency`

  return (
    <div className={className}>
      <h2 className="mb-1 text-base font-semibold text-gray-900 sm:text-lg">
        Display currency
      </h2>
      <p className="mb-3 text-xs text-muted-foreground">
        Amounts are calculated in the default currency. Switching only changes
        how they are shown.
      </p>
      <hr className="mb-4" />
      <div className="grid gap-2">
        <Label htmlFor={selectId}>Currency</Label>
        <Select
          value={selectedCode}
          onValueChange={onCurrencyChange}
          disabled={disabled || currencies.length === 0}
        >
          <SelectTrigger
            id={selectId}
            className="h-11 w-full rounded-[5px] border border-[#ADABAB] sm:h-10"
          >
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {currencies.map((currency) => {
              const code = String(currency.code)
              const symbol = (currency.symbol ?? '').trim()
              const label = symbol ? `${code} (${symbol})` : code
              return (
                <SelectItem key={code} value={code}>
                  {label}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function insurerLabel(item: any): string {
  return (
    item?.product?.organization?.organization_name ??
    item?.product?.organization?.name ??
    item?.product?.name ??
    'Insurer'
  )
}

function insurerLogo(item: any): string | undefined {
  const logo =
    item?.product?.organization?.logo ??
    item?.product?.organization?.organization_logo
  return typeof logo === 'string' && logo.trim() !== '' ? logo : undefined
}

/** O/Rate: product-currency band premium — never converted by the sidebar switch. */
function formatOriginalRate(
  amount: number | string | null | undefined,
  currencyCode: string | null | undefined,
): string {
  if (amount === null || amount === undefined || amount === '') return '—'
  const n = typeof amount === 'number' ? amount : parseFloat(String(amount))
  if (!Number.isFinite(n)) return '—'

  const formatted = new Intl.NumberFormat('en-KE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)

  const code = String(currencyCode ?? '').trim()
  return code ? `${code} ${formatted}` : formatted
}

function formatExchangeRate(rate: number | string | null | undefined): string {
  if (rate === null || rate === undefined || rate === '') return '—'
  const n = typeof rate === 'number' ? rate : parseFloat(String(rate))
  if (!Number.isFinite(n)) return '—'
  return String(n)
}

export const TravelQuotationsPage: React.FC<CustomerVerificationDetailsProps> = ({
  goToNextStep,
  goToPrevStep,
  missingSessionBackLabel = 'Traveller Details',
}) => {
  const [quoteSessionId, setQuoteSessionId] = useState<number | null>(null)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>('KES')
  const currencyInitializedRef = useRef(false)
  const [isSidebarLayout, setIsSidebarLayout] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia(SIDEBAR_LAYOUT_QUERY).matches
      : true,
  )

  const [filter, optionsDispatcher] = useReducer(
    ReusableReducer<typeof FILTEROPTIONS & { page: number; pageSize: number }>,
    { ...FILTEROPTIONS, page: 1, pageSize: 8 },
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia(SIDEBAR_LAYOUT_QUERY)
    const onChange = (event: MediaQueryListEvent) => setIsSidebarLayout(event.matches)
    setIsSidebarLayout(mediaQuery.matches)
    mediaQuery.addEventListener('change', onChange)
    return () => mediaQuery.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (isSidebarLayout) setFilterSheetOpen(false)
  }, [isSidebarLayout])

  useEffect(() => {
    const storedSessionId = Number(
      sessionStorage.getItem(TRAVEL_QUOTE_SESSION_STORAGE_KEY),
    )
    if (Number.isFinite(storedSessionId) && storedSessionId > 0) {
      setQuoteSessionId(storedSessionId)
    } else {
      setQuoteSessionId(null)
    }
    currencyInitializedRef.current = false
  }, [])

  const premiumUrl = useMemo(
    () => (quoteSessionId ? `quotation/travel/${quoteSessionId}/premium` : ''),
    [quoteSessionId],
  )

  const premiumQueryParams = useMemo(
    () => ({
      page: filter.page,
      per_page: filter.pageSize,
      sort_by: 'created_at',
      direction: 'asc' as const,
    }),
    [filter.page, filter.pageSize],
  )

  const { data, isPending, isFetching } = UseApiQuery<SubmitResponse>({
    url: premiumUrl,
    params: premiumQueryParams as Record<string, unknown>,
    queryOptions: {
      enabled: !!quoteSessionId && !!premiumUrl,
    },
  })

  const quotationItems = data?.data?.results ?? []
  const availableCurrencies = useMemo<TravelDisplayCurrency[]>(() => {
    const raw = (data?.data?.available_currencies ?? []) as TravelDisplayCurrency[]
    if (Array.isArray(raw) && raw.length > 0) return raw
    // Backend may still be shipping display_currency only — keep UI usable.
    const display = data?.data?.display_currency as TravelDisplayCurrency | undefined
    if (display?.code) {
      return [
        {
          code: display.code,
          symbol: display.symbol ?? display.code,
          rate: display.rate ?? 1,
        },
      ]
    }
    return [{ code: 'KES', symbol: 'KSh', rate: 1 }]
  }, [data?.data?.available_currencies, data?.data?.display_currency])

  const defaultCurrency = useMemo(
    () =>
      resolveDefaultTravelCurrency(
        data?.data?.display_currency as TravelDisplayCurrency | undefined,
        availableCurrencies,
      ),
    [data?.data?.display_currency, availableCurrencies],
  )

  // On first premium payload: default to display_currency (usually KES).
  // If the selected code disappears from the list, fall back to default.
  useEffect(() => {
    if (!data) return
    const codes = new Set(availableCurrencies.map((c) => String(c.code)))
    if (!currencyInitializedRef.current) {
      currencyInitializedRef.current = true
      setSelectedCurrencyCode(defaultCurrency.code)
      return
    }
    if (!codes.has(selectedCurrencyCode)) {
      setSelectedCurrencyCode(defaultCurrency.code)
    }
  }, [data, availableCurrencies, defaultCurrency.code, selectedCurrencyCode])

  const selectedCurrency = useMemo(() => {
    return (
      availableCurrencies.find((c) => String(c.code) === selectedCurrencyCode) ??
      defaultCurrency
    )
  }, [availableCurrencies, selectedCurrencyCode, defaultCurrency])

  const formatAmount = (baseAmount: number | string | null | undefined) =>
    formatTravelDisplayAmount(baseAmount, {
      defaultRate: defaultCurrency.rate ?? 1,
      selectedRate: selectedCurrency.rate ?? 1,
      symbol: selectedCurrency.symbol,
      code: selectedCurrency.code,
    })

  const currentPage = data?.pagination?.current_page ?? filter.page
  const lastPage = data?.pagination?.last_page ?? 1

  const currencyPanelProps: TravelCurrencyPanelProps = {
    currencies: availableCurrencies,
    selectedCode: selectedCurrencyCode,
    onCurrencyChange: setSelectedCurrencyCode,
    disabled: isFetching || !quoteSessionId,
  }

  return (
    <div className="w-full min-w-0 space-y-4 sm:space-y-6">
      {!quoteSessionId && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>Quote session not found.</strong> Go back to {missingSessionBackLabel}{' '}
          and submit again.
        </div>
      )}

      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:gap-5 min-[1600px]:gap-6">
        {isSidebarLayout ? (
          <aside className="w-full shrink-0 xl:flex xl:w-64 min-[1600px]:w-72">
            <TravelCurrencyPanel
              {...currencyPanelProps}
              className="sticky top-24 w-full rounded-lg border border-gray-200 bg-white px-4 py-5 xl:px-5 xl:py-6"
            />
          </aside>
        ) : (
          <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
            <SheetContent
              side="left"
              className="w-[min(100vw-2rem,20rem)] overflow-y-auto p-0"
            >
              <SheetHeader className="border-b px-4 py-4 text-left">
                <SheetTitle>Display options</SheetTitle>
              </SheetHeader>
              <TravelCurrencyPanel
                {...currencyPanelProps}
                idPrefix="mobile-travel-quotation"
                className="px-4 py-5"
              />
            </SheetContent>
          </Sheet>
        )}

        <section className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
              <h2 className="text-lg font-semibold text-gray-900">
                Travel Rate Comparison
              </h2>
              <p className="text-sm text-muted-foreground">
                Premium offers for your trip. Currency switch is display-only.
              </p>
            </div>

            <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 sm:w-auto sm:gap-3">
              {isFetching && (
                <span className="w-full animate-pulse text-xs text-gray-400 sm:w-auto">
                  Fetching premium quotations…
                </span>
              )}
              {!isSidebarLayout && (
                <Button
                  variant="outline"
                  type="button"
                  className="flex w-full items-center justify-center gap-2 sm:w-auto"
                  onClick={() => setFilterSheetOpen(true)}
                  leftIcon={<ListFilter className="h-4 w-4" />}
                >
                  Currency
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 md:grid-cols-3 sm:gap-5 lg:gap-6">
            {isPending && !data
              ? Array.from({ length: filter.pageSize }).map((_, i) => (
                  <SkeletonCard key={`skeleton-${i}`} />
                ))
              : quotationItems.length === 0
                ? (
                    <EmptyState />
                  )
                : quotationItems.map((item: any, itemIndex: number) => {
                    const logo = insurerLogo(item)
                    const name = insurerLabel(item)
                    const premium = item?.calculated_premium ?? {}
                    const plan = item?.plan
                    const tripDays = premium?.trip_days
                    const levyApplied = Boolean(item?.product?.levy_applied)
                    const rowClass =
                      'flex flex-row items-center justify-between gap-2'

                    return (
                      <ReusableCard
                        key={item?.id ?? item?.rate_id ?? `quotation-${itemIndex}`}
                        headerClassName="p-2 sm:p-3"
                        header={
                          logo
                            ? {
                                type: 'image' as const,
                                src: logo,
                                alt: `${name} logo`,
                                className: 'max-h-12 w-auto object-contain',
                              }
                            : {
                                type: 'text' as const,
                                title: name,
                                description: item?.product?.name
                                  ? String(item.product.name)
                                  : undefined,
                              }
                        }
                        rootClassName="@container/quote-card h-auto w-full"
                        contentClassName="px-3 py-2 sm:px-4"
                        footerClassName="flex flex-col gap-2 px-3 pb-3 sm:px-4 min-[1600px]:flex-row min-[1600px]:items-center min-[1600px]:justify-between"
                        footer={
                          <>
                            <Button
                              type="button"
                              disabled
                              className="w-full rounded-md border border-[#D9D9D9] bg-[#C20C0C] px-3 py-2 text-sm font-medium text-white hover:bg-[#C20C0C]/90 min-[1600px]:w-auto min-[1600px]:px-4"
                            >
                              Get Quote
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              disabled
                              className="w-full border-[#C20C0C] bg-[#FFF5F5] text-[#C20C0C] min-[1600px]:w-auto"
                            >
                              Purchase Cover
                            </Button>
                          </>
                        }
                      >
                        <div className="space-y-1.5">
                          <div className={rowClass}>
                            <span className="min-w-0 text-xs text-gray-500 sm:text-sm">
                              Travel Plan
                            </span>
                            <span className="shrink-0 text-xs font-medium text-gray-900 sm:text-sm">
                              {plan ? String(plan) : '—'}
                            </span>
                          </div>

                          <div className={rowClass}>
                            <span className="min-w-0 text-xs text-gray-500 sm:text-sm">
                              Days
                            </span>
                            <span className="shrink-0 text-xs font-medium text-gray-900 sm:text-sm">
                              {tripDays != null && tripDays !== ''
                                ? String(tripDays)
                                : '—'}
                            </span>
                          </div>

                          <div className={rowClass}>
                            <span className="min-w-0 text-xs text-gray-500 sm:text-sm">
                              O/Rate
                            </span>
                            <span className="shrink-0 text-xs font-medium text-gray-900 sm:text-sm">
                              {formatOriginalRate(
                                premium?.source_basic_premium,
                                premium?.source_currency_code,
                              )}
                            </span>
                          </div>

                          <div className={rowClass}>
                            <span className="min-w-0 text-xs text-gray-500 sm:text-sm">
                              E/Rate
                            </span>
                            <span className="shrink-0 text-xs font-medium text-gray-900 sm:text-sm">
                              {formatExchangeRate(premium?.exchange_rate)}
                            </span>
                          </div>

                          <div className={rowClass}>
                            <span className="min-w-0 text-xs text-gray-500 sm:text-sm">
                              PHCF, TL & Stamp Duty
                            </span>
                            {levyApplied ? (
                              <span className="shrink-0 text-xs font-medium text-gray-900 sm:text-sm">
                                {formatAmount(premium?.total_duty)}
                              </span>
                            ) : (
                              <span className="inline-flex w-fit shrink-0 items-center rounded-sm bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                Incl
                              </span>
                            )}
                          </div>

                          <div
                            className={`${rowClass} border-t border-b border-gray-200 py-2`}
                          >
                            <span className="min-w-0 text-xs font-bold text-gray-500 sm:text-sm">
                              Total Premium
                            </span>
                            <span className="shrink-0 text-xs font-semibold text-[#C20C0C] sm:text-sm">
                              {formatAmount(premium?.total_premium)}
                            </span>
                          </div>
                        </div>
                      </ReusableCard>
                    )
                  })}
          </div>
        </section>
      </div>

      <div className="flex flex-col items-stretch justify-between gap-4 px-0 pt-2 sm:flex-row sm:items-center">
        <Button
          type="button"
          className="w-full rounded-full border border-[#C20C0C] bg-transparent px-5 py-2 text-sm font-medium text-[#C20C0C] hover:bg-[#C20C0C]/10 sm:w-auto"
          leftIcon={<ArrowLeftCircle className="h-4 w-4" />}
          onClick={() => goToPrevStep?.()}
        >
          Previous
        </Button>
        <ReusablePagination
          currentPage={currentPage}
          pageCount={lastPage}
          totalPages={lastPage}
          onPageChange={(nextPage) =>
            optionsDispatcher({ type: 'page', payload: { page: nextPage } })
          }
          disabled={isFetching || !quoteSessionId}
        />
        <Button
          type="button"
          className="w-full rounded-full bg-[#C20C0C]/80 px-5 py-2 text-sm font-medium text-white hover:bg-[#C20C0C] sm:w-auto"
          rightIcon={<ArrowRightCircle className="h-4 w-4" />}
          onClick={() => goToNextStep?.()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
