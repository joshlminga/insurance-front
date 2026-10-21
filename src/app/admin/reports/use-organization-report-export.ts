import apiClient from '@/lib/api-client'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { useState } from 'react'

type ExportOptions = {
  url: string
  filename: string
  params?: Record<string, string | number | undefined | null>
  headers?: Record<string, string>
}

/**
 * Downloads an .xlsx report from the API (same filters as the list).
 * PHP knowledge: like streaming a file response from Laravel to the browser.
 */
export function useOrganizationReportExport() {
  const [isExporting, setIsExporting] = useState(false)

  const exportReport = async ({ url, filename, params, headers }: ExportOptions) => {
    setIsExporting(true)
    try {
      const response = await apiClient.get(url, {
        params,
        headers,
        responseType: 'blob',
      })

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const objectUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(objectUrl)
      ShowToast.success('Export downloaded')
    } catch (error) {
      ShowToast.error(extractErrorMessage(error) || 'Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  return { exportReport, isExporting }
}
