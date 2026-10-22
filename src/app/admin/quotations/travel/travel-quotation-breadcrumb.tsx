import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
import {
  CONFIRMATION_DIALOG_CANCEL_CLASSES,
  CONFIRMATION_DIALOG_CONFIRM_CLASSES,
} from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import apiClient from '@/lib/api-client'
import type {
  TravelQuoteDuplicatePayload,
  TravelQuoteDuplicateStartAt,
  SubmitResponse,
} from '@/types/types'
import { Fragment, useMemo, useState, type MouseEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { UseAuth } from '@/stores/auth-store'
import {
  clearAdminTravelActiveSession,
  readAdminTravelQuoteSession,
} from './admin-travel-session'
import { continueAdminTravelDuplicateFlow } from './continue-duplicate-flow'

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

function startAtForStage(stage: TravelStage): TravelQuoteDuplicateStartAt {
  if (stage === 'quote') return 'quote'
  if (stage === 'rates') return 'rates'
  if (stage === 'kyc') return 'kyc'
  return 'payment'
}

type BreadcrumbSegment = {
  href: string
  title: string
  stage?: TravelStage
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
    stage: 'quote',
    isLast: currentStage === 'quote' && !pathname.includes('/fetch'),
  })

  if (pathname.includes('/fetch')) {
    segments.push({
      href: EROUTES.TRAVEL_QUOTATION_FETCH,
      title: 'Find',
      isLast: true,
    })
    return segments
  }

  if (stageIndex(currentStage) >= stageIndex('rates')) {
    segments.push({
      href: EROUTES.TRAVEL_QUOTATION_RESULTS,
      title: STAGE_LABEL.rates,
      stage: 'rates',
      isLast: currentStage === 'rates',
    })
  }

  if (stageIndex(currentStage) >= stageIndex('kyc')) {
    segments.push({
      href: EROUTES.TRAVEL_QUOTATION_PURCHASE,
      title: STAGE_LABEL.kyc,
      stage: 'kyc',
      isLast: currentStage === 'kyc',
    })
  }

  if (currentStage === 'payment') {
    const last = segments[segments.length - 1]
    if (last?.stage === 'kyc') {
      last.title = STAGE_LABEL.kyc
      last.isLast = false
    }
    segments.push({
      href: EROUTES.TRAVEL_QUOTATION_PURCHASE,
      title: STAGE_LABEL.payment,
      stage: 'payment',
      isLast: true,
    })
  }

  const lastIndex = segments.length - 1
  segments.forEach((segment, index) => {
    segment.isLast = index === lastIndex
  })

  return segments
}

export function TravelQuotationBreadcrumb() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = UseAuth()
  const pathname = location.pathname

  const [pendingNav, setPendingNav] = useState<{
    href: string
    targetStage: TravelStage
  } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const activeSession = readAdminTravelQuoteSession()
  const currentStage = resolveTravelStage(pathname)
  const segments = useMemo(() => buildTravelSegments(pathname), [pathname])

  const handleSegmentClick = (event: MouseEvent, segment: BreadcrumbSegment) => {
    if (segment.isLast || !segment.stage) return

    const targetStage = segment.stage
    if (stageIndex(targetStage) >= stageIndex(currentStage)) return

    if (!activeSession?.quoteSessionId) {
      return
    }

    event.preventDefault()
    setPendingNav({ href: segment.href, targetStage })
  }

  // "Yes Go back" cancels this quote and opens a duplicate at the earlier stage.
  const runCancelAndDuplicate = async () => {
    if (!pendingNav || !activeSession?.quoteSessionId) return

    setIsSubmitting(true)
    const sessionId = activeSession.quoteSessionId
    const startAt = startAtForStage(pendingNav.targetStage)

    try {
      const response = await apiClient.post<SubmitResponse>(
        `quotation/travel/fetch/${sessionId}/duplicate-cancel`,
        { start_at: startAt }
      )

      const payload = response.data?.data as TravelQuoteDuplicatePayload
      if (!payload?.start_quote) {
        ShowToast.error('Duplicate payload was empty')
        return
      }

      clearAdminTravelActiveSession()
      const result = await continueAdminTravelDuplicateFlow(payload, user)
      ShowToast.success('Previous quote cancelled - duplicate ready')
      setPendingNav(null)
      navigate(result.route)
    } catch (error) {
      ShowToast.error(extractErrorMessage(error) || 'Action failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
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
                        onClick={(event) => handleSegmentClick(event, segment)}
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

      <AlertDialog
        open={Boolean(pendingNav)}
        onOpenChange={(open) => {
          if (!open && !isSubmitting) setPendingNav(null)
        }}
      >
        {/* Keep fixed centering — do not add `relative` (it overrides `fixed` via twMerge) */}
        <AlertDialogContent size="sm" className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Leave this quotation step?</AlertDialogTitle>
            <AlertDialogDescription>
              You have an active travel quotation. Going back to{' '}
              <span className="font-semibold text-foreground">
                {pendingNav ? STAGE_LABEL[pendingNav.targetStage] : 'the previous step'}
              </span>{' '}
              will take you back steps behind.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              variant="ghost"
              disabled={isSubmitting}
              className={CONFIRMATION_DIALOG_CANCEL_CLASSES}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className={CONFIRMATION_DIALOG_CONFIRM_CLASSES}
              disabled={isSubmitting}
              onClick={(event) => {
                event.preventDefault()
                void runCancelAndDuplicate()
              }}
            >
              {isSubmitting ? 'Processing...' : 'Yes Go back'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
