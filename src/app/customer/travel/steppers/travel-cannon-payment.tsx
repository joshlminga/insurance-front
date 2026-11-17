/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cannon Travel M-Pesa payment — insurer-direct STK (no Acensure invoice/Pesapal).
 * Shows amount due / quote summary, then payment/travel/{id}/cannon/payment + status poll.
 */
import { CardFooter } from '@/components/ui/card'
import { Button, ReuseableInput } from '@/dev/core'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import { useActionWaitHold } from '@/hooks/use-action-wait-hold'
import type { CustomerVerificationDetailsProps, SubmitResponse } from '@/types/types'
import {
  EMETHODS,
  PURCHASE_SESSION_STORAGE_KEY,
  TRAVEL_CANNON_CHECKOUT_KEY,
} from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'

type CannonPaymentForm = {
  phone: string
}

type TravelSummaryData = {
  quotation_code?: string
  total_premium?: number | string
  currency?: string
  currency_symbol?: string
  cover?: {
    product_name?: string
    insurer_name?: string
    plan?: string
    trip_days?: number | string
    quote_reference?: string
    policy_reference?: string
    premium?: {
      total_premium?: number | string
      currency?: string
      currency_symbol?: string
    }
  }
}

const readSessionValue = (key: string) => {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(key)
}

