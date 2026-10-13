import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { ADMIN_TRAVEL_PURCHASE_STEP_KEY } from '@/app/payment/payment-session'
import { EROUTES, EPREFIX } from '@/utils/enums'
import { Fragment, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { readAdminTravelQuoteSession } from './admin-travel-session'

type TravelStage = 'quote' | 'rates' | 'kyc' | 'payment'

const STAGE_ORDER: TravelStage[] = ['quote', 'rates', 'kyc', 'payment']

const STAGE_LABEL: Record<TravelStage, string> = {
  quote: 'Quote',
  rates: 'Rates',
  kyc: 'KYC',
  payment: 'Payment',
}

function readPurchaseStep(): number {
  if (typeof window === 'undefined') return 1
  const stored = sessionStorage.getItem(ADMIN_TRAVEL_PURCHASE_STEP_KEY)?.trim()
  const parsed = stored ? Number(stored) : 1
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : 1
}

export function isTravelQuotationPath(pathname: string): boolean {
  return pathname.includes('/quotations/travel-quotations')
}

function resolveTravelStage(pathname: string): TravelStage {
  if (pathname.includes('/travel-quotations/purchase')) {
    const step = readPurchaseStep()
    return step >= 3 ? 'payment' : 'kyc'
  }
  if (pathname.includes('/travel-quotations/results')) {
    return 'rates'
  }
  return 'quote'
}

function stageIndex(stage: TravelStage): number {
  return STAGE_ORDER.indexOf(stage)
}

type BreadcrumbSegment = {
  href: string
  title: string
  isLast: boolean
}

function buildTravelSegments(pathname: string): BreadcrumbSegment[] {
  const base = `/${EPREFIX.DASHBOARD}`
  const segments: BreadcrumbSegment[] = [
    { href: EROUTES.DASHBOARD, title: 'Dashboard', isLast: false },
  ]

  if (!pathname.includes('/quotations')) {
    return segments
  }

  const currentStage = resolveTravelStage(pathname)

  segments.push({
    href: `${base}/quotations/travel-quotations`,
    title: STAGE_LABEL.quote,
    isLast: currentStage === 'quote',
  })

  if (stageIndex(currentStage) >= stageIndex('rates')) {
    segments.push({
      href: EROUTES.TRAVEL_QUOTATION_RESULTS,
      title: STAGE_LABEL.rates,
      isLast: currentStage === 'rates',
    })
  }

  if (stageIndex(currentStage) >= stageIndex('kyc')) {
    segments.push({
      href: EROUTES.TRAVEL_QUOTATION_PURCHASE,
      title: STAGE_LABEL.kyc,
      isLast: currentStage === 'kyc',
    })
  }

  if (currentStage === 'payment') {
    const last = segments[segments.length - 1]
    if (last) {
      last.isLast = false
    }
    segments.push({
      href: EROUTES.TRAVEL_QUOTATION_PURCHASE,
      title: STAGE_LABEL.payment,
      isLast: true,
    })
  }

  const lastIndex = segments.length - 1
  segments.forEach((segment, index) => {
    segment.isLast = index === lastIndex
  })

  return segments
}

/** Simple stage breadcrumb (v1 — no Find/Duplicate cancel flow). */
export function TravelQuotationBreadcrumb() {
  const location = useLocation()
  const pathname = location.pathname
  const activeSession = readAdminTravelQuoteSession()
  const segments = useMemo(() => buildTravelSegments(pathname), [pathname])

  return (
    <div className="min-w-0 w-auto overflow-hidden">
      <Breadcrumb>
        <BreadcrumbList className="flex-nowrap">
          {segments.map((segment, index) => (
            <Fragment key={`${segment.href}-${index}`}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem className="max-w-32 truncate sm:max-w-48">
                {segment.isLast ? (
                  <BreadcrumbPage className="truncate">{segment.title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      to={segment.href}
                      className="truncate"
                      // Only allow back-nav when a quote session exists (or Dashboard)
                      onClick={(event) => {
                        if (
                          segment.href !== EROUTES.DASHBOARD &&
                          !activeSession?.quoteSessionId &&
                          segment.href !== EROUTES.TRAVELQUOTATIONS
                        ) {
                          event.preventDefault()
                        }
                      }}
                    >
                      {segment.title}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
