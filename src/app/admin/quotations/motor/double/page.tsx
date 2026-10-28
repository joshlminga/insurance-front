import {
  DMVIC_CERT_URLS,
  type MotorCertificateLocalMatch,
} from '@/app/admin/motor-certificates/motor-certificates-query'
import { PageHeader } from '@/components/shared'
import { Button } from '@/dev/core'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useActionWaitHold } from '@/hooks/use-action-wait-hold'
import apiClient from '@/lib/api-client'
import { cn } from '@/lib/utils'
import {
  lookupDoubleInsurance,
  type DoubleInsuranceLookupResult,
} from '@/utils/dmvic-double-insurance'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { useState, type FormEvent } from 'react'
import { motorInputClassName } from '../motor-field-styles'
import {
  DoubleInsuranceCoversTable,
  type LocalCertificateMatch,
} from './double-insurance-covers-table'
import { formatDoubleResultDate } from './format-double-result-date'

function showValue(value: string): string {
  return value.trim() === '' ? '-' : value
}

/** Ask our API which DMVIC cert numbers we issued locally (invoice + policy). */
async function resolveLocalCertificateMatches(
  certificateNumbers: string[],
): Promise<Record<string, LocalCertificateMatch>> {
  const unique = [...new Set(certificateNumbers.map((n) => n.trim()).filter(Boolean))]
  if (unique.length === 0) {
    return {}
  }

  const response = await apiClient.post<{
    success?: boolean
    data?: MotorCertificateLocalMatch[]
  }>(DMVIC_CERT_URLS.resolveByNumbers, {
    certificate_numbers: unique,
  })

  const map: Record<string, LocalCertificateMatch> = {}
  for (const row of response.data?.data ?? []) {
    const number = String(row.certificate_number ?? '').trim()
    if (number === '' || !row.invoice_id) {
      continue
    }
    map[number] = {
      invoiceId: Number(row.invoice_id),
      policyNumber: String(row.policy_number ?? '').trim(),
    }
  }
  return map
}