const formatMoney = (
  amount: number | string | null | undefined,
  symbol: string,
): string => {
  if (amount === null || amount === undefined || amount === '') {
    return '—'
  }
  const n = typeof amount === 'number' ? amount : Number(amount)
  if (Number.isNaN(n)) {
    return `${symbol} ${amount}`
  }
  return `${symbol} ${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

const isPaidOrIssued = (statusBody: any): boolean => {
  const status = String(statusBody?.status ?? statusBody?.data?.status ?? '').toLowerCase()
  const paymentStatus = String(
    statusBody?.payment?.status ?? statusBody?.data?.payment?.status ?? '',
  ).toLowerCase()
  const issuanceStatus = String(
    statusBody?.issuance?.status ?? statusBody?.data?.issuance?.status ?? '',
  ).toLowerCase()

  if (['paid', 'issued', 'active', 'completed', 'success'].includes(status)) {
    return true
  }
  if (['paid', 'success', 'completed'].includes(paymentStatus)) {
    return true
  }
  if (['issued', 'completed', 'success'].includes(issuanceStatus)) {
    return true
  }

  return false
}

export const TravelCannonPaymentPage: React.FC<CustomerVerificationDetailsProps> = ({
  goToNextStep,
  goToPrevStep,
}) => {
  const [purchaseId] = React.useState(() => readSessionValue(PURCHASE_SESSION_STORAGE_KEY))
  const [paymentStarted, setPaymentStarted] = React.useState(false)

  const form = useForm<CannonPaymentForm>({
    defaultValues: {
      phone: '',
    },
  })

  // Load amount / plan summary (same endpoint as Pesapal payment options)
  const summaryQuery = UseApiQuery<SubmitResponse>({
    url: purchaseId ? `purchase/travel/${purchaseId}/summary` : '',
    queryOptions: {
      enabled: Boolean(purchaseId),
      retry: 1,
    },
  })

  const summary = (summaryQuery.data?.data ?? summaryQuery.data) as
    | TravelSummaryData
    | undefined

  const currencySymbol =
    summary?.cover?.premium?.currency_symbol ??
    summary?.currency_symbol ??
    summary?.cover?.premium?.currency ??
    summary?.currency ??
    'KES'

  const amountDue =
    summary?.cover?.premium?.total_premium ?? summary?.total_premium ?? null

  const paymentMutation = UseApiMutation<SubmitResponse, CannonPaymentForm>({
    url: `purchase/travel/${purchaseId}/cannon/payment`,
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (data) => {
        setPaymentStarted(true)
        ShowToast.success(
          data.message || 'Check your phone and enter your M-Pesa PIN.',
        )
      },
      onError: (error: unknown) => {
        ShowToast.error(extractErrorMessage(error) || 'Failed to initiate Cannon payment.')
      },
    },
  })

  const statusQuery = UseApiQuery<SubmitResponse>({
    url: `purchase/travel/${purchaseId}/cannon/status`,
    queryOptions: {
      enabled: Boolean(purchaseId) && paymentStarted,
      refetchInterval: paymentStarted ? 4000 : false,
      refetchIntervalInBackground: true,
      retry: 1,
    },
  })

  useActionWaitHold('travel-cannon-payment-poll', paymentStarted && !statusQuery.isError, {
    detail: 'Waiting for M-Pesa confirmation from Cannon…',
  })

  React.useEffect(() => {
    if (!paymentStarted) {
      return
    }
    const body = statusQuery.data?.data ?? statusQuery.data
    if (isPaidOrIssued(body)) {
      sessionStorage.removeItem(TRAVEL_CANNON_CHECKOUT_KEY)
      goToNextStep?.()
    }
  }, [paymentStarted, statusQuery.data, goToNextStep])

  const onSubmit = (data: CannonPaymentForm) => {
    if (!purchaseId) {
      ShowToast.error('No active purchase session found.')
      return
    }
    paymentMutation.mutate({ phone: data.phone })
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="mx-auto w-full bg-transparent"
    >
      <div className="rounded-2xl border border-[#ADABAB]/50 bg-linear-to-b from-white to-neutral-50/90 p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-0.5 pb-3">
          <h2 className="text-base font-semibold sm:text-lg">Cannon M-Pesa payment</h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Payment is collected by Cannon Insurance. Confirm the amount due, then enter
            the M-Pesa number that will receive the STK push.
          </p>
        </div>

        {/* Amount / quote summary before STK */}
        <div className="mb-5 rounded-xl border border-[#ADABAB]/40 bg-white/90 p-4 text-sm">
          {summaryQuery.isLoading ? (
            <p className="text-muted-foreground">Loading payment summary…</p>
          ) : summaryQuery.isError ? (
            <p className="text-amber-700">
              Could not load summary. You can still pay — amount will be confirmed on your phone.
            </p>
          ) : (
            <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Product</dt>
                <dd className="font-medium">
                  {summary?.cover?.product_name ?? summary?.cover?.insurer_name ?? 'Cannon Travel'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Plan</dt>
                <dd className="font-medium">{summary?.cover?.plan ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Days</dt>
                <dd className="font-medium">
                  {summary?.cover?.trip_days != null && summary.cover.trip_days !== ''
                    ? String(summary.cover.trip_days)
                    : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Quote reference</dt>
                <dd className="font-medium break-all">
                  {summary?.cover?.quote_reference ?? summary?.quotation_code ?? '—'}
                </dd>
              </div>
              {summary?.cover?.policy_reference ? (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">Policy reference</dt>
                  <dd className="font-medium break-all">{summary.cover.policy_reference}</dd>
                </div>
              ) : null}
              <div className="sm:col-span-2 border-t border-[#ADABAB]/30 pt-2 mt-1">
                <dt className="text-xs text-muted-foreground">Amount due</dt>
                <dd className="text-lg font-semibold text-[#C20C0C]">
                  {formatMoney(amountDue, String(currencySymbol))}
                </dd>
              </div>
            </dl>
          )}
        </div>

        <div className="max-w-md space-y-4">
          <ReuseableInput
            className="h-10 w-full rounded-[5px] border border-[#ADABAB]"
            control={form.control}
            name="phone"
            label="M-Pesa phone number"
            placeholder="2547XXXXXXXX"
            required
          />

          {paymentStarted ? (
            <p className="text-sm text-[#C20C0C]">
              Waiting for payment confirmation… Keep this page open.
            </p>
          ) : null}
        </div>

        <CardFooter className="mt-6 flex flex-col gap-3 px-0 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => goToPrevStep?.()}
            className="w-full sm:w-auto"
          >
            <ArrowLeftCircle className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            type="submit"
            loading={paymentMutation.isPending}
            disabled={paymentMutation.isPending || paymentStarted}
            className="w-full bg-[#C20C0C] text-white hover:bg-[#C20C0C]/90 sm:w-auto"
          >
            {paymentStarted ? 'Waiting for PIN…' : 'Pay with M-Pesa'}
            <ArrowRightCircle className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </div>
    </form>
  )
}
