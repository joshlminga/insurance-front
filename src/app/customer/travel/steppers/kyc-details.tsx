/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Travel KYC — one “Customer Info & Documents” block per traveller.
 * Prefills from TRAVEL_QUOTATION_FORM_SESSION_KEY; submits multipart to
 * purchase/travel/{purchaseId}/kyc.
 */
import { CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { TravelerNationalitySelect } from '@/app/customer/travel/steppers/traveler-nationality-select'
import {
  Button,
  ReuseableInput,
} from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import { TravelKycSchema } from '@/types/form-schema'
import type { TravelKycFormValues } from '@/types/schema'
import type {
  CustomerVerificationDetailsProps,
  SubmitResponse,
} from '@/types/types'
import {
  EMETHODS,
  INVOICE_SESSION_STORAGE_KEY,
  PURCHASE_SESSION_STORAGE_KEY,
} from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { TRAVEL_QUOTATION_FORM_SESSION_KEY } from '@/utils/travel-enums'
import { invalidSelectClassName, ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react'
import React, { useState } from 'react'
import {
  Controller,
  useFieldArray,
  useForm,
  type Path,
} from 'react-hook-form'

type ServerFieldError = {
  name: Path<TravelKycFormValues>
  message: string
}

type BoxHeaderProps = {
  title: string
  description?: string
}

const inputClassName =
  'w-full min-w-0 h-11 sm:h-10 rounded-[5px] border border-[#ADABAB]'

const FILE_FIELDS = new Set(['passport_attachment', 'tax_certificate'])

const blankKycTraveler = (): TravelKycFormValues['travelers'][number] => ({
  first_name: '',
  middle_name: '',
  surname: '',
  email: '',
  phone: '',
  date_of_birth: '',
  nationality: '',
  passport_number: '',
  tax_number: '',
  next_of_kin_name: '',
  next_of_kin_phone: '',
  physical_address: '',
  passport_attachment: undefined as unknown as File,
  tax_certificate: undefined as unknown as File,
})

/** Prefill KYC travellers from the quote form saved in sessionStorage. */
function readTravelersFromSession(): TravelKycFormValues['travelers'] {
  if (typeof window === 'undefined') {
    return [blankKycTraveler()]
  }

  try {
    const raw = sessionStorage.getItem(TRAVEL_QUOTATION_FORM_SESSION_KEY)
    if (!raw) {
      return [blankKycTraveler()]
    }

    const parsed = JSON.parse(raw) as {
      travelers?: Array<Record<string, unknown>>
    }
    const travelers = Array.isArray(parsed?.travelers) ? parsed.travelers : []

    if (travelers.length === 0) {
      return [blankKycTraveler()]
    }

    return travelers.map((traveler) => ({
      first_name: String(traveler?.first_name ?? ''),
      middle_name: String(traveler?.middle_name ?? ''),
      surname: String(traveler?.surname ?? ''),
      email: String(traveler?.email ?? ''),
      phone: String(traveler?.phone ?? ''),
      date_of_birth: String(traveler?.date_of_birth ?? ''),
      nationality: String(traveler?.nationality ?? ''),
      passport_number: '',
      tax_number: '',
      next_of_kin_name: '',
      next_of_kin_phone: '',
      physical_address: '',
      // File inputs cannot be prefilled — user must attach passport + KRA certificate
      passport_attachment: undefined as unknown as File,
      tax_certificate: undefined as unknown as File,
    }))
  } catch {
    return [blankKycTraveler()]
  }
}

const readSessionValue = (key: string) => {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(key)
}

const formatServerErrorValue = (value: unknown): string | null => {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join('\n')
  }
  if (typeof value === 'string') {
    return value
  }
  return null
}

/** Map Laravel 422 `errors` keys (e.g. travelers.0.email) onto RHF paths. */
const extractServerFieldErrors = (error: any): ServerFieldError[] => {
  const errors = error?.response?.data?.errors
  if (!errors || typeof errors !== 'object' || Array.isArray(errors)) {
    return []
  }

  return Object.entries(errors)
    .map(([name, value]) => ({
      name: name as Path<TravelKycFormValues>,
      message: formatServerErrorValue(value),
    }))
    .filter((fieldError): fieldError is ServerFieldError =>
      Boolean(fieldError.message),
    )
}

const BoxHeader = ({ title, description }: BoxHeaderProps) => (
  <div className="flex flex-col gap-0.5 pb-3">
    <h2 className="text-base font-semibold sm:text-lg">{title}</h2>
    {description ? (
      <p className="text-xs text-muted-foreground sm:text-sm">{description}</p>
    ) : null}
  </div>
)

/** Build multipart FormData: travelers[i][field] matching Laravel array input. */
function buildTravelKycFormData(data: TravelKycFormValues): FormData {
  const formData = new FormData()

  data.travelers.forEach((traveler, index) => {
    Object.entries(traveler).forEach(([key, value]) => {
      if (value === undefined || value === null) return

      const fieldKey = `travelers[${index}][${key}]`

      if (FILE_FIELDS.has(key)) {
        if (value instanceof File) {
          formData.append(fieldKey, value)
        }
        return
      }

      // Skip empty optional strings so backend treats them as absent
      if (typeof value === 'string' && value.trim() === '') {
        if (key === 'middle_name' || key === 'phone') {
          return
        }
      }

      formData.append(fieldKey, String(value))
    })
  })

  return formData
}

export const TravelKycDetailsPage: React.FC<CustomerVerificationDetailsProps> = ({
  goToNextStep,
  goToPrevStep,
}) => {
  const [purchaseSessionId] = useState(() =>
    readSessionValue(PURCHASE_SESSION_STORAGE_KEY),
  )
  const [defaultTravelers] = useState(() => readTravelersFromSession())

  const form = useForm<TravelKycFormValues>({
    resolver: zodResolver(TravelKycSchema),
    defaultValues: {
      travelers: defaultTravelers,
    },
  })

  const { fields } = useFieldArray({
    control: form.control,
    name: 'travelers',
  })

  const submitMutation = UseApiMutation<SubmitResponse, FormData>({
    url: `purchase/travel/${purchaseSessionId}/kyc`,
    method: EMETHODS.POST,
    config: {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
    mutationOptions: {
      onSuccess: (data) => {
        const purchaseId = data?.data?.purchase_id ?? purchaseSessionId
        if (purchaseId) {
          sessionStorage.setItem(INVOICE_SESSION_STORAGE_KEY, String(purchaseId))
        }
        goToNextStep?.()
        ShowToast.success(data.message || 'Submitted successfully!')
      },
      onError: (error: any) => {
        const fieldErrors = extractServerFieldErrors(error)
        fieldErrors.forEach(({ name, message }) => {
          form.setError(name, { type: 'server', message })
        })

        const message =
          fieldErrors.length > 0
            ? 'Please check the highlighted fields.'
            : extractErrorMessage(error)
        ShowToast.error(message || 'Submission failed!')
      },
    },
  })

  const onSubmit = (data: TravelKycFormValues) => {
    if (!purchaseSessionId) {
      ShowToast.error('No active purchase session found. Please start Purchase Cover again.')
      return
    }
    form.clearErrors()
    submitMutation.mutate(buildTravelKycFormData(data))
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="mx-auto w-full bg-transparent"
    >
      <div className="rounded-2xl border border-[#ADABAB]/50 bg-linear-to-b from-white to-neutral-50/90 p-4 shadow-sm sm:p-6">
        <div className="w-full pb-2">
          <h1 className="text-xl font-bold leading-tight tracking-tight sm:text-2xl">
            KYC <span className="text-[#C20C0C]">Info</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Complete customer details and upload documents for each traveller
            on this cover.
          </p>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground sm:text-sm">
            For children, you may use a senior traveller&apos;s email and phone
            number where needed.
          </p>
        </div>

        {!purchaseSessionId ? (
          <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <strong>Purchase session not found.</strong> Go back to quotations
            and click Purchase Cover again.
          </div>
        ) : null}

        <div className="mt-5 space-y-5">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-2xl border border-[#ADABAB]/35 bg-white/95 p-3 sm:p-5"
            >
              <BoxHeader
                title={`Customer Info & Documents — Traveller ${index + 1}`}
                description="Required fields match the travel KYC checklist (passport, KRA PIN + certificate, next of kin and physical address included)."
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                <ReuseableInput
                  className={inputClassName}
                  control={form.control}
                  name={`travelers.${index}.first_name`}
                  label="First Name"
                  required
                />
                <ReuseableInput
                  className={inputClassName}
                  control={form.control}
                  name={`travelers.${index}.middle_name`}
                  label="Middle Name (Optional)"
                />
                <ReuseableInput
                  className={inputClassName}
                  control={form.control}
                  name={`travelers.${index}.surname`}
                  label="Surname"
                  required
                />
                <ReuseableInput
                  className={inputClassName}
                  control={form.control}
                  name={`travelers.${index}.email`}
                  type="email"
                  label="Email Address"
                  required
                />
                <ReuseableInput
                  className={inputClassName}
                  control={form.control}
                  name={`travelers.${index}.phone`}
                  type="tel"
                  label="Phone Number (Optional)"
                />
                <ReuseableInput
                  className={inputClassName}
                  control={form.control}
                  type="date"
                  name={`travelers.${index}.date_of_birth`}
                  label="Date Of Birth"
                  required
                />
                <Controller
                  control={form.control}
                  name={`travelers.${index}.nationality`}
                  render={({ field: nationalityField, fieldState }) => {
                    // Lock nationality when quotation already provided it
                    const nationalityLocked = Boolean(
                      defaultTravelers[index]?.nationality,
                    )

                    return (
                      <div
                        data-invalid={fieldState.invalid}
                        className={invalidSelectClassName}
                      >
                        <TravelerNationalitySelect
                          instanceId={`kyc-traveler-${index}`}
                          value={nationalityField.value}
                          onChange={nationalityField.onChange}
                          label="Nationality"
                          required
                          disabled={nationalityLocked}
                          placeholder="Select nationality..."
                        />
                        {fieldState.error ? (
                          <p className="mt-1 text-sm text-red-500">
                            {fieldState.error.message}
                          </p>
                        ) : null}
                      </div>
                    )
                  }}
                />
                <ReuseableInput
                  className={inputClassName}
                  control={form.control}
                  name={`travelers.${index}.passport_number`}
                  label="Passport Number"
                  required
                />
                <ReuseableInput
                  className={inputClassName}
                  control={form.control}
                  name={`travelers.${index}.tax_number`}
                  label="Personal KRA Pin"
                  placeholder="e.g. A020828302W"
                  required
                />
              </div>

              {/* One row: address is half (6/12), each upload is a quarter (3/12). */}
              <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-5 lg:grid-cols-12 lg:gap-5">
                <div className="min-w-0 lg:col-span-6">
                  <ReuseableInput
                    className={inputClassName}
                    control={form.control}
                    type="textarea"
                    name={`travelers.${index}.physical_address`}
                    label="Physical Address"
                    required
                    rows={2}
                  />
                </div>
                <div className="min-w-0 lg:col-span-3">
                  <ReuseableInput
                    className={inputClassName}
                    control={form.control}
                    type="file"
                    name={`travelers.${index}.passport_attachment`}
                    accept=".pdf,.jpg,.jpeg,.png"
                    label="Attach Passport"
                    required
                  />
                </div>
                <div className="min-w-0 lg:col-span-3">
                  <ReuseableInput
                    className={inputClassName}
                    control={form.control}
                    type="file"
                    name={`travelers.${index}.tax_certificate`}
                    accept=".pdf,.jpg,.jpeg,.png"
                    label="Attach KRA PIN Certificate"
                    required
                  />
                </div>
              </div>

              <Separator className="my-4" />

              <div>
                <h3 className="mb-3 text-sm font-semibold sm:text-base">
                  Next of Kin
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                  <ReuseableInput
                    className={inputClassName}
                    control={form.control}
                    name={`travelers.${index}.next_of_kin_name`}
                    label="Next of Kin Name"
                    required
                  />
                  <ReuseableInput
                    className={inputClassName}
                    control={form.control}
                    type="tel"
                    name={`travelers.${index}.next_of_kin_phone`}
                    label="Next of Kin Phone"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CardFooter className="mt-4 flex w-full flex-col gap-3 px-0 sm:flex-row sm:justify-between">
        <Button
          type="button"
          className="w-full rounded-full border border-[#C20C0C] bg-transparent text-[#C20C0C] hover:bg-[#C20C0C]/10 sm:w-auto"
          leftIcon={<ArrowLeftCircle />}
          onClick={() => goToPrevStep?.()}
        >
          Previous
        </Button>
        <Button
          type="submit"
          className="w-full rounded-full bg-[#C20C0C]/90 hover:bg-[#C20C0C] sm:w-auto"
          rightIcon={<ArrowRightCircle />}
          loading={submitMutation.isPending}
          disabled={!purchaseSessionId}
        >
          Invoice Cover Quotation
        </Button>
      </CardFooter>
    </form>
  )
}
