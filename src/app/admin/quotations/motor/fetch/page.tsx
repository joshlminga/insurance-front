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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
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
import { Copy, Eye, Play } from 'lucide-react'
import { useMemo, useReducer, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  persistAdminMotorDuplicatePrefill,
  persistAdminMotorResumeFromDetail,
} from '../admin-motor-session'
import { MotorQuoteFetchDetailDialog } from './detail-dialog'

type FetchFilters = TPaginationFilters &
  TFilterOptions & {
    vehicle_registration_number?: string
    email?: string
    chassis_number?: string
  }

export const AdminMotorQuotationFetchPage = () => {
  const navigate = useNavigate()
  const [filter, optionsDispatcher] = useReducer(
    ReusableReducer<FetchFilters>,
    {
      ...FILTEROPTIONS,
      page: 1,
      pageSize: 10,
      vehicle_registration_number: '',
      email: '',
      chassis_number: '',
    }
  )
  const optionsDispatcherDebounce = useDebounce({
    debounceCallback: optionsDispatcher,
  })

  const [duplicateRow, setDuplicateRow] = useState<MotorQuoteFetchListRow | null>(null)
  const [startAt, setStartAt] = useState<MotorQuoteDuplicateStartAt>('quote')

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
    if (filter.vehicle_registration_number) {
      params.vehicle_registration_number = filter.vehicle_registration_number
    }
    if (filter.email) params.email = filter.email
    if (filter.chassis_number) params.chassis_number = filter.chassis_number
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
      onSuccess: (response) => {
        const payload = response?.data as MotorQuoteDuplicatePayload
        if (!payload?.start_quote) {
          ShowToast.error('Duplicate payload was empty')
          return
        }
        persistAdminMotorDuplicatePrefill(payload)
        setDuplicateRow(null)
        ShowToast.success('Duplicate payload ready — review and start a new quote')
        if (payload.start_at === 'quote') {
          navigate(EROUTES.MOTOR_QUOTATION_DUPLICATE)
          return
        }
        navigate(EROUTES.MOTORQUOTATIONS)
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error) || 'Failed to build duplicate payload')
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
      conditional: (row) => row.last_ended_stage !== 'certificate',
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
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Find motor quotation"
        description="Search by registration, email, chassis, quote code or ID. Resume the same session or duplicate into a new quote."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 rounded-lg border p-4">
        <div className="space-y-1.5">
          <Label htmlFor="fetch-plate">Vehicle Registration</Label>
          <Input
            id="fetch-plate"
            placeholder="KDC324F"
            value={filter.vehicle_registration_number ?? ''}
            onChange={(e) =>
              optionsDispatcherDebounce({
                payload: { vehicle_registration_number: e.target.value, page: 1 },
                type: 'vehicle_registration_number',
              })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fetch-email">Customer email</Label>
          <Input
            id="fetch-email"
            placeholder="guest@example.com"
            value={filter.email ?? ''}
            onChange={(e) =>
              optionsDispatcherDebounce({
                payload: { email: e.target.value, page: 1 },
                type: 'email',
              })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fetch-chassis">Chassis</Label>
          <Input
            id="fetch-chassis"
            placeholder="Chassis number"
            value={filter.chassis_number ?? ''}
            onChange={(e) =>
              optionsDispatcherDebounce({
                payload: { chassis_number: e.target.value, page: 1 },
                type: 'chassis_number',
              })
            }
          />
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => void refetch()}
          >
            Refresh
          </Button>
        </div>
      </div>

      <CustomBaseTable
        onPageChange={(page) =>
          optionsDispatcher({ payload: { page }, type: 'page' })
        }
        OtherToolsProps={{
          onChange: (term: string) =>
            optionsDispatcherDebounce({ payload: { term, page: 1 }, type: 'term' }),
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
    </div>
  )
}
