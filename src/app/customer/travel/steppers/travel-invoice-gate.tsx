/**
 * Travel invoice step gate — Cannon-direct purchases skip Acensure invoicing
 * and create the Cannon draft policy before the M-Pesa payment step.
 */
import { TravelInvoicesPage } from '@/app/customer/travel/steppers/travel-invoices'
import { Button } from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import { useTravelCannonCheckout } from '@/hooks/use-travel-cannon-checkout'
import type { CustomerVerificationDetailsProps, SubmitResponse } from '@/types/types'
import { EMETHODS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import React from 'react'

export const TravelInvoiceGatePage: React.FC<CustomerVerificationDetailsProps> = (props) => {
  const { purchaseId, isCannon, isResolving, summary } = useTravelCannonCheckout()
  const [draftReady, setDraftReady] = React.useState(false)
  const [draftFailed, setDraftFailed] = React.useState(false)
  // Prefer live insurer name from purchase summary; fall back for CannonKE checkout
  const insurerName =
    summary?.cover?.insurer_name?.trim() || (isCannon ? 'Cannon Insurance' : 'the insurer')

  const existingPolicyReference = summary?.cover?.policy_reference?.trim() || ''

  // Create Cannon draft once so payment page has policyReference
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
        const detail =
          extractErrorMessage(error) ||
          `Could not create ${insurerName} draft policy. Retry after fixing the insurer error.`
        ShowToast.error(`${insurerName} error (not Acensure): ${detail}`)
      },
    },
  })

  React.useEffect(() => {
    if (!isCannon || isResolving || draftReady || draftFailed) {
      return
    }
    if (!purchaseId) {
      props.goToNextStep?.()
      return
    }
    // Already have a Cannon draft on this purchase — go straight to M-Pesa
    if (existingPolicyReference) {
      setDraftReady(true)
      props.goToNextStep?.()
      return
    }
    draftMutation.mutate({} as Record<string, never>)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when Cannon resolved
  }, [isCannon, isResolving, purchaseId, existingPolicyReference])

  if (isResolving) {
    return (
      <div className="mx-auto w-full max-w-lg py-10 text-center text-sm text-muted-foreground">
        Checking checkout type…
      </div>
    )
  }

  if (isCannon) {
    if (draftFailed) {
      return (
        <div className="mx-auto w-full max-w-lg space-y-4 py-10">
          <div
            role="alert"
            className="rounded-md border border-[#C20C0C]/40 bg-[#FFF5F5] px-4 py-4 text-left text-sm text-[#7A0A0A]"
          >
            <p className="text-base font-semibold text-[#C20C0C]">
              {insurerName} error — not an Acensure error
            </p>
            <p className="mt-1 text-[#7A0A0A]">
              Draft creation failed at {insurerName}. M-Pesa cannot start without a draft policy
              reference. Retry with a free KRA PIN, or resume the purchase that already owns this
              KRA and complete payment there.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              type="button"
              loading={draftMutation.isPending}
              disabled={draftMutation.isPending}
              className="w-full min-w-[12rem] rounded-full bg-[#C20C0C]/90 px-8 text-white hover:bg-[#C20C0C] sm:w-auto"
              onClick={() => {
                setDraftFailed(false)
                draftMutation.mutate({} as Record<string, never>)
              }}
            >
              Retry draft
            </Button>
            {existingPolicyReference ? (
              <Button
                type="button"
                disabled={draftMutation.isPending}
                className="w-full min-w-[12rem] rounded-full border border-[#C20C0C] bg-transparent px-8 text-[#C20C0C] hover:bg-[#C20C0C]/10 sm:w-auto"
                onClick={() => props.goToNextStep?.()}
              >
                Continue to payment
              </Button>
            ) : null}
          </div>
        </div>
      )
    }

    return (
      <div className="mx-auto w-full max-w-lg space-y-4 py-10 text-center text-sm text-muted-foreground">
        <p>
          {draftMutation.isPending
            ? 'Creating Cannon draft policy…'
            : 'Preparing Cannon payment…'}
        </p>
      </div>
    )
  }

  return <TravelInvoicesPage {...props} />
}
