/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cannon Travel M-Pesa payment — insurer-direct STK (no Acensure invoice/Pesapal).
 * Shows amount due / quote summary, then payment/travel/{id}/cannon/payment + status poll.
 *
 * Phone UI: fixed +254 prefix | local digits. Leading 0 is stripped; API gets 2547XXXXXXXX.
 */
import { normalizeLocalPhoneDigits } from '@/app/admin/quotations/motor/customer-lookup-utils'
import { CardFooter } from '@/components/ui/card'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/dev/core'
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
import { ArrowLeftCircle } from 'lucide-react'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'

type CannonPaymentForm = {
  /** Local KE digits only (no leading 0) — e.g. 708549604 */
  phoneLocal: string
}

const KE_DIAL = '254'
const KE_LOCAL_MAX = 9

/** Build Cannon payload phone: 254XXXXXXXX (no +). */
function toCannonMpesaPhone(localDigits: string): string {
  const local = normalizeLocalPhoneDigits(localDigits)
  return local ? `${KE_DIAL}${local}` : ''
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
      phoneLocal: '',
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

  const paymentMutation = UseApiMutation<SubmitResponse, { phone: string }>({
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

    const phone = toCannonMpesaPhone(data.phoneLocal)
    // KE mobile local part is 9 digits (7xxxxxxxx) → full 254 + 9 = 12
    if (!/^254[17]\d{8}$/.test(phone)) {
      form.setError('phoneLocal', {
        type: 'manual',
        message: 'Enter a valid M-Pesa number (e.g. 708549604).',
      })
      return
    }

    // #region agent log
    fetch('http://127.0.0.1:7410/ingest/d44f0587-d252-4b9d-983a-196162e430ad',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'722dc8'},body:JSON.stringify({sessionId:'722dc8',runId:'payment-skip',hypothesisId:'H5',location:'travel-cannon-payment.tsx:onSubmit',message:'user started Cannon M-Pesa',data:{purchaseId,hasPolicyReference:Boolean(summary?.cover?.policy_reference),policyReference:summary?.cover?.policy_reference??null,phoneSuffix:phone.slice(-4)},timestamp:Date.now()})}).catch(()=>{})
    // #endregion
    paymentMutation.mutate({ phone })
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
          {/* +254 | local number — same idea as admin motor phone input */}
          <Controller
            control={form.control}
            name="phoneLocal"
            rules={{ required: 'M-Pesa phone number is required' }}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  M-Pesa phone number
                  <span className="ml-1 text-red-500">*</span>
                </FieldLabel>
                <div
                  className={`flex h-10 w-full overflow-hidden rounded-[5px] border border-[#ADABAB] bg-white ${
                    fieldState.invalid ? 'border-red-500' : ''
                  }`}
                >
                  <span
                    className="flex shrink-0 items-center border-r border-[#ADABAB] bg-neutral-50 px-3 text-xs font-medium text-muted-foreground"
                    aria-hidden
                  >
                    +{KE_DIAL}
                  </span>
                  <Input
                    {...field}
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="7XX XXX XXX"
                    aria-invalid={fieldState.invalid}
                    className="h-full min-w-0 flex-1 rounded-none border-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={field.value ?? ''}
                    onChange={(e) => {
                      // Digits only; strip leading 0 (07… → 7…)
                      const digits = normalizeLocalPhoneDigits(
                        e.target.value.replace(/\D/g, ''),
                      )
                      field.onChange(digits.slice(0, KE_LOCAL_MAX))
                    }}
                  />
                </div>
                <p className="mt-1 text-xs italic text-muted-foreground">
                  Enter the number without country code. A leading 0 is removed automatically.
                </p>
                {fieldState.invalid && fieldState.error ? (
                  <FieldError className="mt-1 text-sm text-red-500">
                    {fieldState.error.message}
                  </FieldError>
                ) : null}
              </Field>
            )}
          />

          {paymentStarted ? (
            <p className="text-sm text-[#C20C0C]">
              Waiting for payment confirmation… Keep this page open.
            </p>
          ) : null}
        </div>

        <CardFooter className="mt-6 flex w-full flex-col gap-3 px-0 sm:flex-row sm:justify-between">
          <Button
            type="button"
            className="w-full min-w-[12rem] rounded-full border border-[#C20C0C] bg-transparent px-8 text-[#C20C0C] hover:bg-[#C20C0C]/10 sm:w-auto"
            leftIcon={<ArrowLeftCircle />}
            onClick={() => goToPrevStep?.()}
            disabled={paymentMutation.isPending}
          >
            Previous
          </Button>
          <Button
            type="submit"
            loading={paymentMutation.isPending}
            disabled={paymentMutation.isPending || paymentStarted}
            className="w-full min-w-[12rem] rounded-full bg-[#C20C0C]/90 px-8 text-white hover:bg-[#C20C0C] sm:w-auto"
          >
            {paymentStarted ? 'Waiting for PIN…' : 'Pay with M-Pesa'}
          </Button>
        </CardFooter>
      </div>
    </form>
  )
}
