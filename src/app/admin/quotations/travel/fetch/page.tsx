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
import { TravelQuoteFetchColumns } from '@/dev/columns/admin/quotations/travel-quote-fetch'
import { CustomDialogComponent } from '@/dev/core'
import { CustomBaseTable, SearchTools } from '@/dev/table'
import { useCustomDialogContextFactory, useDebounce } from '@/hooks'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import apiClient from '@/lib/api-client'
import type {
  SingleActionsHandler,
  SubmitResponse,
  TFilterOptions,
  TPaginationFilters,
  TravelQuoteDuplicatePayload,
  TravelQuoteDuplicateStartAt,
  TravelQuoteFetchDetail,
  TravelQuoteFetchListRow,
} from '@/types/types'
import { EMETHODS, FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts'
import { EROUTES } from '@/utils/enums'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { Ban, Copy, Eye, Play } from 'lucide-react'
import { useMemo, useReducer, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UseAuth } from '@/stores/auth-store'
import { persistAdminTravelResumeFromDetail } from '../admin-travel-session'
import { continueAdminTravelDuplicateFlow } from '../continue-duplicate-flow'
import { TravelQuoteFetchDetailDialog } from './detail-dialog'

type FetchFilters = TPaginationFilters & TFilterOptions

export const AdminTravelQuotationFetchPage = () => {
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

  const [duplicateRow, setDuplicateRow] = useState<TravelQuoteFetchListRow | null>(null)
  const [startAt, setStartAt] = useState<TravelQuoteDuplicateStartAt>('quote')
  // Row selected for cancel confirmation (null when the dialog is closed)
  const [cancelRow, setCancelRow] = useState<TravelQuoteFetchListRow | null>(null)
  const [cancellationReason, setCancellationReason] = useState('')

  const { handleDialogContextSwitch, dialogContent, dialogOpen } =
    useCustomDialogContextFactory<{
      data?: TravelQuoteFetchDetail
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
    url: 'quotation/travel/fetch',
    params: queryParams,
    queryOptions: { enabled: true },
  })

  const duplicateMutation = UseApiMutation<
    SubmitResponse,
    { sessionId: number; start_at: TravelQuoteDuplicateStartAt }
  >({
    url: ({ sessionId }) => `quotation/travel/fetch/${sessionId}/duplicate`,
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: async (response) => {
        const payload = response?.data as TravelQuoteDuplicatePayload
        if (!payload?.start_quote) {
          ShowToast.error('Duplicate payload was empty')
          return
        }
        try {
          const result = await continueAdminTravelDuplicateFlow(payload, user)
          setDuplicateRow(null)
          ShowToast.success(
            result.startAt === 'quote'
              ? 'Duplicate payload ready - review and start a new quote'
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

  // POST cancel — API only allows this when the row's can_cancel is true
  const cancelMutation = UseApiMutation<
    SubmitResponse,
    { sessionId: number; cancellation_reason?: string }
  >({
    url: ({ sessionId }) => `quotation/travel/fetch/${sessionId}/cancel`,
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

  const openDetail = async (row: TravelQuoteFetchListRow) => {
    try {
      const response = await apiClient.get<SubmitResponse>(`quotation/travel/fetch/${row.id}`)
      handleDialogContextSwitch({
        componentProps: { data: response.data?.data as TravelQuoteFetchDetail },
        Component: TravelQuoteFetchDetailDialog,
      })
    } catch (error) {
      ShowToast.error(extractErrorMessage(error) || 'Failed to load quote details')
    }
  }

  const resumeQuote = async (row: TravelQuoteFetchListRow) => {
    try {
      const response = await apiClient.get<SubmitResponse>(`quotation/travel/fetch/${row.id}`)
      const detail = response.data?.data as TravelQuoteFetchDetail
      const { stage } = persistAdminTravelResumeFromDetail(detail)
      ShowToast.success(`Resuming from ${stage}`)
      if (stage === 'quote') {
        navigate(EROUTES.TRAVEL_QUOTATION_RESULTS)
        return
      }
      navigate(EROUTES.TRAVEL_QUOTATION_PURCHASE)
    } catch (error) {
      ShowToast.error(extractErrorMessage(error) || 'Failed to resume quotation')
    }
  }

  const ActionsHandlerMapping: SingleActionsHandler<TravelQuoteFetchListRow>[] = [
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
      conditional: (row) => row.status !== 'cancelled',
    },
    {
      label: 'Duplicate',
      icon: Copy,
      onSelect: (row) => {
        // Default to the stage the source actually reached. Quote is the fallback.
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
        title="Find travel quotation"
        description="Search by quote code, customer, traveler, or destination. Resume the same session, duplicate into a new quote, or cancel an unpaid quote."
      />

      <CustomBaseTable
        onPageChange={(page) =>
          optionsDispatcher({ payload: { page }, type: 'page' })
        }
        OtherToolsProps={{
          onChange: (term: string) =>
            optionsDispatcherDebounce({ payload: { term, page: 1 }, type: 'term' }),
          advancedHandler: () =>
            optionsDispatcher({ payload: { term: '', page: 1 }, type: 'term' }),
          placeholder: 'Quote code, email, traveler, destination…',
          includeFilter: true,
        }}
        columns={[...TravelQuoteFetchColumns, ActionColumn({ ActionsHandlerMapping })]}
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
              Choose where the new quote should start. We will prefill the travel quotation
              form with trip and customer details from {duplicateRow?.quote_code ?? 'this quote'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <RadioGroup
            value={startAt}
            onValueChange={(value) => setStartAt(value as TravelQuoteDuplicateStartAt)}
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
                <RadioGroupItem value={value} id={`travel-dup-${value}`} />
                <Label htmlFor={`travel-dup-${value}`}>{label}</Label>
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

      {/* Confirm cancel — only opened for rows where can_cancel is true */}
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
            <Label htmlFor="travel-cancel-reason">Reason (optional)</Label>
            <Textarea
              id="travel-cancel-reason"
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
