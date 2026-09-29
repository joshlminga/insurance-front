/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCan } from '@/auth/useCan'
import { MODULES } from '@/auth/module-keys'
import {
  BuildMotorCertificateColumns,
} from '@/app/admin/motor-certificates/columns'
import CancelCertificateModal from '@/app/admin/motor-certificates/modals/cancel-certificate'
import {
  DMVIC_CERT_URLS,
  isCertificateCancellable,
  type MotorCertificateRow,
} from '@/app/admin/motor-certificates/motor-certificates-query'
import { ActionColumn } from '@/dev/columns'
import { CustomDialogComponent } from '@/dev/core'
import { CustomBaseTable, SearchTools } from '@/dev/table'
import { useCustomDialogContextFactory, useDebounce } from '@/hooks'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import type {
  SingleActionsHandler,
  SubmitResponse,
  TFilterOptions,
  TPaginationFilters,
} from '@/types/types'
import { EMETHODS, FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { Ban, Download } from 'lucide-react'
import { useMemo, useReducer } from 'react'

type IssuedTabProps = {
  status: 'all' | 'issued'
  title: string
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
    `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
  )
  if (previewWindow) {
    previewWindow.focus()
  } else {
    ShowToast.error('Pop-up blocked! Please allow pop-ups to preview the document.')
  }
  ShowToast.success(`${label} preview opened`)
}

export function MotorCertificatesIssuedTab({ status, title }: IssuedTabProps) {
  const { canModuleAction } = useCan()
  const canDownload = canModuleAction(MODULES.DMVIC_CERTIFICATE, 'read')
  const canCancel = canModuleAction(MODULES.DMVIC_CERTIFICATE, 'action')

  const [filter, optionsDispatcher] = useReducer(
    ReusableReducer<TPaginationFilters & TFilterOptions>,
    { ...FILTEROPTIONS, page: 1, pageSize: 15 }
  )
  const optionsDispatcherDebounce = useDebounce({
    debounceCallback: optionsDispatcher,
  })

  // Dialog state (open/close + which component to render), same as the Failed tab
  const { handleDialogContextSwitch, dialogContent, dialogOpen } =
    useCustomDialogContextFactory<{
      row?: MotorCertificateRow
      refetch?: () => Promise<any>
    }>()

  const { data, isLoading, isError, refetch } = UseApiQuery<SubmitResponse>({
    url: DMVIC_CERT_URLS.list,
    params: {
      status,
      page: filter.page,
      pageSize: filter.pageSize,
      term: filter.term,
    },
  })

  const rows = (data?.data ?? []) as MotorCertificateRow[]

  const downloadMutation = UseApiMutation<Blob, { invoice_id: number }>({
    url: (vars) => DMVIC_CERT_URLS.download(vars.invoice_id),
    method: EMETHODS.GET,
    config: { responseType: 'blob' },
    mutationOptions: {
      onSuccess: (blob) => previewPdfBlob(blob, 'Certificate'),
      onError: (error: unknown) => {
        ShowToast.error(extractErrorMessage(error) || 'Download failed!')
      },
    },
  })

  const columns = useMemo(() => BuildMotorCertificateColumns(), [])

  const ActionsHandlerMapping: SingleActionsHandler<MotorCertificateRow>[] = [
    {
      label: 'Download',
      icon: Download,
      conditional: (row) =>
        canDownload && !!row.certificate_number && !!row.invoice_id,
      onSelect: (row) => {
        downloadMutation.mutate({ invoice_id: row.invoice_id })
      },
    },
    {
      label: 'Cancel Certificate',
      icon: Ban,
      // Shown only to users with 'action' permission and only for issued certificates
      conditional: (row) =>
        canCancel && !!row.invoice_id && isCertificateCancellable(row),
      onSelect: (row) => {
        handleDialogContextSwitch({
          Component: CancelCertificateModal,
          componentProps: { row, refetch: async () => { await refetch() } },
        })
      },
    },
  ]

  return (
    <div className="w-full space-y-4">
      <CustomBaseTable
        {...{
          onPageChange: (page) =>
            optionsDispatcher({
              payload: { page },
              type: 'page',
            }),
          OtherToolsProps: {
            onChange: (data: any) =>
              optionsDispatcherDebounce({
                payload: { term: data },
                type: 'term',
              }),
            placeholder: 'Search registration, certificate, invoice…',
            includeFilter: true,
          },
          columns: [
            ...columns,
            ...(canDownload || canCancel
              ? [ActionColumn({ ActionsHandlerMapping })]
              : []),
          ],
          OtherTools: SearchTools,
          data: rows,
          pageCount: data?.pagination?.last_page ?? filter.page,
          title,
          showPagination: true,
          setPageSize: (pageSize) =>
            optionsDispatcher({
              payload: { pageSize },
              type: 'pageSize',
            }),
          pageSize: data?.pagination?.per_page ?? filter?.pageSize,
          page: data?.pagination?.current_page ?? filter?.page,
          isLoading: isLoading,
          isError: isError,
        }}
      />

      <CustomDialogComponent
        {...{ handleDialogContextSwitch, dialogOpen }}
        className="sm:max-w-fit w-[95vw] sm:w-auto p-4 sm:p-6"
      >
        {dialogContent?.Component && (
          <dialogContent.Component
            {...{
              componentProps: dialogContent.componentProps,
              handleDialogContextSwitch,
            }}
          />
        )}
      </CustomDialogComponent>
    </div>
  )
}

export default MotorCertificatesIssuedTab
