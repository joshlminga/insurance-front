/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Travel single-quote preview dialog (motor-style).
 * Shows logo → product name → Days / Basic / PHCF / Training Levy / Stamp Duty / Total,
 * then Download (PDF blob), Share → Email, and Purchase Cover.
 */
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import {
  Button,
  CustomDialogComponent,
  ReusableDropdown,
  SendDocumentsViaEmail,
} from '@/dev/core'
import { useCustomDialogContextFactory } from '@/hooks'
import { UseApiMutation } from '@/hooks/hooks'
import { formatCurrency } from '@/lib/format'
import type { SubmitResponse } from '@/types/types'
import { EMETHODS, PURCHASE_SESSION_STORAGE_KEY } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { TRAVEL_QUOTE_SESSION_STORAGE_KEY } from '@/utils/travel-enums'
import {
  clearAdminTravelDuplicatePrefill,
  readAdminTravelDuplicateSourceId,
} from '@/app/admin/quotations/travel/admin-travel-session'
import { ShowToast } from '@/utils/utils'
import {
  Download,
  Forward,
  Mail,
  Share2,
  ShoppingCart,
} from 'lucide-react'
import React from 'react'

export const TravelQuotePreviewPage = ({
  componentProps,
  handleDialogContextSwitch: closeParentDialog,
}: {
  componentProps: any
  handleDialogContextSwitch?: any
}) => {
  const item = componentProps?.data
  // Parent quotations page passes goToNextStep so Purchase Cover advances the stepper.
  const goToNextStep = componentProps?.goToNextStep
  const org = item?.product?.organization
  const premium = item?.calculated_premium ?? {}
  const productLabel =
    item?.product?.name != null && String(item.product.name).trim() !== ''
      ? String(item.product.name)
      : 'Travel cover'
  const logo =
    org?.logo ?? org?.organization_logo
  // true = insurer rate already includes levies; false = show calculated duties
  const rateIncludesLevies = Boolean(item?.product?.levy_applied)

  const quoteSessionId = (() => {
    const storedSessionId = Number(
      sessionStorage.getItem(TRAVEL_QUOTE_SESSION_STORAGE_KEY),
    )
    if (Number.isFinite(storedSessionId) && storedSessionId > 0) {
      return storedSessionId
    }
    return null
  })()

  const data = {
    product_id: item?.product_id ?? item?.product?.id,
    rate_id: item?.rate_id ?? item?.id,
  }

  const submitMutation = UseApiMutation<Blob, void>({
    url: `document/travel/single-quote/${quoteSessionId}`,
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
        ShowToast.error(message || 'Failed to generate preview!')
      },
    },
  })

  const onSubmit = (payload: typeof data) => {
    if (!quoteSessionId) {
      ShowToast.error('No active quote session found.')
      return
    }
    if (payload.product_id == null || payload.rate_id == null) {
      ShowToast.error('Missing product or rate for this offer.')
      return
    }
    submitMutation.mutate(payload as any)
  }

  // Start travel purchase from the preview dialog.
  const submitPurchaseMutation = UseApiMutation<SubmitResponse, any>({
    url: `purchase/travel/${quoteSessionId}`,
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (responseData) => {
        const purchaseId = responseData?.data?.purchase_id
        if (purchaseId === undefined || purchaseId === null) {
          ShowToast.error(
            'Purchase session could not be initialized. Please try again.',
          )
          return
        }
        sessionStorage.setItem(PURCHASE_SESSION_STORAGE_KEY, String(purchaseId))
        clearAdminTravelDuplicatePrefill()
        // Close the quote preview dialog (parent CustomDialog).
        closeParentDialog?.({})
        goToNextStep?.()
        ShowToast.success(responseData?.message ?? 'Purchase started')
      },
      onError: (error: unknown) => {
        const message = extractErrorMessage(error)
        ShowToast.error(message || 'Purchase failed!')
      },
    },
  })

  const onPurchase = (payload: typeof data) => {
    if (!quoteSessionId) {
      ShowToast.error('No active quote session found.')
      return
    }
    if (payload.product_id == null || payload.rate_id == null) {
      ShowToast.error('Missing product or rate for this offer.')
      return
    }
    const quoteDuplicate = readAdminTravelDuplicateSourceId()
    submitPurchaseMutation.mutate({
      ...payload,
      ...(quoteDuplicate ? { quote_duplicate: quoteDuplicate } : {}),
    })
  }

  const { handleDialogContextSwitch, dialogContent, dialogOpen } =
    useCustomDialogContextFactory<{
      refetch?: () => Promise<any>
      data?: any
      sessionStorageKey?: string
      sendUrl?: string
      documentLine?: string
    }>()

  const tripDays = premium?.trip_days
  const basicPremium = Number(premium?.basic_premium ?? 0)
  const phcf = Number(premium?.phcf ?? 0)
  const trainingLevy = Number(premium?.training_levy ?? 0)
  const stampDuty = Number(premium?.stamp_duty ?? 0)
  const totalPremium = Number(premium?.total_premium ?? 0)

  // Single-insurer preview lists each levy separately (PDF already does this).
  const levyCell = (amount: number) =>
    rateIncludesLevies ? (
      <span className="inline-flex w-fit items-center rounded-sm bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
        Incl
      </span>
    ) : (
      formatCurrency(amount)
    )

  return (
    <>
      <div className="mx-auto w-full space-y-4 px-4 lg:max-w-100 lg:min-w-100">
        <h1 className="text-2xl font-bold">Quote Preview</h1>
        <Card className="flex items-center justify-center border border-[#ADABAB] py-6 shadow-none">
          <div className="flex w-full flex-col items-center gap-1.5 px-3">
            <div className="flex h-15 w-27.25 items-center justify-center">
              {logo ? (
                <img
                  src={logo}
                  alt={productLabel}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="text-center text-xs font-semibold text-gray-900">
                  {org?.organization_name ?? org?.name ?? 'Insurer'}
                </span>
              )}
            </div>
            <p className="line-clamp-2 px-1 text-center text-[11px] font-medium leading-tight text-gray-800">
              {productLabel}
            </p>
          </div>
          <CardContent className="w-full space-y-4">
            <div className="grid grid-cols-2 gap-y-3 text-md">
              <span>Number of Days</span>
              <span className="text-right font-medium">
                {tripDays != null && tripDays !== '' ? tripDays : '—'}
              </span>

              <span>Basic Premium</span>
              <span className="text-right font-medium">
                {formatCurrency(basicPremium)}
              </span>

              <span>PHCF</span>
              <span className="text-right font-medium">{levyCell(phcf)}</span>

              <span>Training Levy</span>
              <span className="text-right font-medium">
                {levyCell(trainingLevy)}
              </span>

              <span>Stamp Duty</span>
              <span className="text-right font-medium">
                {levyCell(stampDuty)}
              </span>
            </div>
            <div className="grid grid-cols-2 text-sm font-semibold">
              <span>Total Premium</span>
              <span className="text-right text-[#C20C0C]">
                {formatCurrency(totalPremium)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <CardFooter className="mt-2 flex flex-col gap-2 px-0 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <div className="flex w-full gap-2 2xl:w-auto">
          <Button
            variant="outline"
            leftIcon={<Download />}
            onClick={() => {
              onSubmit(data)
            }}
            loading={submitMutation.isPending}
            className="flex-1 border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 2xl:flex-none"
          >
            Download
          </Button>
          <ReusableDropdown
            trigger={
              <Button
                className="flex-1 bg-[#C20C0C] text-white hover:bg-[#A30A0A] focus-visible:ring-[#C20C0C]/30 2xl:flex-none"
                leftIcon={<Forward />}
              >
                Share
              </Button>
            }
            items={[
              {
                label: 'Email',
                icon: <Mail className="h-4 w-4" />,
                onClick: () => {
                  handleDialogContextSwitch({
                    componentProps: {
                      data,
                      sessionStorageKey: TRAVEL_QUOTE_SESSION_STORAGE_KEY,
                      sendUrl: `document/travel/send-quote-via-email/${quoteSessionId}`,
                    },
                    Component: SendDocumentsViaEmail,
                  })
                },
              },
              {
                label: 'WhatsApp',
                icon: <Share2 className="h-4 w-4" />,
              },
            ]}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          leftIcon={<ShoppingCart />}
          onClick={() => onPurchase(data)}
          loading={submitPurchaseMutation.isPending}
          disabled={
            !quoteSessionId ||
            data.product_id == null ||
            data.rate_id == null
          }
          className="w-full border-[#C20C0C] bg-[#FFF5F5] text-[#C20C0C] hover:bg-[#C20C0C] hover:text-white focus-visible:ring-[#C20C0C]/30 2xl:w-auto"
        >
          Purchase Cover
        </Button>
      </CardFooter>

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
    </>
  )
}
