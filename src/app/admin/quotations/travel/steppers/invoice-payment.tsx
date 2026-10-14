/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Admin travel invoice — same as customer TravelInvoicesPage,
 * but prefills payee contact from admin session.
 */
import { CardFooter } from '@/components/ui/card'
import { Button, ReuseableInput } from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import { InvoicePaymentSchema } from '@/types/form-schema'
import type { InvoicePaymentFormValues } from '@/types/schema'
import type { SubmitResponse } from '@/types/types'
import { EMETHODS, INVOICE_SESSION_STORAGE_KEY } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { AdminTravelStepProps } from '../admin-step-props'
import { readAdminTravelCustomerContact } from '../admin-travel-session'
import { readTravelDepartureDateFromSession } from '@/app/customer/travel/steppers/travel-quotation-session'

const readSessionValue = (key: string) => {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(key)
}

export const AdminTravelInvoicePayment: React.FC<AdminTravelStepProps> = ({
  goToNextStep,
  goToPrevStep,
  defaultCustomerContact,
}) => {
  const contact = defaultCustomerContact ?? readAdminTravelCustomerContact()
  const [purchaseSessionId] = useState(() =>
    readSessionValue(INVOICE_SESSION_STORAGE_KEY),
  )
  // Cover starts on trip departure — locked from quotation session
  const [departureDate] = useState(() => readTravelDepartureDateFromSession())

  const form = useForm<InvoicePaymentFormValues>({
    resolver: zodResolver(InvoicePaymentSchema),
    defaultValues: {
      name: contact.name ?? '',
      email: contact.email ?? '',
      phone: contact.phone ?? '',
      cover_start_date: departureDate,
      payment_plan: 'Full',
    },
  })

  const submitMutation = UseApiMutation<
    SubmitResponse,
    InvoicePaymentFormValues
  >({
    url: `purchase/travel/${purchaseSessionId}/invoice`,
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (data) => {
        goToNextStep?.()
        ShowToast.success(data.message || 'Submitted successfully!')
      },
      onError: (error: any) => {
        const message = extractErrorMessage(error)
        ShowToast.error(message || 'Submission failed!')
      },
    },
  })

  const onSubmit = (data: InvoicePaymentFormValues) => {
    if (!purchaseSessionId) {
      ShowToast.error(
        'No active invoice session found. Please complete KYC again.',
      )
      return
    }

    submitMutation.mutate({
      ...data,
      payment_plan: 'Full',
    })
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="mx-auto w-full bg-transparent"
    >
      <div className="rounded-2xl border border-[#ADABAB]/50 bg-linear-to-b from-white to-neutral-50/90 p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-0.5 pb-3">
          <h2 className="text-base font-semibold sm:text-lg">Invoice details</h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Confirm who receives the invoice and when cover starts.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ReuseableInput
            control={form.control}
            name="name"
            label="Full Name"
            required
          />
          <ReuseableInput
            control={form.control}
            name="email"
            label="Email"
            type="email"
            required
          />
          <ReuseableInput
            control={form.control}
            name="phone"
            label="Phone"
            type="tel"
            required
          />
          <ReuseableInput
            control={form.control}
            name="cover_start_date"
            label="Cover Start Date"
            type="date"
            required
            disabled={Boolean(departureDate)}
          />
        </div>
      </div>

      <CardFooter className="mt-4 w-full flex flex-col gap-3 px-0 sm:flex-row sm:justify-between">
        <Button
          type="button"
          className="w-full rounded-full border border-[#C20C0C] bg-transparent text-[#C20C0C] hover:bg-[#C20C0C]/10 sm:w-auto"
          leftIcon={<ArrowLeftCircle />}
          onClick={() => goToPrevStep?.()}
          disabled={submitMutation.isPending}
        >
          Previous
        </Button>
        <Button
          type="submit"
          className="w-full rounded-full bg-[#C20C0C]/90 hover:bg-[#C20C0C] sm:w-auto"
          rightIcon={<ArrowRightCircle />}
          loading={submitMutation.isPending}
          disabled={submitMutation.isPending}
        >
          Next
        </Button>
      </CardFooter>
    </form>
  )
}
