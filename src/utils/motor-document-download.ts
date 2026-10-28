import { UseApiMutation } from '@/hooks/hooks'
import { EMETHODS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'

type DocumentHttpMethod = typeof EMETHODS.GET | typeof EMETHODS.POST

/** Opens a PDF blob in a centered popup window (same pattern as success-purchase). */
export const previewPdfBlob = (data: Blob, label: string) => {
    const blob = new Blob([data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const width = 1000
    const height = 900
    const left = window.screen.width / 2 - width / 2
    const top = window.screen.height / 2 - height / 2

    const previewWindow = window.open(
        url,
        'DocumentPreview',
        `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
    )
    if (previewWindow) {
        previewWindow.focus()
    } else {
        ShowToast.error('Pop-up blocked! Please allow pop-ups to preview the document.')
    }
    ShowToast.success(`${label} preview opened`)
}

export type DocumentDownloadUrl =
    | string
    | ((variables: string | Record<string, unknown> | void) => string)

type UseDocumentDownloadOptions = {
    url: DocumentDownloadUrl
    label: string
    method?: DocumentHttpMethod
}

/**
 * Shared PDF download/preview hook for motor (GET) and travel (GET/POST) documents.
 * Pass a string URL for fixed endpoints, or a function that builds the URL from mutate().
 */
export const useDocumentDownload = ({
    url,
    label,
    method = EMETHODS.GET,
}: UseDocumentDownloadOptions) =>
    UseApiMutation<Blob, string | Record<string, unknown> | void>({
        url: (variables) =>
            typeof url === 'function' ? url(variables) : url,
        method,
        config: { responseType: 'blob' },
        mutationOptions: {
            onSuccess: (data) => previewPdfBlob(data, label),
            onError: (error: unknown) => {
                const message = extractErrorMessage(error)
                ShowToast.error(message || 'Download failed!')
            },
        },
    })

/** GET helper used by existing motor/admin callers. */
export const useMotorDocumentDownload = (urlTemplate: (id: string) => string, label: string) =>
    useDocumentDownload({
        url: (variables) => urlTemplate(String(variables ?? '')),
        label,
        method: EMETHODS.GET,
    })

/** Build motor/travel document URLs from product + ids (used by Payment History). */
export function documentInvoiceUrl(product: string | null | undefined, invoiceId: string | number): string {
    const normalized = String(product ?? 'Motor').toLowerCase()
    if (normalized === 'travel') {
        return `document/travel/invoice/${invoiceId}`
    }
    return `document/motor/invoice/${invoiceId}`
}

export function documentReceiptUrl(
    product: string | null | undefined,
    opts: { invoiceId?: string | number | null; purchaseId?: string | number | null }
): { method: DocumentHttpMethod; url: string; body?: Record<string, unknown> } {
    const normalized = String(product ?? 'Motor').toLowerCase()
    if (normalized === 'travel') {
        const purchaseId = opts.purchaseId
        if (purchaseId == null || String(purchaseId).trim() === '') {
            throw new Error('Travel receipt requires purchase_id')
        }
        const body: Record<string, unknown> = {}
        if (opts.invoiceId != null && String(opts.invoiceId).trim() !== '') {
            body.target_invoice_id = Number(opts.invoiceId)
        }
        return {
            method: EMETHODS.POST,
            url: `document/travel/receipt/${purchaseId}`,
            body: Object.keys(body).length > 0 ? body : undefined,
        }
    }
    if (opts.invoiceId == null || String(opts.invoiceId).trim() === '') {
        throw new Error('Motor receipt requires invoice_id')
    }
    return {
        method: EMETHODS.GET,
        url: `document/motor/receipt/${opts.invoiceId}`,
    }
}
