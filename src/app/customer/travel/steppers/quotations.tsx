/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from '@/components/ui/input'
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
import { Slider } from '@/components/ui/slider'
import {
  Button,
  CustomDialogComponent,
  EmptyState,
  ReusableCard,
  ReusablePagination,
  SkeletonCard,
} from '@/dev/core'
import { useCustomDialogContextFactory, useDebounce } from '@/hooks'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import type {
  CustomerVerificationDetailsProps,
  SelectedQuoteEntry,
  SubmitResponse,
} from '@/types/types'
import {
  EMETHODS,
  FILTEROPTIONS,
  MAX_COMPARISONS,
  PURCHASE_SESSION_STORAGE_KEY,
  ReusableReducer,
} from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import {
  buildTravelComparisonRequest,
  nextTravelQuoteSelection,
} from '@/utils/travel-comparison'
import {
  formatTravelDisplayAmount,
  formatTravelExchangeRate,
  resolveDefaultTravelCurrency,
  type TravelDisplayCurrency,
} from '@/utils/travel-display-currency'
import { TRAVEL_QUOTE_SESSION_STORAGE_KEY } from '@/utils/travel-enums'
import { ShowToast, SIDEBAR_LAYOUT_QUERY } from '@/utils/utils'
import { ArrowLeftCircle, ArrowRightCircle, ListFilter, X } from 'lucide-react'
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import { PostComparisonPage } from './quotation-pages/comparisons/[id]/page'
import { TravelQuotePreviewPage } from './quotation-pages/qoute-preview/page'

const ALL_INSURERS = 'all'
const FALLBACK_PRICE_MAX = 100_000

type TravelInsurerOption = {
  organization_location_id: number
  name: string
}

type TravelFiltersPanelProps = {
  idPrefix?: string
  currencies: TravelDisplayCurrency[]
  selectedCode: string
  onCurrencyChange: (code: string) => void
  insurers: TravelInsurerOption[]
  selectedInsurerId: string
  onInsurerChange: (value: string) => void
  priceBounds: { min: number; max: number }
  priceRange: number[]
  onPriceRangeChange: (value: number[]) => void
  disabled?: boolean
  className?: string
}

