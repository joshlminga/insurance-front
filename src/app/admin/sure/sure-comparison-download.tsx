import { useState } from 'react'
import { Download } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { ShowToast } from '@/utils/utils'
import type { SureComparisonPdfPayload } from './sure-message-sync'

type Props = {
  payload: SureComparisonPdfPayload
}

/**
 * Download chip for Sure AI comparison PDF meta.
 * Posts the same document/motor/comparison endpoint Quote steppers use.
 */
export function SureComparisonDownload({ payload }: Props) {
  const [busy, setBusy] = useState(false)
  const sessionId = payload.session_id
  const products = payload.products ?? []

  if (!sessionId || products.length < 2) {
    return null
  }

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
    <button
      type="button"
      onClick={() => void download()}
      disabled={busy}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-300 dark:bg-white dark:text-zinc-900"
    >
      <Download className="size-3.5" />
      {busy ? 'Preparing PDF…' : 'Download comparison'}
    </button>
  )
}
