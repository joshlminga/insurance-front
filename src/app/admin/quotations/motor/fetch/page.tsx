/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from '@/components/shared'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { ActionColumn } from '@/dev/columns'
import { MotorQuoteFetchColumns } from '@/dev/columns/admin/quotations/motor-quote-fetch'
import { CustomDialogComponent } from '@/dev/core'
import { CustomBaseTable, SearchTools } from '@/dev/table'
import { useCustomDialogContextFactory, useDebounce } from '@/hooks'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import apiClient from '@/lib/api-client'
import type {
  MotorQuoteDuplicatePayload,
  MotorQuoteDuplicateStartAt,
  MotorQuoteFetchDetail,
  MotorQuoteFetchListRow,
  SingleActionsHandler,
  SubmitResponse,
  TFilterOptions,
  TPaginationFilters,
} from '@/types/types'
import { EMETHODS, FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts'
import { EROUTES } from '@/utils/enums'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { Ban, Copy, Eye, Play } from 'lucide-react'
import { useMemo, useReducer, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UseAuth } from '@/stores/auth-store'
import {
  persistAdminMotorResumeFromDetail,
} from '../admin-motor-session'
import { continueAdminMotorDuplicateFlow } from '../continue-duplicate-flow'
import { MotorQuoteFetchDetailDialog } from './detail-dialog'

type FetchFilters = TPaginationFilters & TFilterOptions

export const AdminMotorQuotationFetchPage = () => {
  const navigate = useNavigate()
  const { user } = UseAuth()
  const [filter, optionsDispatcher] = useReducer(
    ReusableReducer<FetchFilters>,
    {
      ...FILTEROPTIONS,
      page: 1,
      pageSize: 10,
    }
  )
  const optionsDispatcherDebounce = useDebounce({
    debounceCallback: optionsDispatcher,
  })

  const [duplicateRow, setDuplicateRow] = useState<MotorQuoteFetchListRow | null>(null)
  const [startAt, setStartAt] = useState<MotorQuoteDuplicateStartAt>('quote')
  // Row selected for cancel confirmation (null when dialog is closed)
  const [cancelRow, setCancelRow] = useState<MotorQuoteFetchListRow | null>(null)
  const [cancellationReason, setCancellationReason] = useState('')

  const { handleDialogContextSwitch, dialogContent, dialogOpen } =
    useCustomDialogContextFactory<{
      data?: MotorQuoteFetchDetail
    }>()

  const queryParams = useMemo(() => {
    const params: Record<string, string | number> = {
      page: filter.page,
      per_page: filter.pageSize,
      sort_by: 'id',
      direction: 'desc',
    }
    if (filter.term) params.term = filter.term
    return params
  }, [filter])

  const { data, isLoading, isError, refetch } = UseApiQuery<SubmitResponse>({
    url: 'quotation/motor/fetch',
    params: queryParams,
    queryOptions: { enabled: true },
  })

  const duplicateMutation = UseApiMutation<
    SubmitResponse,
    { sessionId: number; start_at: MotorQuoteDuplicateStartAt }
  >({
    url: ({ sessionId }) => `quotation/motor/fetch/${sessionId}/duplicate`,
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: async (response) => {
        const payload = response?.data as MotorQuoteDuplicatePayload
        if (!payload?.start_quote) {
          ShowToast.error('Duplicate payload was empty')
          return
        }
        try {
          const result = await continueAdminMotorDuplicateFlow(payload, user)
          setDuplicateRow(null)
          ShowToast.success(
            result.startAt === 'quote'
              ? 'Duplicate payload ready — review and start a new quote'
              : `Duplicated quotation ready at ${result.startAt}`
          )
          navigate(result.route)
        } catch (error) {
          ShowToast.error(extractErrorMessage(error) || 'Failed to continue duplicated quotation')
        }
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error) || 'Failed to build duplicate payload')
      },
    },
  })

  // POST cancel — only works for unpaid cancelable quotes (API enforces can_cancel rules)
  const cancelMutation = UseApiMutation<
    SubmitResponse,
    { sessionId: number; cancellation_reason?: string }
  >({
    url: ({ sessionId }) => `quotation/motor/fetch/${sessionId}/cancel`,
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: () => {
        setCancelRow(null)
        setCancellationReason('')
        ShowToast.success('Quotation cancelled')
        void refetch()
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error) || 'Failed to cancel quotation')
      },
    },
  })

  const openDetail = async (row: MotorQuoteFetchListRow) => {
    try {
      const response = await apiClient.get<SubmitResponse>(`quotation/motor/fetch/${row.id}`)
      handleDialogContextSwitch({
        componentProps: { data: response.data?.data as MotorQuoteFetchDetail },
        Component: MotorQuoteFetchDetailDialog,
      })
    } catch (error) {
      ShowToast.error(extractErrorMessage(error) || 'Failed to load quote details')
    }
  }

  const resumeQuote = async (row: MotorQuoteFetchListRow) => {
    try {
      const response = await apiClient.get<SubmitResponse>(`quotation/motor/fetch/${row.id}`)
      const detail = response.data?.data as MotorQuoteFetchDetail
      const { stage } = persistAdminMotorResumeFromDetail(detail)
      ShowToast.success(`Resuming from ${stage}`)
      if (stage === 'quote') {
        navigate(EROUTES.MOTOR_QUOTATION_RESULTS)
        return
      }
      navigate(EROUTES.MOTOR_QUOTATION_PURCHASE)
    } catch (error) {
      ShowToast.error(extractErrorMessage(error) || 'Failed to resume quotation')
    }
  }

  const ActionsHandlerMapping: SingleActionsHandler<MotorQuoteFetchListRow>[] = [
    {
      label: 'View',
      icon: Eye,
      onSelect: (row) => {
        void openDetail(row)
      },
    },
    {
      label: 'Resume',
      icon: Play,
      onSelect: (row) => {
        void resumeQuote(row)
      },
      // Hide resume after certificate or when already cancelled
      conditional: (row) =>
        row.last_ended_stage !== 'certificate' && row.status !== 'cancelled',
    },
    {
      label: 'Duplicate',
      icon: Copy,
      onSelect: (row) => {
        setStartAt(
          row.last_ended_stage === 'rates' ||
            row.last_ended_stage === 'kyc' ||
            row.last_ended_stage === 'payment'
            ? row.last_ended_stage
            : 'quote'
        )
        setDuplicateRow(row)
      },
    },
    {
      label: 'Cancel',
      icon: Ban,
      // Backend sets can_cancel only for unpaid cancelable statuses
      conditional: (row) => row.can_cancel === true,
      onSelect: (row) => {
        setCancellationReason('')
        setCancelRow(row)
      },
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Find motor quotation"
        description="Search by quote code or session ID. Resume the same session or duplicate into a new quote."
      />

      <CustomBaseTable
        onPageChange={(page) =>
          optionsDispatcher({ payload: { page }, type: 'page' })
        }
        OtherToolsProps={{
          onChange: (term: string) =>
            optionsDispatcherDebounce({ payload: { term, page: 1 }, type: 'term' }),
          // Immediate clear (skip debounce) when user hits the filter X
          advancedHandler: () =>
            optionsDispatcher({ payload: { term: '', page: 1 }, type: 'term' }),
          placeholder: 'Quote code or session ID…',
          includeFilter: true,
        }}
        columns={[...MotorQuoteFetchColumns, ActionColumn({ ActionsHandlerMapping })]}
        OtherTools={SearchTools}
        data={data?.data ?? []}
        pageCount={data?.pagination?.last_page ?? filter.page}
        title="Matching quotations"
        showPagination
        setPageSize={(pageSize) =>
          optionsDispatcher({ payload: { pageSize, page: 1 }, type: 'pageSize' })
        }
        pageSize={data?.pagination?.per_page ?? filter.pageSize}
        page={data?.pagination?.current_page ?? filter.page}
        isLoading={isLoading}
        isError={isError}
      />

      <CustomDialogComponent
        handleDialogContextSwitch={handleDialogContextSwitch}
        dialogOpen={dialogOpen}
        className="sm:max-w-3xl w-[95vw] p-4 sm:p-6"
      >
        {dialogContent?.Component && (
          <dialogContent.Component
            componentProps={dialogContent.componentProps}
            handleDialogContextSwitch={handleDialogContextSwitch}
          />
        )}
      </CustomDialogComponent>

      <AlertDialog
        open={Boolean(duplicateRow)}
        onOpenChange={(open) => {
          if (!open) setDuplicateRow(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate quotation</AlertDialogTitle>
            <AlertDialogDescription>
              Choose where the new quote should start. We will prefill Start New with cover
              details from {duplicateRow?.quote_code ?? 'this quote'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <RadioGroup
            value={startAt}
            onValueChange={(value) => setStartAt(value as MotorQuoteDuplicateStartAt)}
            className="gap-3 py-2"
          >
            {(
              [
                ['quote', 'Quote intake only'],
                ['rates', 'Rates / cover selection'],
                ['kyc', 'KYC (includes rates)'],
                ['payment', 'Payment (includes KYC)'],
              ] as const
            ).map(([value, label]) => (
              <div key={value} className="flex items-center gap-2">
                <RadioGroupItem value={value} id={`dup-${value}`} />
                <Label htmlFor={`dup-${value}`}>{label}</Label>
              </div>
            ))}
          </RadioGroup>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!duplicateRow) return
                duplicateMutation.mutate({
                  sessionId: duplicateRow.id,
                  start_at: startAt,
                })
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm cancel — only shown for rows where can_cancel is true */}
      <AlertDialog
        open={Boolean(cancelRow)}
        onOpenChange={(open) => {
          if (!open) {
            setCancelRow(null)
            setCancellationReason('')
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel quotation</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark {cancelRow?.quote_code ?? 'this quotation'} as cancelled. This
              cannot be undone. Quotes that have already been paid cannot be cancelled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-1.5 py-2">
            <Label htmlFor="cancel-reason">Reason (optional)</Label>
            <Textarea
              id="cancel-reason"
              placeholder="Why is this quotation being cancelled?"
              value={cancellationReason}
              maxLength={500}
              onChange={(e) => setCancellationReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep quotation</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!cancelRow) return
                const reason = cancellationReason.trim()
                cancelMutation.mutate({
                  sessionId: cancelRow.id,
                  ...(reason ? { cancellation_reason: reason } : {}),
                })
              }}
            >
              Cancel quotation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