/** Sidebar: display currency + price range + insurer filter. */
function TravelFiltersPanel({
  idPrefix = 'travel-quotation',
  currencies,
  selectedCode,
  onCurrencyChange,
  insurers,
  selectedInsurerId,
  onInsurerChange,
  priceBounds,
  priceRange,
  onPriceRangeChange,
  disabled = false,
  className,
}: TravelFiltersPanelProps) {
  const currencySelectId = `${idPrefix}-display-currency`
  const insurerSelectId = `${idPrefix}-insurer`
  const sliderId = `${idPrefix}-price-slider`
  const minPriceId = `${idPrefix}-min-premium`
  const maxPriceId = `${idPrefix}-max-premium`

  const sliderMin = priceBounds.min
  const sliderMax = Math.max(priceBounds.max, priceBounds.min)
  const sliderStep = sliderMax - sliderMin > 10_000 ? 100 : 1

  const formatBound = (n: number) =>
    new Intl.NumberFormat('en-KE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n)

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
      <div className="mb-5 grid gap-2">
        <Label htmlFor={currencySelectId}>Currency</Label>
        <Select
          value={selectedCode}
          onValueChange={onCurrencyChange}
          disabled={disabled || currencies.length === 0}
        >
          <SelectTrigger
            id={currencySelectId}
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

      <h2 className="mb-1 text-base font-semibold text-gray-900 sm:text-lg">
        Insurer
      </h2>
      <hr className="mb-4" />
      <div className="mb-5 grid gap-2">
        <Label htmlFor={insurerSelectId}>Filter by insurer</Label>
        <Select
          value={selectedInsurerId}
          onValueChange={onInsurerChange}
          disabled={disabled}
        >
          <SelectTrigger
            id={insurerSelectId}
            className="h-11 w-full rounded-[5px] border border-[#ADABAB] sm:h-10"
          >
            <SelectValue placeholder="All insurers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_INSURERS}>All insurers</SelectItem>
            {insurers.map((insurer) => {
              const id = String(insurer.organization_location_id)
              return (
                <SelectItem key={id} value={id}>
                  {insurer.name || `Insurer #${id}`}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      <h2 className="mb-1 text-base font-semibold text-gray-900 sm:text-lg">
        Price Range
      </h2>
      <p className="mb-3 text-xs text-muted-foreground">
        Filter by total premium (settlement currency).
      </p>
      <hr className="mb-4" />
      <div className="grid w-full gap-3">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor={sliderId}>Premium</Label>
          <span className="text-sm text-muted-foreground">
            {formatBound(priceRange[0] ?? sliderMin)} –{' '}
            {formatBound(priceRange[1] ?? sliderMax)}
          </span>
        </div>
        <Slider
          id={sliderId}
          value={priceRange}
          onValueChange={onPriceRangeChange}
          min={sliderMin}
          max={sliderMax}
          step={sliderStep}
          disabled={disabled || sliderMax <= sliderMin}
        />
        <div className="grid grid-cols-2 gap-2">
          <div className="grid gap-1.5">
            <Label htmlFor={minPriceId} className="text-xs">
              Min
            </Label>
            <Input
              id={minPriceId}
              type="number"
              min={sliderMin}
              max={priceRange[1] ?? sliderMax}
              value={priceRange[0] ?? sliderMin}
              disabled={disabled}
              className="h-10 rounded-[5px] border border-[#ADABAB]"
              onChange={(e) => {
                const nextMin = Number(e.target.value)
                if (!Number.isFinite(nextMin)) return
                const currentMax = priceRange[1] ?? sliderMax
                onPriceRangeChange([
                  Math.min(Math.max(nextMin, sliderMin), currentMax),
                  currentMax,
                ])
              }}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={maxPriceId} className="text-xs">
              Max
            </Label>
            <Input
              id={maxPriceId}
              type="number"
              min={priceRange[0] ?? sliderMin}
              max={sliderMax}
              value={priceRange[1] ?? sliderMax}
              disabled={disabled}
              className="h-10 rounded-[5px] border border-[#ADABAB]"
              onChange={(e) => {
                const nextMax = Number(e.target.value)
                if (!Number.isFinite(nextMax)) return
                const currentMin = priceRange[0] ?? sliderMin
                onPriceRangeChange([
                  currentMin,
                  Math.max(Math.min(nextMax, sliderMax), currentMin),
                ])
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function productName(item: any): string {
  return item?.product?.name ? String(item.product.name) : 'Travel cover'
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

/** Rate: product-currency band premium — never converted by the sidebar switch. */
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

function resolvePriceBounds(raw: unknown): { min: number; max: number } {
  const bounds = (raw ?? {}) as { min?: number | null; max?: number | null }
  const min =
    bounds.min != null && Number.isFinite(Number(bounds.min))
      ? Number(bounds.min)
      : 0
  const maxRaw =
    bounds.max != null && Number.isFinite(Number(bounds.max))
      ? Number(bounds.max)
      : FALLBACK_PRICE_MAX
  return { min, max: Math.max(maxRaw, min) }
}

export const TravelQuotationsPage: React.FC<CustomerVerificationDetailsProps> = ({
  goToNextStep,
  goToPrevStep,
  missingSessionBackLabel = 'Traveller Details',
}) => {
  const [quoteSessionId, setQuoteSessionId] = useState<number | null>(null)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>('KES')
  const [selectedInsurerId, setSelectedInsurerId] = useState<string>(ALL_INSURERS)
  const [priceRange, setPriceRange] = useState<number[]>([0, FALLBACK_PRICE_MAX])
  const [appliedPriceRange, setAppliedPriceRange] = useState<number[] | null>(null)
  // Rate cards selected for side-by-side comparison (max MAX_COMPARISONS).
  const [selectedQuotes, setSelectedQuotes] = useState<SelectedQuoteEntry[]>([])
  // Tracks which card's Purchase Cover request is in flight (loading spinner).
  const [purchasingRateId, setPurchasingRateId] = useState<string | number | null>(
    null,
  )
  const currencyInitializedRef = useRef(false)
  const priceBoundsInitializedRef = useRef(false)
  const [isSidebarLayout, setIsSidebarLayout] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia(SIDEBAR_LAYOUT_QUERY).matches
      : true,
  )

  const { handleDialogContextSwitch, dialogContent, dialogOpen } =
    useCustomDialogContextFactory<{
      refetch?: () => Promise<any>
      data?: any
    }>()

  const [filter, optionsDispatcher] = useReducer(
    ReusableReducer<typeof FILTEROPTIONS & { page: number; pageSize: number }>,
    { ...FILTEROPTIONS, page: 1, pageSize: 8 },
  )

  const applyPriceRangeDebounced = useDebounce<number[]>({
    debounceTimeOut: 400,
    debounceCallback: (range) => {
      setAppliedPriceRange(range)
      optionsDispatcher({ type: 'page', payload: { page: 1 } })
    },
  })

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
    priceBoundsInitializedRef.current = false
    setSelectedInsurerId(ALL_INSURERS)
    setAppliedPriceRange(null)
    setPriceRange([0, FALLBACK_PRICE_MAX])
  }, [])

  const premiumUrl = useMemo(
    () => (quoteSessionId ? `quotation/travel/${quoteSessionId}/premium` : ''),
    [quoteSessionId],
  )

  const premiumQueryParams = useMemo(() => {
    const params: Record<string, unknown> = {
      page: filter.page,
      per_page: filter.pageSize,
      sort_by: 'total_premium',
      direction: 'asc',
    }

    if (selectedInsurerId !== ALL_INSURERS) {
      const locationId = Number(selectedInsurerId)
      if (Number.isFinite(locationId) && locationId > 0) {
        params.organization_location_id = locationId
      }
    }

    if (appliedPriceRange) {
      const [minPremium, maxPremium] = appliedPriceRange
      if (minPremium != null && Number.isFinite(minPremium)) {
        params.min_premium = minPremium
      }
      if (maxPremium != null && Number.isFinite(maxPremium)) {
        params.max_premium = maxPremium
      }
    }

    return params
  }, [
    filter.page,
    filter.pageSize,
    selectedInsurerId,
    appliedPriceRange,
  ])

  const { data, isPending, isFetching } = UseApiQuery<SubmitResponse>({
    url: premiumUrl,
    params: premiumQueryParams as Record<string, unknown>,
    queryOptions: {
      enabled: !!quoteSessionId && !!premiumUrl,
    },
  })

  // Open Quote Preview dialog (Download / Share live inside the preview).
  const handleGetQuote = (item: any) => {
    if (!quoteSessionId) {
      ShowToast.error('No active quote session found.')
      return
    }

    const productId = item?.product_id ?? item?.product?.id
    const rateId = item?.rate_id ?? item?.id
    if (productId == null || rateId == null) {
      ShowToast.error('Missing product or rate for this offer.')
      return
    }

    handleDialogContextSwitch({
      componentProps: { data: item, goToNextStep },
      Component: TravelQuotePreviewPage,
    })
  }

  // Start travel purchase → store purchase_id → KYC step.
  const submitPurchaseMutation = UseApiMutation<SubmitResponse, any>({
    url: `purchase/travel/${quoteSessionId}`,
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (responseData) => {
        setPurchasingRateId(null)
        const purchaseId = responseData?.data?.purchase_id
        if (purchaseId === undefined || purchaseId === null) {
          ShowToast.error(
            'Purchase session could not be initialized. Please try again.',
          )
          return
        }
        sessionStorage.setItem(PURCHASE_SESSION_STORAGE_KEY, String(purchaseId))
        goToNextStep?.()
        ShowToast.success(responseData?.message ?? 'Purchase started')
      },
      onError: (error: unknown) => {
        setPurchasingRateId(null)
        const message = extractErrorMessage(error)
        ShowToast.error(message || 'Purchase failed!')
      },
    },
  })

  const onPurchase = (productId: number | string, rateId: number | string) => {
    if (!quoteSessionId) {
      ShowToast.error('No active quote session found.')
      return
    }
    if (productId == null || rateId == null) {
      ShowToast.error('Missing product or rate for this offer.')
      return
    }
    setPurchasingRateId(rateId)
    submitPurchaseMutation.mutate({
      product_id: productId,
      rate_id: rateId,
    })
  }

  // Preview JSON dialog (is_download: false) — same pattern as motor.
  const submitComparisonMutation = UseApiMutation<SubmitResponse, any>({
    url: `document/travel/comparison/${quoteSessionId}`,
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (responseData) => {
        handleDialogContextSwitch({
          componentProps: {
            data: responseData,
            onDownload: () => onComparison(true),
            products: selectedQuotes,
          },
          Component: PostComparisonPage,
        })
        ShowToast.success(responseData?.message ?? 'Comparison generated')
      },
      onError: (error: unknown) => {
        const message = extractErrorMessage(error)
        ShowToast.error(message || 'Failed to generate comparison!')
      },
      retry: 3,
    },
  })

  // PDF blob popup (is_download: true).
  const submitComparisonDownloadMutation = UseApiMutation<Blob, any>({
    url: `document/travel/comparison/${quoteSessionId}`,
    method: EMETHODS.POST,
    config: {
      responseType: 'blob',
    },
    mutationOptions: {
      onSuccess: (pdfData) => {
        const blob = new Blob([pdfData], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const width = 1000
        const height = 900
        const left = window.screen.width / 2 - width / 2
        const top = window.screen.height / 2 - height / 2
        const popup = window.open(
          url,
          'PDF Preview',
          `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`,
        )
        if (!popup) {
          ShowToast.error('Popup blocked!')
        }
      },
      onError: (error: unknown) => {
        const message = extractErrorMessage(error)
        ShowToast.error(message || 'Failed to download comparison PDF!')
      },
    },
  })

  const onComparison = (isDownload = false) => {
    if (!quoteSessionId) {
      ShowToast.error('No active quote session found.')
      return
    }
    if (selectedQuotes.length < 2) {
      ShowToast.error('Select at least 2 quotations to compare.')
      return
    }

    const payload = buildTravelComparisonRequest(selectedQuotes, isDownload)

    if (isDownload) {
      submitComparisonDownloadMutation.mutate(payload)
    } else {
      submitComparisonMutation.mutate(payload)
    }
  }

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

  const availableInsurers = useMemo<TravelInsurerOption[]>(() => {
    const raw = (data?.data?.available_insurers ?? []) as TravelInsurerOption[]
    if (!Array.isArray(raw)) return []
    return raw.filter(
      (item) =>
        item?.organization_location_id != null &&
        Number.isFinite(Number(item.organization_location_id)),
    )
  }, [data?.data?.available_insurers])

  const priceBounds = useMemo(
    () => resolvePriceBounds(data?.data?.price_bounds),
    [data?.data?.price_bounds],
  )

  // Seed slider once from unfiltered price_bounds (stable across filter refetches).
  // Do not apply min/max query params until the user changes the range.
  useEffect(() => {
    if (!data?.data?.price_bounds) return
    if (priceBoundsInitializedRef.current) return
    priceBoundsInitializedRef.current = true
    setPriceRange([priceBounds.min, priceBounds.max])
  }, [data?.data?.price_bounds, priceBounds.min, priceBounds.max])

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

  // Enrich chips with live card data when the offer is still on the current page.
  const selectedQuotesDisplay = useMemo(() => {
    return selectedQuotes.map((sel) => {
      const item = quotationItems.find(
        (q: any) => String(q?.rate_id ?? q?.id) === String(sel.rate_id),
      )
      return {
        ...sel,
        insurerName:
          sel.insurerName ??
          (item ? insurerLabel(item) : 'Insurer'),
        logo: sel.logo ?? (item ? insurerLogo(item) : undefined),
        totalPremium:
          sel.totalPremium ??
          (item
            ? formatAmount(item?.calculated_premium?.total_premium)
            : undefined),
      }
    })
  }, [selectedQuotes, quotationItems, selectedCurrency, defaultCurrency])

  const isQuoteSelected = useCallback(
    (rateId: string | number) =>
      selectedQuotes.some((q) => String(q.rate_id) === String(rateId)),
    [selectedQuotes],
  )

  const toggleQuoteSelection = useCallback(
    (productId: string | number, rateId: string | number, item?: any) => {
      setSelectedQuotes((prev) => {
        const { next, error } = nextTravelQuoteSelection(prev, {
          product_id: productId,
          rate_id: rateId,
          insurerName: item ? insurerLabel(item) : 'Insurer',
          logo: item ? insurerLogo(item) : undefined,
          totalPremium: item
            ? formatTravelDisplayAmount(
                item?.calculated_premium?.total_premium,
                {
                  defaultRate: defaultCurrency.rate ?? 1,
                  selectedRate: selectedCurrency.rate ?? 1,
                  symbol: selectedCurrency.symbol,
                  code: selectedCurrency.code,
                },
              )
            : undefined,
        })
        if (error) {
          ShowToast.error(error)
        }
        return next
      })
    },
    [defaultCurrency, selectedCurrency],
  )

  const removeSelectedQuote = useCallback((rateId: string | number) => {
    setSelectedQuotes((prev) =>
      prev.filter((q) => String(q.rate_id) !== String(rateId)),
    )
  }, [])

  const handleInsurerChange = (value: string) => {
    setSelectedInsurerId(value)
    optionsDispatcher({ type: 'page', payload: { page: 1 } })
  }

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange(value)
    applyPriceRangeDebounced(value)
  }

  const filtersPanelProps: TravelFiltersPanelProps = {
    currencies: availableCurrencies,
    selectedCode: selectedCurrencyCode,
    onCurrencyChange: setSelectedCurrencyCode,
    insurers: availableInsurers,
    selectedInsurerId,
    onInsurerChange: handleInsurerChange,
    priceBounds,
    priceRange,
    onPriceRangeChange: handlePriceRangeChange,
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
            <TravelFiltersPanel
              {...filtersPanelProps}
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
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <TravelFiltersPanel
                {...filtersPanelProps}
                idPrefix="mobile-travel-quotation"
                className="px-4 py-5"
              />
            </SheetContent>
          </Sheet>
        )}

        <section className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  Travel Rate Comparison
                </h2>
                {selectedQuotes.length > 0 && (
                  <span className="rounded-full bg-[#C20C0C]/10 px-2.5 py-0.5 text-xs font-medium text-[#C20C0C]">
                    {selectedQuotes.length}/{MAX_COMPARISONS} selected
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Select 2–{MAX_COMPARISONS} offers to compare. Currency switch is
                display-only.
              </p>

              {selectedQuotesDisplay.length > 0 && (
                <div
                  className="flex flex-wrap gap-2"
                  role="list"
                  aria-label="Selected quotations for comparison"
                >
                  {selectedQuotesDisplay.map((quote) => (
                    <div
                      key={String(quote?.rate_id)}
                      role="listitem"
                      className="inline-flex max-w-full items-center gap-2 rounded-lg border border-[#C20C0C]/25 bg-[#C20C0C]/5 py-1.5 pl-2 pr-1.5 text-sm shadow-sm"
                    >
                      <div className="flex min-w-0 flex-col leading-tight">
                        <span className="max-w-40 truncate font-medium text-gray-900 sm:max-w-48">
                          {quote?.insurerName}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSelectedQuote(quote?.rate_id)}
                        className="shrink-0 rounded-full p-1 text-gray-500 transition-colors hover:bg-[#C20C0C]/15 hover:text-[#C20C0C]"
                        aria-label={`Remove ${quote?.insurerName} from comparison`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                  Filters
                </Button>
              )}
              <Button
                type="button"
                className="w-full rounded bg-[#C20C0C]/80 px-5 py-2 text-sm font-medium text-white hover:bg-[#C20C0C] sm:w-auto"
                onClick={() => onComparison(false)}
                loading={
                  submitComparisonMutation.isPending ||
                  submitComparisonDownloadMutation.isPending
                }
                disabled={selectedQuotes.length < 2 || !quoteSessionId}
              >
                Generate Comparison
                {selectedQuotes.length > 0 &&
                  ` (${selectedQuotes.length}/${MAX_COMPARISONS})`}
              </Button>
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
                    const coverName = productName(item)
                    const premium = item?.calculated_premium ?? {}
                    const productId = item?.product_id ?? item?.product?.id
                    const rateId = item?.rate_id ?? item?.id
                    // true = insurer rate already includes levies; false = show calculated duties
                    const rateIncludesLevies = Boolean(item?.product?.levy_applied)
                    const rowClass =
                      'flex flex-row items-center justify-between gap-2'

                    return (
                      <ReusableCard
                        key={item?.id ?? item?.rate_id ?? `quotation-${itemIndex}`}
                        selected={isQuoteSelected(rateId)}
                        onChange={() =>
                          toggleQuoteSelection(productId, rateId, item)
                        }
                        headerClassName="px-2 pt-2 pb-1 sm:px-3"
                        header={
                          logo
                            ? {
                                type: 'custom' as const,
                                node: (
                                  <div className="flex w-full flex-col items-center gap-1">
                                    <div className="flex h-11 w-full max-w-27 items-center justify-center sm:h-12">
                                      <img
                                        src={logo}
                                        alt={`${name} logo`}
                                        className="max-h-10 w-auto max-w-full object-contain"
                                      />
                                    </div>
                                    <h3 className="text-xs font-semibold leading-tight text-gray-900">
                                      {coverName}
                                    </h3>
                                  </div>
                                ),
                              }
                            : {
                                type: 'custom' as const,
                                node: (
                                  <div className="flex w-full flex-col items-center gap-0.5 text-center">
                                    <h3 className="text-xs font-semibold leading-tight text-gray-900">
                                      {coverName}
                                    </h3>
                                    {name !== coverName ? (
                                      <p className="text-[11px] leading-tight text-gray-500">
                                        {name}
                                      </p>
                                    ) : null}
                                  </div>
                                ),
                              }
                        }
                        rootClassName="@container/quote-card h-auto w-full"
                        contentClassName="px-3 pt-1 pb-1 sm:px-4"
                        footerClassName="flex flex-row items-center justify-between gap-2 px-3 pt-0 pb-2 sm:px-4"
                        footer={
                          <>
                            <Button
                              type="button"
                              onClick={() => handleGetQuote(item)}
                              disabled={!quoteSessionId}
                              className="min-w-0 flex-1 rounded-md border border-[#D9D9D9] bg-[#C20C0C] px-2 py-2 text-sm font-medium text-white hover:bg-[#C20C0C]/90 sm:px-3"
                            >
                              Get Quote
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => onPurchase(productId, rateId)}
                              loading={
                                submitPurchaseMutation.isPending &&
                                purchasingRateId === rateId
                              }
                              disabled={
                                !quoteSessionId ||
                                productId == null ||
                                rateId == null ||
                                (submitPurchaseMutation.isPending &&
                                  purchasingRateId !== rateId)
                              }
                              className="min-w-0 flex-1 border-[#C20C0C] bg-[#FFF5F5] px-2 py-2 text-sm text-[#C20C0C] hover:bg-[#C20C0C] hover:text-white sm:px-3"
                            >
                              Purchase Cover
                            </Button>
                          </>
                        }
                      >
                        <div className="space-y-1">
                          <div className={rowClass}>
                            <span className="min-w-0 text-xs text-gray-500 sm:text-sm">
                              {premium?.trip_days != null && premium?.trip_days !== '' ? (
                                <>
                                  Rate for{' '}
                                  <span className="font-semibold text-[#C20C0C]">
                                    {premium.trip_days}
                                  </span>{' '}
                                  days
                                </>
                              ) : (
                                'Rate'
                              )}
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
                              Exchange Rate
                            </span>
                            <span className="shrink-0 text-xs font-medium text-gray-900 sm:text-sm">
                              {formatTravelExchangeRate({
                                exchangeRate: premium?.exchange_rate,
                                sourceCode: premium?.source_currency_code,
                                defaultRate: defaultCurrency.rate ?? 1,
                                selectedRate: selectedCurrency.rate ?? 1,
                                selectedCode: selectedCurrency.code,
                              })}
                            </span>
                          </div>

                          <div className={rowClass}>
                            <span className="min-w-0 text-xs text-gray-500 sm:text-sm">
                              PHCF, TL & Duty
                            </span>
                            {rateIncludesLevies ? (
                              <span className="inline-flex w-fit shrink-0 items-center rounded-sm bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                Incl
                              </span>
                            ) : (
                              <span className="shrink-0 text-xs font-medium text-gray-900 sm:text-sm">
                                {formatAmount(premium?.total_duty)}
                              </span>
                            )}
                          </div>

                          <div
                            className={`${rowClass} border-t border-b border-gray-200 py-1`}
                          >
                            <span className="min-w-0 text-xs font-bold text-gray-500 sm:text-sm">
                              Premium
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

      <CustomDialogComponent
        {...{ handleDialogContextSwitch, dialogOpen }}
        className="w-[95vw] p-4 sm:max-w-fit sm:w-auto sm:p-6"
      >
        {dialogContent?.Component && (
          <dialogContent.Component
            {...{
              componentProps: dialogContent.componentProps,
              handleDialogContextSwitch,
            }}
          />
        )}
      </CustomDialogComponent>
    </div>
  )
}
