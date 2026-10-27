/**
 * Shows DMVIC ValidateInsurance details after a successful Verify click.
 * Print uses window.print() and only includes the details block (hides chrome).
 */
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { ValidateInsuranceResult } from '@/utils/dmvic-validate-insurance'
import { Printer } from 'lucide-react'
import { formatValidateCertificateDate } from './format-double-result-date'

type ValidateCertificateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Mapped API data — null while closed / before first success. */
  result: ValidateInsuranceResult | null
}

function showValue(value: string): string {
  return value.trim() === '' ? '-' : value
}

/** One labelled value in the 2-column grid. */
function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{showValue(value)}</p>
    </div>
  )
}

export function ValidateCertificateDialog({
  open,
  onOpenChange,
  result,
}: ValidateCertificateDialogProps) {
  const onPrint = () => {
    // Browser print dialog; CSS below hides dialog chrome so only details print.
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg print:static print:translate-none print:max-w-none print:border-0 print:shadow-none print:p-0">
        {/* Hide overlay / close / footer buttons when printing */}
        <style>{`
          @media print {
            body * { visibility: hidden !important; }
            .validate-certificate-print-root,
            .validate-certificate-print-root * { visibility: visible !important; }
            .validate-certificate-print-root {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              padding: 24px !important;
            }
            .validate-certificate-no-print { display: none !important; }
          }
        `}</style>

        <DialogHeader className="validate-certificate-no-print">
          <DialogTitle>Certificate validation</DialogTitle>
        </DialogHeader>

        {result ? (
          <div className="validate-certificate-print-root space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailCell
                label="Vehicle Registration"
                value={result.registrationNumber}
              />
              <DetailCell label="Chassis Number" value={result.chassisNumber} />
              <DetailCell
                label="Certificate Number"
                value={result.certificateNumber}
              />
              <DetailCell
                label="Insurance Policy Number"
                value={result.insurancePolicyNumber}
              />
              <DetailCell
                label="Valid From"
                value={formatValidateCertificateDate(result.validFrom)}
              />
              <DetailCell
                label="Valid Till"
                value={formatValidateCertificateDate(result.validTill)}
              />
            </div>

            {/* Row 4: Insured By + always-green "valid" on success */}
            <div className="flex flex-wrap items-center gap-2 border-t pt-4">
              <p className="text-sm text-foreground">
                <span className="text-muted-foreground">Insured By:</span>{' '}
                <span className="font-semibold">{showValue(result.insuredBy)}</span>
              </p>
              <Badge className="rounded-md border-0 bg-green-100 font-semibold text-green-800 hover:bg-green-100">
                valid
              </Badge>
            </div>
          </div>
        ) : null}

        <DialogFooter className="validate-certificate-no-print">
          <Button
            type="button"
            variant="outline"
            className="border border-[#C20C0C] bg-transparent text-[#C20C0C] hover:bg-[#C20C0C]/10"
            disabled={!result}
            onClick={onPrint}
          >
            <Printer className="size-4" />
            Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
