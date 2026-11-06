import { useState } from 'react'
import { Download, FileText } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { ShowToast } from '@/utils/utils'
import type { SureComparisonPdfPayload } from './sure-message-sync'

type Props = {
  payload: SureComparisonPdfPayload
}

/**
 * Clear comparison PDF download card for Sure AI.
 * Posts the same document/motor/comparison endpoint Quote steppers use.
 */
export function SureComparisonDownload({ payload }: Props) {
  const [busy, setBusy] = useState(false)
  const sessionId = payload.session_id
  const products = payload.products ?? []

  if (!sessionId || products.length < 2) {
    return null
  }

  const insurers =
    Array.isArray(payload.insurers) && payload.insurers.length > 0
      ? payload.insurers.join(', ')
      : null
  const documentLabel =
    payload.label?.trim() ||
    (insurers
      ? `Motor cover comparison for ${insurers}`
      : payload.quote_code?.trim()
        ? `Motor cover comparison for ${payload.quote_code}`
        : 'Motor cover comparison')

  async function download() {
    if (busy) {
      return
    }
    setBusy(true)
    try {
      const response = await apiClient.post(
        `document/motor/comparison/${sessionId}`,
        {
          is_download: true,
          products,
        },
        { responseType: 'blob' }
      )
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const width = 1000
      const height = 900
      const left = window.screen.width / 2 - width / 2
      const top = window.screen.height / 2 - height / 2
      const popup = window.open(
        url,
        'PDF Preview',
        `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
      )
      if (!popup) {
        ShowToast.error('Popup blocked — allow popups to view the PDF.')
      }
    } catch {
      ShowToast.error('Failed to download comparison PDF.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-muted/40 px-3.5 py-2.5">
        <p className="text-sm font-medium text-foreground">
          Comparison PDF ready
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          The comparison is prepared as a PDF document. Click the red Download
          button to open it.
        </p>
      </div>

      {/* Simple two-column row: document label | red download action */}
      <div className="grid grid-cols-1 items-stretch sm:grid-cols-[1fr_auto]">
        <div className="flex items-start gap-2.5 px-3.5 py-3">
          <FileText className="mt-0.5 size-4 shrink-0 text-[#C20C0C]" />
          <div className="min-w-0">
            <p className="text-sm font-medium leading-snug text-foreground">
              {documentLabel}
              <span className="font-normal text-muted-foreground">
                {' '}
                — click to download
              </span>
            </p>
            {payload.filename ? (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {payload.filename}
              </p>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={() => void download()}
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 bg-[#C20C0C] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#a40a0a] disabled:opacity-60 sm:min-w-[9.5rem]"
        >
          <Download className="size-4 shrink-0" />
          {busy ? 'Preparing…' : 'Download'}
        </button>
      </div>
    </div>
  )
}
