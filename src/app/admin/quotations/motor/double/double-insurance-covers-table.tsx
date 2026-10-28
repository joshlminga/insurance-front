/**
 * Client-side searchable / sortable table of DMVIC overlapping covers.
 *
 * Removable: if this is buggy or slow, delete this file and replace the
 * <DoubleInsuranceCoversTable /> usage on page.tsx with a plain list (or nothing).
 * The lookup helper and form do not depend on this component.
 */
import { DMVIC_CERT_URLS } from '@/app/admin/motor-certificates/motor-certificates-query'
import { ValidateCertificateDialog } from '@/app/admin/quotations/motor/double/validate-certificate-dialog'
import { DataTable, type Column } from '@/components/shared/data-table'
import { Button } from '@/components/ui/button'
import { useActionWaitHold } from '@/hooks/use-action-wait-hold'
import { UseApiMutation } from '@/hooks/hooks'
import type { DoubleInsuranceCover } from '@/utils/dmvic-double-insurance'
import {
  validateInsuranceCertificate,
  type ValidateInsuranceResult,
} from '@/utils/dmvic-validate-insurance'
import { EMETHODS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { useMemo, useState } from 'react'
import { formatDoubleResultDate } from './format-double-result-date'

function showValue(value: string): string {
  return value.trim() === '' ? '-' : value
}

/** Local match from resolve-by-numbers, keyed by DMVIC certificate number. */
export type LocalCertificateMatch = {
  invoiceId: number
  policyNumber: string
}

type CoverRow = DoubleInsuranceCover & {
  policyNumber: string
  invoiceId: number | null
}

type DoubleInsuranceCoversTableProps = {
  covers: DoubleInsuranceCover[]
  /** certificateNumber → local invoice + policy when we issued the cert */
  localMatches: Record<string, LocalCertificateMatch>
}

const previewPdfBlob = (data: Blob, label: string) => {
  const blob = new Blob([data], { type: 'application/pdf' })
  const url = window.URL.createObjectURL(blob)
  const width = 1000
  const height = 900
  const left = window.screen.width / 2 - width / 2
  const top = window.screen.height / 2 - height / 2

  const previewWindow = window.open(
    url,
    'DocumentPreview',
    `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`,
  )
  if (previewWindow) {
    previewWindow.focus()
  } else {
    ShowToast.error('Pop-up blocked! Please allow pop-ups to preview the document.')
  }
  ShowToast.success(`${label} preview opened`)
}

export function DoubleInsuranceCoversTable({
  covers,
  localMatches,
}: DoubleInsuranceCoversTableProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [verifyResult, setVerifyResult] = useState<ValidateInsuranceResult | null>(
    null,
  )

  // GET download does not auto-arm Please wait — hold while the PDF streams.
  useActionWaitHold('admin-motor-double-certificate-download', isDownloading, {
    detail: 'Downloading certificate.',
  })

  // Verify is also a GET — hold Please wait while DMVIC validates.
  useActionWaitHold('admin-motor-double-certificate-verify', isVerifying, {
    detail: 'Verifying certificate with DMVIC.',
  })

  const downloadMutation = UseApiMutation<Blob, { invoice_id: number }>({
    url: (vars) => DMVIC_CERT_URLS.download(vars.invoice_id),
    method: EMETHODS.GET,
    config: { responseType: 'blob' },
    mutationOptions: {
      onMutate: () => {
        setIsDownloading(true)
      },
      onSuccess: (blob) => previewPdfBlob(blob, 'Certificate'),
      onError: (error: unknown) => {
        ShowToast.error(extractErrorMessage(error) || 'Download failed!')
      },
      onSettled: () => {
        setIsDownloading(false)
      },
    },
  })

  const rows: CoverRow[] = useMemo(
    () =>
      covers.map((cover) => {
        const match = localMatches[cover.certificateNumber]
        return {
          ...cover,
          policyNumber: match?.policyNumber?.trim() ? match.policyNumber : '',
          invoiceId: match?.invoiceId ?? null,
        }
      }),
    [covers, localMatches],
  )

  /**
   * Verify uses the double-insurance row to call ValidateInsurance
   * (cert + registration required; chassis optional). Not gated on local invoice.
   */
  const onVerify = async (row: CoverRow) => {
    const certificateNumber = row.certificateNumber.trim()
    const vehicleRegistrationNumber = row.vehicleRegistrationNumber.trim()
    if (certificateNumber === '' || vehicleRegistrationNumber === '') {
      return
    }

    setIsVerifying(true)
    try {
      const result = await validateInsuranceCertificate({
        certificateNumber,
        vehicleRegistrationNumber,
        chassisNumber: row.chassisNumber,
      })
      setVerifyResult(result)
      setVerifyOpen(true)
    } catch (error: unknown) {
      ShowToast.error(
        extractErrorMessage(error) || 'Certificate verification failed.',
      )
    } finally {
      setIsVerifying(false)
    }
  }

  const columns: Column<CoverRow>[] = useMemo(
    () => [
      {
        key: 'certificateNumber',
        label: 'Certificate no',
        sortable: true,
        render: (value) => showValue(String(value ?? '')),
      },
      {
        key: 'policyNumber',
        label: 'Policy Number',
        sortable: true,
        // Not in local DB → show "-" only
        render: (value) => showValue(String(value ?? '')),
      },
      {
        key: 'coverExpiryDate',
        label: 'Expiry date',
        sortable: true,
        render: (value) => formatDoubleResultDate(String(value ?? '')),
      },
      {
        key: 'insuranceName',
        label: 'Insurer',
        sortable: true,
        render: (value) => showValue(String(value ?? '')),
      },
      {
        key: 'chassisNumber',
        label: 'Chassis number',
        sortable: true,
        render: (value) => showValue(String(value ?? '')),
      },
      {
        // Column header "Certificate" — download + Verify (DMVIC check)
        key: 'invoiceId',
        label: 'Certificate',
        render: (_value, row) => {
          // Download needs a local invoice; Verify only needs row cert + plate.
          const canDownload = row.invoiceId != null && row.invoiceId > 0
          const canVerify =
            row.certificateNumber.trim() !== '' &&
            row.vehicleRegistrationNumber.trim() !== ''

          return (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                disabled={!canDownload || isDownloading || isVerifying}
                className={
                  canDownload
                    ? 'bg-black text-white hover:bg-black/90 hover:text-white'
                    : 'bg-muted text-muted-foreground opacity-60'
                }
                onClick={() => {
                  if (!canDownload || row.invoiceId == null) {
                    return
                  }
                  downloadMutation.mutate({ invoice_id: row.invoiceId })
                }}
              >
                click to download
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!canVerify || isVerifying || isDownloading}
                className={
                  canVerify
                    ? 'bg-[#C20C0C] text-white hover:bg-[#C20C0C]/90 hover:text-white'
                    : 'bg-muted text-muted-foreground opacity-60'
                }
                onClick={() => {
                  void onVerify(row)
                }}
              >
                Verify
              </Button>
            </div>
          )
        },
      },
    ],
    [downloadMutation, isDownloading, isVerifying],
  )

  return (
    <>
      <DataTable
        data={rows}
        columns={columns}
        searchable
        searchPlaceholder="Search certificates…"
        searchKeys={[
          'certificateNumber',
          'policyNumber',
          'coverExpiryDate',
          'insuranceName',
          'chassisNumber',
        ]}
        pageSize={10}
        emptyMessage="No matching covers."
      />

      <ValidateCertificateDialog
        open={verifyOpen}
        onOpenChange={(open) => {
          setVerifyOpen(open)
          if (!open) {
            setVerifyResult(null)
          }
        }}
        result={verifyResult}
      />
    </>
  )
}
