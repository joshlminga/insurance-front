import { PageHeader } from '@/components/shared'
import { Button } from '@/dev/core'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useActionWaitHold } from '@/hooks/use-action-wait-hold'
import {
  lookupDoubleInsurance,
  type DoubleInsuranceLookupResult,
} from '@/utils/dmvic-double-insurance'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { useState, type FormEvent } from 'react'
import { motorInputClassName } from '../motor-field-styles'
import { DoubleInsuranceCoversTable } from './double-insurance-covers-table'
import { formatDoubleResultDate } from './format-double-result-date'

function showValue(value: string): string {
  return value.trim() === '' ? '-' : value
}

export const AdminMotorQuotationDoublePage = () => {
  const [registration, setRegistration] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [result, setResult] = useState<DoubleInsuranceLookupResult | null>(null)

  // GET calls do not auto-arm the shared overlay — hold it while DMVIC is checking.
  useActionWaitHold('admin-motor-double-insurance-lookup', isLookingUp, {
    detail: 'Checking DMVIC for overlapping cover.',
  })

  // Submit checks the three fields, then calls the same DMVIC overlap check Motor Payment uses.
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const vehicleRegistrationNumber = registration.trim()
    const coverStartDate = startDate.trim()
    const coverEndDate = endDate.trim()

    if (vehicleRegistrationNumber === '' || coverStartDate === '' || coverEndDate === '') {
      ShowToast.error('Vehicle registration, start date, and end date are required.')
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
        coverStartDate,
        coverEndDate,
      })
      setResult(next)
    } catch (error) {
      setResult(null)
      ShowToast.error(extractErrorMessage(error) || 'Double insurance lookup failed.')
    } finally {
      setIsLookingUp(false)
    }
  }

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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="vehicle_registration">
              Vehicle registration <span className="text-[#C20C0C]">*</span>
            </Label>
            <Input
              id="vehicle_registration"
              className={motorInputClassName}
              value={registration}
              onChange={(event) => setRegistration(event.target.value)}
              autoComplete="off"
              required
            />
          </div>
          <div className="space-y-1.5">
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
          <div className="space-y-1.5">
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
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Vehicle registration</p>
                <p className="font-medium">{showValue(result.registration)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Start date</p>
                <p className="font-medium">{formatDoubleResultDate(result.startDate)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">End date</p>
                <p className="font-medium">{formatDoubleResultDate(result.endDate)}</p>
              </div>
            </div>
          </div>

          {result.covers.length > 0 ? (
            <DoubleInsuranceCoversTable covers={result.covers} />
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
