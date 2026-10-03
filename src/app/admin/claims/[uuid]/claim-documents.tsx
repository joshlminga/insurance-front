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

const fileAccept = '.pdf,.jpg,.jpeg,.png,.heic,.doc,.docx'

/**
 * Upload a file onto a slot, ask for missing documents, or accept / reject what was uploaded.
 * Request marks the slot Requested and the API opens the document-request email.
 */
export function ClaimDocuments({
  claim,
  onChanged,
  onRequested,
}: {
  claim: ClaimDetail
  onChanged: () => void
  onRequested: () => void
}) {
  const [note, setNote] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [files, setFiles] = useState<Record<string, File | null>>({})

  const upload = UseApiMutation<SubmitResponse, FormData>({
    url: CLAIMS_API.documents(claim.uuid),
    method: EMETHODS.POST,
    config: { headers: { 'Content-Type': 'multipart/form-data' } },
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response.message || 'Document uploaded')
        onChanged()
      },
      onError: (error) => ShowToast.error(extractErrorMessage(error)),
    },
  })

  const requestDocs = UseApiMutation<SubmitResponse, { expected_document_ids: string[]; note?: string }>({
    url: CLAIMS_API.documentRequest(claim.uuid),
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response.message || 'Documents requested')
        setSelected([])
        setNote('')
        onChanged()
        onRequested()
      },
      onError: (error) => ShowToast.error(extractErrorMessage(error)),
    },
  })

  const review = UseApiMutation<SubmitResponse, { documentId: string; decision: 'accept' | 'reject'; note?: string }>({
    url: (variables) => CLAIMS_API.documentReview(claim.uuid, variables.documentId),
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response.message || 'Document reviewed')
        onChanged()
      },
      onError: (error) => ShowToast.error(extractErrorMessage(error)),
    },
  })

  return (
    <section className="flex flex-col gap-4 rounded-lg border bg-card p-4">
      <h2 className="text-lg font-semibold">Documents</h2>
      {claim.documents.length === 0 && (
        <p className="text-sm text-muted-foreground">No document slots on this claim yet.</p>
      )}
      {claim.documents.map((slot) => (
        <div key={slot.id} className="grid gap-2 rounded-lg border p-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{slot.label}</p>
            <span className="text-xs text-muted-foreground">{humanizeStatus(slot.state)}</span>
            {slot.mandatory && <span className="text-xs text-red-600">Required</span>}
          </div>
          {slot.requestNote && <p className="text-sm text-muted-foreground">{slot.requestNote}</p>}
          {slot.fileName && <p className="text-sm">{slot.fileName}</p>}
          {slot.downloadUrl && (
            <a className="text-sm text-primary underline" href={slot.downloadUrl} target="_blank" rel="noreferrer">
              Download
            </a>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              accept={fileAccept}
              className="text-sm"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null
                setFiles((current) => ({ ...current, [slot.id]: file }))
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!files[slot.id] || upload.isPending}
              onClick={() => {
                const file = files[slot.id]
                if (!file) return
                const formData = new FormData()
                formData.append('expected_document_id', slot.id)
                formData.append('file', file)
                upload.mutate(formData)
              }}
            >
              Upload
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={review.isPending}
              onClick={() => review.mutate({ documentId: slot.id, decision: 'accept' })}
            >
              Accept
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={review.isPending}
              onClick={() => review.mutate({ documentId: slot.id, decision: 'reject' })}
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
        </div>
      ))}

      <div className="grid gap-2">
        <Label htmlFor="request-note">Request note</Label>
        <Textarea
          id="request-note"
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="What should the customer send?"
        />
        <Button
          type="button"
          disabled={selected.length === 0 || requestDocs.isPending}
          onClick={() => requestDocs.mutate({
            expected_document_ids: selected,
            note: note.trim() || undefined,
          })}
        >
          {requestDocs.isPending ? 'Requesting…' : 'Request selected documents'}
        </Button>
      </div>
    </section>
  )
}
