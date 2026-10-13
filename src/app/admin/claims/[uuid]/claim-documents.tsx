import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/dev/core'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { UseApiMutation } from '@/hooks/hooks'
import type { SubmitResponse } from '@/types/types'
import { CLAIMS_API, humanizeStatus, type ClaimDetail } from '@/utils/claims'
import { EMETHODS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { useState } from 'react'
import { ClaimGrid, ClaimSurface } from '../claim-ui'

const fileAccept = '.pdf,.jpg,.jpeg,.png,.heic,.doc,.docx'

type ReviewPayload = {
  documentId: string
  decision: 'accepted' | 'rejected'
  note?: string
}

/**
 * Document slots as cards. Request / reject notes open in small dialogs
 * so the main page does not grow a long form.
 */
export function ClaimDocuments({
  claim,
  orgContextHeaders,
  onChanged,
  onRequested,
}: {
  claim: ClaimDetail
  orgContextHeaders?: Record<string, string>
  onChanged: () => void
  onRequested: () => void
}) {
  const [note, setNote] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [files, setFiles] = useState<Record<string, File | null>>({})
  const [requestOpen, setRequestOpen] = useState(false)
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState('')

  const upload = UseApiMutation<SubmitResponse, FormData>({
    url: (formData) => {
      const documentId = String(formData.get('_expected_document_id') ?? '')
      formData.delete('_expected_document_id')
      return CLAIMS_API.documentUpload(claim.uuid, documentId)
    },
    method: EMETHODS.POST,
    config: {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(orgContextHeaders ?? {}),
      },
    },
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response.message || 'Document uploaded')
        onChanged()
      },
      onError: (error) => ShowToast.error(extractErrorMessage(error)),
    },
  })

  const requestDocs = UseApiMutation<SubmitResponse, {
    items: Array<{ expected_document_id: number; note?: string }>
  }>({
    url: CLAIMS_API.documentRequest(claim.uuid),
    method: EMETHODS.POST,
    config: orgContextHeaders ? { headers: orgContextHeaders } : undefined,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response.message || 'Documents requested')
        setSelected([])
        setNote('')
        setRequestOpen(false)
        onChanged()
        onRequested()
      },
      onError: (error) => ShowToast.error(extractErrorMessage(error)),
    },
  })

  const review = UseApiMutation<SubmitResponse, ReviewPayload>({
    url: (variables) => CLAIMS_API.documentReview(claim.uuid, variables.documentId),
    method: EMETHODS.POST,
    config: orgContextHeaders ? { headers: orgContextHeaders } : undefined,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response.message || 'Document reviewed')
        setRejectTarget(null)
        setRejectNote('')
        onChanged()
      },
      onError: (error) => ShowToast.error(extractErrorMessage(error)),
    },
  })

  return (
    <ClaimSurface className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold">Documents</h2>
        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          disabled={selected.length === 0}
          onClick={() => setRequestOpen(true)}
        >
          Request selected ({selected.length})
        </Button>
      </div>

      {claim.documents.length === 0 && (
        <p className="text-sm text-muted-foreground">No document slots on this claim yet.</p>
      )}

      <ClaimGrid>
        {claim.documents.map((slot) => (
          <ClaimSurface key={slot.id} padding="sm" className="flex break-inside-avoid flex-col gap-3 bg-background/60">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">{slot.label}</p>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {humanizeStatus(slot.state)}
              </span>
              {slot.mandatory && <span className="text-xs font-semibold text-red-600">Required</span>}
            </div>
            {slot.requestNote && <p className="text-sm text-muted-foreground">{slot.requestNote}</p>}
            {slot.fileName && <p className="text-sm">{slot.fileName}</p>}
            {slot.downloadUrl && (
              <a className="text-sm text-primary underline" href={slot.downloadUrl} target="_blank" rel="noreferrer">
                Download
              </a>
            )}
            <input
              type="file"
              accept={fileAccept}
              className="text-sm"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null
                setFiles((current) => ({ ...current, [slot.id]: file }))
              }}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-lg"
                disabled={!files[slot.id] || upload.isPending}
                onClick={() => {
                  const file = files[slot.id]
                  if (!file) return
                  const formData = new FormData()
                  formData.append('_expected_document_id', slot.id)
                  formData.append('files[]', file)
                  upload.mutate(formData)
                }}
              >
                Upload
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-lg"
                disabled={review.isPending}
                onClick={() => review.mutate({ documentId: slot.id, decision: 'accepted' })}
              >
                Accept
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-lg"
                disabled={review.isPending}
                onClick={() => {
                  setRejectTarget(slot.id)
                  setRejectNote('')
                }}
              >
                Reject
              </Button>
              <Label className="flex items-center gap-2 font-normal">
                <Checkbox
                  checked={selected.includes(slot.id)}
                  onCheckedChange={(checked) => {
                    setSelected((current) => (
                      checked ? [...current, slot.id] : current.filter((id) => id !== slot.id)
                    ))
                  }}
                />
                Request
              </Label>
            </div>
          </ClaimSurface>
        ))}
      </ClaimGrid>

      {/* Request note dialog — only when clerk picked slots */}
      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request documents</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <Label htmlFor="request-note">Request note</Label>
            <Textarea
              id="request-note"
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="What should the customer send?"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setRequestOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                disabled={selected.length === 0 || requestDocs.isPending}
                onClick={() => requestDocs.mutate({
                  items: selected.map((id) => ({
                    expected_document_id: Number(id),
                    note: note.trim() || undefined,
                  })),
                })}
              >
                {requestDocs.isPending ? 'Requesting…' : 'Send request'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Optional reject note */}
      <Dialog open={rejectTarget != null} onOpenChange={(open) => { if (!open) setRejectTarget(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject document</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <Label htmlFor="reject-note">Note (optional)</Label>
            <Textarea
              id="reject-note"
              rows={3}
              value={rejectNote}
              onChange={(event) => setRejectNote(event.target.value)}
              placeholder="Why is this file rejected?"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setRejectTarget(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!rejectTarget || review.isPending}
                onClick={() => {
                  if (!rejectTarget) return
                  review.mutate({
                    documentId: rejectTarget,
                    decision: 'rejected',
                    note: rejectNote.trim() || undefined,
                  })
                }}
              >
                {review.isPending ? 'Saving…' : 'Reject'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ClaimSurface>
  )
}
