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
import { ADMIN_MOTOR_PURCHASE_STEP_KEY } from '@/app/payment/payment-session'
import { EROUTES, EPREFIX } from '@/utils/enums'
import {
  CONFIRMATION_DIALOG_CANCEL_CLASSES,
  CONFIRMATION_DIALOG_CONFIRM_CLASSES,
} from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import apiClient from '@/lib/api-client'
import type {
  MotorQuoteDuplicatePayload,
  MotorQuoteDuplicateStartAt,
  SubmitResponse,
} from '@/types/types'
import { Fragment, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { UseAuth } from '@/stores/auth-store'
import {
  clearAdminMotorActiveSession,
  readAdminMotorQuoteSession,
} from './admin-motor-session'
import { continueAdminMotorDuplicateFlow } from './continue-duplicate-flow'

type MotorStage = 'quote' | 'rates' | 'kyc' | 'payment'

const STAGE_ORDER: MotorStage[] = ['quote', 'rates', 'kyc', 'payment']

const STAGE_LABEL: Record<MotorStage, string> = {
  quote: 'Quote',
  rates: 'Rates',
  kyc: 'KYC',
  payment: 'Payment',
}

function readPurchaseStep(): number {
  if (typeof window === 'undefined') return 1
  const stored = sessionStorage.getItem(ADMIN_MOTOR_PURCHASE_STEP_KEY)?.trim()
  const parsed = stored ? Number(stored) : 1
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : 1
}

function isMotorQuotationPath(pathname: string): boolean {
  return pathname.includes('/quotations/motor-quotations')
}

function resolveMotorStage(pathname: string): MotorStage {
  if (pathname.includes('/motor-quotations/purchase')) {
    const step = readPurchaseStep()
    return step >= 3 ? 'payment' : 'kyc'
  }
  if (pathname.includes('/motor-quotations/results')) {
    return 'rates'
  }
  if (
    pathname.includes('/motor-quotations/duplicate') ||
    pathname.endsWith('/motor-quotations')
  ) {
    return 'quote'
  }
  return 'quote'
}

function stageIndex(stage: MotorStage): number {
  return STAGE_ORDER.indexOf(stage)
}

function hrefForStage(stage: MotorStage): string {
  switch (stage) {
    case 'quote':
      return EROUTES.MOTORQUOTATIONS
    case 'rates':
      return EROUTES.MOTOR_QUOTATION_RESULTS
    case 'kyc':
    case 'payment':
      return EROUTES.MOTOR_QUOTATION_PURCHASE
    default:
      return EROUTES.MOTORQUOTATIONS
  }
}

function startAtForStage(stage: MotorStage): MotorQuoteDuplicateStartAt {
  if (stage === 'quote') return 'quote'
  if (stage === 'rates') return 'rates'
  if (stage === 'kyc') return 'kyc'
  return 'payment'
}

type BreadcrumbSegment = {
  href: string
  title: string
  stage?: MotorStage
  isLast: boolean
}

function buildMotorSegments(pathname: string): BreadcrumbSegment[] {
  const base = `/${EPREFIX.DASHBOARD}`
  const segments: BreadcrumbSegment[] = [
    { href: EROUTES.DASHBOARD, title: 'Dashboard', isLast: false },
  ]

  if (!pathname.includes('/quotations')) {
    return segments
  }

  const currentStage = resolveMotorStage(pathname)

  segments.push({
    href: `${base}/quotations/motor-quotations`,
    title: STAGE_LABEL.quote,
    stage: 'quote',
    isLast: currentStage === 'quote' && !pathname.includes('/fetch'),
  })

  if (pathname.includes('/fetch')) {
    segments.push({
      href: EROUTES.MOTOR_QUOTATION_FETCH,
      title: 'Find',
      isLast: true,
    })
    return segments
  }

  if (stageIndex(currentStage) >= stageIndex('rates')) {
    segments.push({
      href: EROUTES.MOTOR_QUOTATION_RESULTS,
      title: STAGE_LABEL.rates,
      stage: 'rates',
      isLast: currentStage === 'rates',
    })
  }

  if (stageIndex(currentStage) >= stageIndex('kyc')) {
    segments.push({
      href: EROUTES.MOTOR_QUOTATION_PURCHASE,
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
      href: EROUTES.MOTOR_QUOTATION_PURCHASE,
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

export function MotorQuotationBreadcrumb() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = UseAuth()
  const pathname = location.pathname

  const [pendingNav, setPendingNav] = useState<{
    href: string
    targetStage: MotorStage
  } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const activeSession = readAdminMotorQuoteSession()
  const currentStage = resolveMotorStage(pathname)
  const segments = useMemo(() => buildMotorSegments(pathname), [pathname])

  const handleSegmentClick = (
    event: React.MouseEvent,
    segment: BreadcrumbSegment
  ) => {
    if (segment.isLast || !segment.stage) return

    const targetStage = segment.stage
    if (stageIndex(targetStage) >= stageIndex(currentStage)) return

    if (!activeSession?.quoteSessionId) {
      return
    }

    event.preventDefault()
    setPendingNav({ href: segment.href, targetStage })
  }

  // "Yes Go back" = cancel the current quote and open a duplicate at the target step
  const runCancelAndDuplicate = async () => {
    if (!pendingNav || !activeSession?.quoteSessionId) return

    setIsSubmitting(true)
    const sessionId = activeSession.quoteSessionId
    const startAt = startAtForStage(pendingNav.targetStage)

    try {
      const response = await apiClient.post<SubmitResponse>(
        `quotation/motor/fetch/${sessionId}/duplicate-cancel`,
        { start_at: startAt }
      )

      const payload = response.data?.data as MotorQuoteDuplicatePayload
      if (!payload?.start_quote) {
        ShowToast.error('Duplicate payload was empty')
        return
      }

      clearAdminMotorActiveSession()
      const result = await continueAdminMotorDuplicateFlow(payload, user)
      ShowToast.success('Previous quote cancelled — duplicate ready')
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
              You have an active motor quotation. Going back to{' '}
              <span className="font-semibold text-foreground">
                {pendingNav ? STAGE_LABEL[pendingNav.targetStage] : 'the previous step'}
              </span>{' '}
              will take you back steps behind.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Same layout/colors as ConfirmationDialog in payment-options */}
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
