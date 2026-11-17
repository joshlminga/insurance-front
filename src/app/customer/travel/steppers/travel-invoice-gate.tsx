/**
 * Travel invoice step gate — Cannon-direct purchases skip Acensure invoicing
 * and create the Cannon draft policy before the M-Pesa payment step.
 */
import { TravelInvoicesPage } from '@/app/customer/travel/steppers/travel-invoices'
import { UseApiMutation } from '@/hooks/hooks'
import type { CustomerVerificationDetailsProps, SubmitResponse } from '@/types/types'
import {
  EMETHODS,
  PURCHASE_SESSION_STORAGE_KEY,
  TRAVEL_CANNON_CHECKOUT_KEY,
} from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import React from 'react'

const isCannonCheckout = () => {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(TRAVEL_CANNON_CHECKOUT_KEY) === '1'
}

const readPurchaseId = () => {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(PURCHASE_SESSION_STORAGE_KEY)
}

export const TravelInvoiceGatePage: React.FC<CustomerVerificationDetailsProps> = (props) => {
  const [purchaseId] = React.useState(() => readPurchaseId())
  const [draftReady, setDraftReady] = React.useState(false)
  const [draftFailed, setDraftFailed] = React.useState(false)
  const cannon = isCannonCheckout()

  // Create Cannon draft once when leaving KYC so payment page has policyReference
  const draftMutation = UseApiMutation<SubmitResponse, Record<string, never>>({
    url: `purchase/travel/${purchaseId}/cannon/draft-policy`,
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: () => {
        setDraftReady(true)
        props.goToNextStep?.()
      },
      onError: (error: unknown) => {
        setDraftFailed(true)
        ShowToast.error(
          extractErrorMessage(error) ||
            'Could not create Cannon draft policy. You can retry or continue — payment will try again.',
        )
      },
    },
  })

  React.useEffect(() => {
    if (!cannon || draftReady || draftFailed) {
      return
    }
    if (!purchaseId) {
      // Still advance — payment step can draft if needed
      props.goToNextStep?.()
      return
    }
    draftMutation.mutate({} as Record<string, never>)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount for Cannon
  }, [cannon, purchaseId])

  if (cannon) {
    return (
      <div className="mx-auto w-full max-w-lg space-y-4 py-10 text-center text-sm text-muted-foreground">
        <p>
          {draftMutation.isPending
            ? 'Creating Cannon draft policy…'
            : draftFailed
              ? 'Draft creation failed. Continuing to payment…'
              : 'Preparing Cannon payment…'}
        </p>
        {draftFailed ? (
          <button
            type="button"
            className="text-[#C20C0C] underline"
            onClick={() => {
              setDraftFailed(false)
              draftMutation.mutate({} as Record<string, never>)
            }}
          >
            Retry draft
          </button>
        ) : null}
        {draftFailed ? (
          <button
            type="button"
            className="ml-4 text-muted-foreground underline"
            onClick={() => props.goToNextStep?.()}
          >
            Continue anyway
          </button>
        ) : null}
      </div>
    )
  }

  return <TravelInvoicesPage {...props} />
}
