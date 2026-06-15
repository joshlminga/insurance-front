import { UseApiMutation } from '@/hooks/hooks'
import { EMETHODS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'

/** Opens a PDF blob in a centered popup window (same pattern as success-purchase). */
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
        `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
    )
    if (previewWindow) {
        previewWindow.focus()
    } else {
        ShowToast.error('Pop-up blocked! Please allow pop-ups to preview the document.')
    }
    ShowToast.success(`${label} preview opened`)
}

export const useMotorDocumentDownload = (urlTemplate: (id: string) => string, label: string) =>
    UseApiMutation<Blob, string>({
        url: urlTemplate,
        method: EMETHODS.GET,
        config: { responseType: 'blob' },
        mutationOptions: {
            onSuccess: (data) => previewPdfBlob(data, label),
            onError: (error: unknown) => {
                const message = extractErrorMessage(error)
                ShowToast.error(message || 'Download failed!')
            },
        },
    })
