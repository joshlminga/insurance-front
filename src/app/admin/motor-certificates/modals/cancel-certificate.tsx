/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  DMVIC_CERT_URLS,
  type CancelCertificatePayload,
  type CancelReasonOption,
  type MotorCertificateRow,
} from '@/app/admin/motor-certificates/motor-certificates-query'
import { Button } from '@/dev/core'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import { formatDate } from '@/lib/format'
import type { SubmitResponse } from '@/types/types'
import { EMETHODS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'

type CancelCertificateModalProps = {
  handleDialogContextSwitch: (context?: any) => void
  // Passed in by the parent tab via `handleDialogContextSwitch({ Component, componentProps })`
  componentProps?: {
    row?: MotorCertificateRow
    refetch?: () => Promise<any>
  }
}

export default function CancelCertificateModal({
  handleDialogContextSwitch,
  componentProps,
}: CancelCertificateModalProps) {
  const row = componentProps?.row

  // useState = local component variable. Changing it re-renders the modal
  // (like a reactive property). Select values are strings, so keep the ID as a string.
  const [reasonId, setReasonId] = useState<string>('')
  const [description, setDescription] = useState<string>('')

  // GET cancel-reasons once when the modal opens (cached by react-query).
  const { data: reasonsResponse, isLoading: isLoadingReasons } = UseApiQuery<
    CancelReasonOption[] | { data?: CancelReasonOption[] }
  >({
    url: DMVIC_CERT_URLS.cancelReasons,
  })

  // API may return a bare list or a { data: [...] } wrapper; support both.
  const reasons: CancelReasonOption[] = Array.isArray(reasonsResponse)
    ? reasonsResponse
    : (reasonsResponse?.data ?? [])

  // POST .../{invoice_id}/cancel. The URL is built from the variables at call time.
  const cancelMutation = UseApiMutation<
    SubmitResponse,
    CancelCertificatePayload & { invoice_id: number }
  >({
    url: (vars) => DMVIC_CERT_URLS.cancel(vars.invoice_id),
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: async (response) => {
        ShowToast.success(response.message || 'Certificate cancelled.')
        await componentProps?.refetch?.()
        handleDialogContextSwitch({}) // close the dialog
      },
      onError: (error: unknown) => {
        ShowToast.error(extractErrorMessage(error) || 'Cancellation failed.')
      },
    },
  })

  const handleSubmit = () => {
    if (!row || !reasonId) return
    const trimmed = description.trim()
    cancelMutation.mutate({
      invoice_id: row.invoice_id,
      cancel_reason_id: Number(reasonId),
      // Optional field: only send it when the user typed something
      ...(trimmed ? { description: trimmed } : {}),
    })
  }

  const coverage =
    row?.issued_date || row?.expiry_date
      ? `${row?.issued_date ? formatDate(row.issued_date) : '-'} → ${
          row?.expiry_date ? formatDate(row.expiry_date) : '-'
        }`
      : '-'

  return (
    <div className="space-y-4 min-w-[280px] max-w-lg">
      <div>
        <h3 className="text-lg font-semibold">Cancel Motor Certificate</h3>
        <p className="text-sm text-muted-foreground mt-1">
          This will cancel the certificate with DMVIC. It cannot be undone.
        </p>
      </div>

      <dl className="rounded border divide-y text-sm">
        <div className="px-3 py-2 flex justify-between gap-3">
          <dt className="text-muted-foreground">Vehicle registration</dt>
          <dd className="font-medium">{row?.registration_number ?? '-'}</dd>
        </div>
        <div className="px-3 py-2 flex justify-between gap-3">
          <dt className="text-muted-foreground">Certificate | Policy</dt>
          <dd className="font-medium">
            {row?.certificate_number ?? '-'} | {row?.policy_number ?? '-'}
          </dd>
        </div>
        <div className="px-3 py-2 flex justify-between gap-3">
          <dt className="text-muted-foreground">Coverage</dt>
          <dd className="font-medium">{coverage}</dd>
        </div>
      </dl>

      <div className="space-y-1.5">
        <Label htmlFor="cancel-reason-select">
          Cancel reason <span className="text-destructive">*</span>
        </Label>
        <Select
          value={reasonId}
          onValueChange={setReasonId}
          disabled={isLoadingReasons || cancelMutation.isPending}
        >
          <SelectTrigger
            id="cancel-reason-select"
            className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
          >
            <SelectValue
              placeholder={
                isLoadingReasons ? 'Loading reasons…' : 'Select a reason'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {reasons.map((reason) => (
              <SelectItem
                key={reason.CancelReasonID}
                value={String(reason.CancelReasonID)}
              >
                {reason.CancelReason}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cancel-description">Description (optional)</Label>
        <Textarea
          id="cancel-description"
          placeholder="Add more detail about this cancellation"
          value={description}
          maxLength={500}
          onChange={(e) => setDescription(e.target.value)}
          disabled={cancelMutation.isPending}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleDialogContextSwitch({})}
          disabled={cancelMutation.isPending}
        >
          Close
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={handleSubmit}
          disabled={cancelMutation.isPending || !reasonId || !row}
        >
          {cancelMutation.isPending ? 'Cancelling…' : 'Cancel certificate'}
        </Button>
      </div>
    </div>
  )
}
