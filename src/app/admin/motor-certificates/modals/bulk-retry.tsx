/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/dev/core'
import {
  DMVIC_CERT_URLS,
  type BulkIssuingResponse,
  type FailedMotorCertificateRow,
} from '@/app/admin/motor-certificates/motor-certificates-query'
import { UseApiMutation } from '@/hooks/hooks'
import { EMETHODS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'

type BulkRetryModalProps = {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: {
    selectedRows?: FailedMotorCertificateRow[]
    refetch?: () => Promise<any>
  }
}

export default function BulkRetryModal({
  handleDialogContextSwitch,
  componentProps,
}: BulkRetryModalProps) {
  const selectedRows = componentProps?.selectedRows ?? []
  const invoiceIds = selectedRows.map((row) => row.invoice_id)

  const bulkMutation = UseApiMutation<
    BulkIssuingResponse,
    { invoice_ids: number[] }
  >({
    url: DMVIC_CERT_URLS.bulk,
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: async (response) => {
        const issued = response.data?.issued?.length ?? 0
        const skipped = response.data?.skipped?.length ?? 0
        const failed = response.data?.failed ?? []

        if (issued > 0) {
          ShowToast.success(
            `Issued ${issued} certificate(s)${skipped ? `, skipped ${skipped}` : ''}.`
          )
        } else {
          ShowToast.info('No certificates were issued.')
        }

        if (failed.length > 0) {
          const first = failed[0]
          ShowToast.error(
            `${failed.length} failed. First: invoice #${first.invoice_id} — ${first.reason}`
          )
        }

        await componentProps?.refetch?.()
        handleDialogContextSwitch()
      },
      onError: (error: unknown) => {
        ShowToast.error(extractErrorMessage(error) || 'Bulk retry failed.')
      },
    },
  })

  return (
    <div className="space-y-4 min-w-[280px] max-w-lg">
      <div>
        <h3 className="text-lg font-semibold">Retry selected certificates</h3>
        <p className="text-sm text-muted-foreground mt-1">
          DMVIC will be called for {invoiceIds.length} paid invoice(s) that do
          not yet have a certificate.
        </p>
      </div>

      <ul className="max-h-48 overflow-y-auto rounded border divide-y text-sm">
        {selectedRows.map((row) => (
          <li key={row.invoice_id} className="px-3 py-2 flex justify-between gap-3">
            <span className="font-medium">
              {row.invoice_number ?? `#${row.invoice_id}`}
            </span>
            <span className="text-muted-foreground">
              {row.registration_number ?? '—'}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleDialogContextSwitch()}
          disabled={bulkMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={() => bulkMutation.mutate({ invoice_ids: invoiceIds })}
          disabled={bulkMutation.isPending || invoiceIds.length === 0}
        >
          {bulkMutation.isPending ? 'Retrying…' : 'Retry selected'}
        </Button>
      </div>
    </div>
  )
}
