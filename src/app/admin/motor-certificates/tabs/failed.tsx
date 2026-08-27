/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCan } from '@/auth/useCan'
import { MODULES } from '@/auth/module-keys'
import { BuildFailedMotorCertificateColumns } from '@/app/admin/motor-certificates/columns'
import BulkRetryModal from '@/app/admin/motor-certificates/modals/bulk-retry'
import {
  DMVIC_CERT_URLS,
  type FailedMotorCertificateRow,
} from '@/app/admin/motor-certificates/motor-certificates-query'
import { ActionColumn } from '@/dev/columns'
import { Button, CustomDialogComponent } from '@/dev/core'
import { CustomBaseTable, SearchTools } from '@/dev/table'
import {
  useCustomDialogContextFactory,
  useDebounce,
} from '@/hooks'
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
import { RefreshCw } from 'lucide-react'
import { useCallback, useMemo, useReducer, useState } from 'react'

export default function MotorCertificatesFailedTab() {
  const { canModuleAction } = useCan()
  const canRetry = canModuleAction(MODULES.DMVIC_CERTIFICATE, 'action')
  const canBulk = canModuleAction(MODULES.DMVIC_CERTIFICATE, 'bulk')

  const [filter, optionsDispatcher] = useReducer(
    ReusableReducer<TPaginationFilters & TFilterOptions>,
    { ...FILTEROPTIONS, page: 1, pageSize: 15 }
  )
  const optionsDispatcherDebounce = useDebounce({
    debounceCallback: optionsDispatcher,
  })

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  const { handleDialogContextSwitch, dialogContent, dialogOpen } =
    useCustomDialogContextFactory<{
      refetch?: () => Promise<any>
      selectedRows?: FailedMotorCertificateRow[]
    }>()

  const { data, isLoading, isError, refetch } = UseApiQuery<SubmitResponse>({
    url: DMVIC_CERT_URLS.failed,
    params: {
      page: filter.page,
      pageSize: filter.pageSize,
      term: filter.term,
    },
  })

  const rows = (data?.data ?? []) as FailedMotorCertificateRow[]

  const selectedRows = useMemo(
    () => rows.filter((row) => selectedIds.has(row.invoice_id)),
    [rows, selectedIds]
  )

  const retryMutation = UseApiMutation<
    SubmitResponse,
    { invoice_id: number }
  >({
    url: (vars) => DMVIC_CERT_URLS.retry(vars.invoice_id),
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: async (response) => {
        ShowToast.success(response.message || 'Certificate issued successfully.')
        await refetch()
        setSelectedIds(new Set())
      },
      onError: (error: unknown) => {
        ShowToast.error(extractErrorMessage(error) || 'Retry failed.')
      },
    },
  })

  const toggleRow = useCallback(
    (row: FailedMotorCertificateRow, checked: boolean) => {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        if (checked) next.add(row.invoice_id)
        else next.delete(row.invoice_id)
        return next
      })
    },
    []
  )

  const toggleAll = useCallback(
    (tableRows: FailedMotorCertificateRow[], checked: boolean) => {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        tableRows.forEach((row) => {
          if (checked) next.add(row.invoice_id)
          else next.delete(row.invoice_id)
        })
        return next
      })
    },
    []
  )

  const columns = useMemo(
    () =>
      BuildFailedMotorCertificateColumns({
        showSelection: canBulk,
        selectedIds,
        onToggleRow: toggleRow,
        onToggleAll: toggleAll,
      }),
    [canBulk, selectedIds, toggleRow, toggleAll]
  )

  const openBulkModal = () => {
    handleDialogContextSwitch({
      Component: BulkRetryModal,
      componentProps: {
        selectedRows,
        refetch: async () => {
          await refetch()
          setSelectedIds(new Set())
        },
      },
    })
  }

  const ActionsHandlerMapping: SingleActionsHandler<FailedMotorCertificateRow>[] =
    [
      {
        label: 'Retry',
        icon: RefreshCw,
        conditional: () => canRetry,
        onSelect: (row) => {
          retryMutation.mutate({ invoice_id: row.invoice_id })
        },
      },
    ]

  return (
    <div className="w-full space-y-4">
      {canBulk && selectedIds.size > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3">
          <p className="text-sm">
            {selectedIds.size} invoice(s) selected for bulk retry
          </p>
          <Button type="button" onClick={openBulkModal}>
            Retry selected
          </Button>
        </div>
      ) : null}

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
            placeholder: 'Search invoice or registration…',
            includeFilter: true,
          },
          columns: [
            ...columns,
            ...(canRetry ? [ActionColumn({ ActionsHandlerMapping })] : []),
          ],
          OtherTools: SearchTools,
          data: rows,
          pageCount: data?.pagination?.last_page ?? filter.page,
          title: 'Failed / missing certificates',
          showPagination: true,
          setPageSize: (pageSize) =>
            optionsDispatcher({
              payload: { pageSize },
              type: 'pageSize',
            }),
          pageSize: data?.pagination?.per_page ?? filter?.pageSize,
          page: data?.pagination?.current_page ?? filter?.page,
          isLoading: isLoading || retryMutation.isPending,
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