export const AdminMotorQuotationDoublePage = () => {
  const [registration, setRegistration] = useState('')
  const [chassis, setChassis] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [result, setResult] = useState<DoubleInsuranceLookupResult | null>(null)
  const [localMatches, setLocalMatches] = useState<
    Record<string, LocalCertificateMatch>
  >({})

  // GET calls do not auto-arm the shared overlay — hold it while DMVIC is checking.
  useActionWaitHold('admin-motor-double-insurance-lookup', isLookingUp, {
    detail: 'Checking DMVIC for overlapping cover.',
  })

  // Submit: dates required; registration or chassis (at least one).
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const vehicleRegistrationNumber = registration.trim()
    const chassisNumber = chassis.trim()
    const coverStartDate = startDate.trim()
    const coverEndDate = endDate.trim()

    if (coverStartDate === '' || coverEndDate === '') {
      ShowToast.error('Start date and end date are required.')
      return
    }

    if (vehicleRegistrationNumber === '' && chassisNumber === '') {
      ShowToast.error('Enter a vehicle registration or chassis number.')
      return
    }

    // HTML dates are YYYY-MM-DD, so text order matches calendar order.
    if (coverEndDate < coverStartDate) {
      ShowToast.error('End date must be on or after the start date.')
      return
    }

    setIsLookingUp(true)
    try {
      const next = await lookupDoubleInsurance({
        vehicleRegistrationNumber,
        chassisNumber,
        coverStartDate,
        coverEndDate,
      })
      // Summary shows both ids from covers; form stays one-or-the-other so inputs stay mutually exclusive.
      setResult(next)

      // Counter-check which covers we issued locally (Policy Number + download).
      if (next.covers.length > 0) {
        try {
          const matches = await resolveLocalCertificateMatches(
            next.covers.map((c) => c.certificateNumber),
          )
          setLocalMatches(matches)
        } catch {
          // Still show DMVIC rows; Policy Number stays "-" and download stays grey.
          setLocalMatches({})
          ShowToast.error('Could not check local certificates for download.')
        }
      } else {
        setLocalMatches({})
      }
    } catch (error) {
      setResult(null)
      setLocalMatches({})
      ShowToast.error(extractErrorMessage(error) || 'Double insurance lookup failed.')
    } finally {
      setIsLookingUp(false)
    }
  }

  // Fill only one vehicle id — the other input stays disabled until this one is cleared.
  const registrationFilled = registration.trim() !== ''
  const chassisFilled = chassis.trim() !== ''
  const registrationDisabled = chassisFilled
  const chassisDisabled = registrationFilled

  return (
    <div className="space-y-6 text-sm pb-[max(5vh,4.5rem)] mb-[5vh]">
      <div className="[&_h1]:text-lg [&_h1]:leading-7 [&_p]:text-sm [&_p]:leading-5">
        <PageHeader
          title="Double insurance"
          description="Check whether a vehicle already has cover between two dates."
        />
      </div>

      <form
        onSubmit={onSubmit}
        noValidate
        className="space-y-4 rounded-2xl border border-[#ADABAB]/50 p-4 shadow-sm sm:p-6"
      >
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {/* One mini-card: enter registration OR chassis (never both). */}
          <div className="min-w-0 space-y-2 rounded-xl border-2 border-[#C20C0C] bg-[#FFF8F8]/60 p-3 sm:p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="min-w-0 space-y-1.5">
                <Label
                  htmlFor="vehicle_registration"
                  className="font-semibold text-black"
                >
                  Vehicle registration
                </Label>
                <Input
                  id="vehicle_registration"
                  className={cn(
                    motorInputClassName,
                    registrationDisabled && 'cursor-not-allowed opacity-60',
                  )}
                  value={registration}
                  onChange={(event) => setRegistration(event.target.value)}
                  autoComplete="off"
                  disabled={registrationDisabled}
                />
              </div>
              <div className="min-w-0 space-y-1.5">
                <Label
                  htmlFor="chassis_number"
                  className="font-semibold text-black"
                >
                  Chassis number
                </Label>
                <Input
                  id="chassis_number"
                  className={cn(
                    motorInputClassName,
                    chassisDisabled && 'cursor-not-allowed opacity-60',
                  )}
                  value={chassis}
                  onChange={(event) => setChassis(event.target.value)}
                  autoComplete="off"
                  disabled={chassisDisabled}
                />
              </div>
            </div>
            <p className="text-xs text-[#C20C0C]/90">
              Fill one field only. The other locks until you clear it.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="min-w-0 space-y-1.5">
              <Label htmlFor="cover_start_date">
                Start date <span className="text-[#C20C0C]">*</span>
              </Label>
              <Input
                id="cover_start_date"
                className={motorInputClassName}
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                required
              />
            </div>
            <div className="min-w-0 space-y-1.5">
              <Label htmlFor="cover_end_date">
                End date <span className="text-[#C20C0C]">*</span>
              </Label>
              <Input
                id="cover_end_date"
                className={motorInputClassName}
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) => setEndDate(event.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            loading={isLookingUp}
            className="rounded-full bg-[#C20C0C]/90 hover:bg-[#C20C0C]"
          >
            Check cover
          </Button>
        </div>
      </form>

      {/* Outer card stays. Inner card = search summary. Covers table is a separate file (easy to remove). */}
      {result ? (
        <div className="space-y-4 rounded-2xl border border-[#ADABAB]/50 p-4 shadow-sm sm:p-6">
          <div className="rounded-xl border border-[#ADABAB]/40 bg-muted/20 p-4">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="min-w-0 space-y-1">
                <p className="text-xs text-muted-foreground">Vehicle registration</p>
                <p className="font-medium break-all">{showValue(result.registration)}</p>
              </div>
              <div className="min-w-0 space-y-1">
                <p className="text-xs text-muted-foreground">Chassis number</p>
                <p className="font-medium break-all">{showValue(result.chassis)}</p>
              </div>
              <div className="min-w-0 space-y-1">
                <p className="text-xs text-muted-foreground">Start date</p>
                <p className="font-medium">{formatDoubleResultDate(result.startDate)}</p>
              </div>
              <div className="min-w-0 space-y-1">
                <p className="text-xs text-muted-foreground">End date</p>
                <p className="font-medium">{formatDoubleResultDate(result.endDate)}</p>
              </div>
            </div>
          </div>

          {result.covers.length > 0 ? (
            <DoubleInsuranceCoversTable
              covers={result.covers}
              localMatches={localMatches}
            />
          ) : result.clear ? (
            <p className="text-sm text-muted-foreground">
              No overlapping cover was found for these dates.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
