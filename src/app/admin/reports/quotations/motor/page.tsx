import { PageHeader } from '@/components/shared'
import { ActionColumn } from '@/dev/columns'
import { MotorQuoteFetchColumns } from '@/dev/columns/admin/quotations/motor-quote-fetch'
import { CustomDialogComponent } from '@/dev/core'
import { CustomBaseTable, SearchTools } from '@/dev/table'
import { useCustomDialogContextFactory, useDebounce } from '@/hooks'
import { UseApiQuery } from '@/hooks/hooks'
import type { SingleActionsHandler, SubmitResponse, TFilterOptions, TPaginationFilters } from '@/types/types'
import { FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts'
import { EROUTES } from '@/utils/enums'
import { useReducer } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye } from 'lucide-react'
import { MotorQuoteFetchDetailDialog } from '@/app/admin/quotations/motor/fetch/detail-dialog'
import {
  persistAdminMotorResumeFromDetail,
} from '@/app/admin/quotations/motor/admin-motor-session'
import apiClient from '@/lib/api-client'
import { ShowToast } from '@/utils/utils'
import { extractErrorMessage } from '@/utils/helpers'
import type { MotorQuoteFetchDetail, MotorQuoteFetchListRow } from '@/types/types'

export const QuotationReportsMotorPage = () => {
  const navigate = useNavigate()
  const [filter, optionsDispatcher] = useReducer(
    ReusableReducer<TPaginationFilters & TFilterOptions>,
    { ...FILTEROPTIONS, page: 1, pageSize: 10 }
  )
  const optionsDispatcherDebounce = useDebounce({
    debounceCallback: optionsDispatcher,
  })

  const { handleDialogContextSwitch, dialogContent, dialogOpen } =
    useCustomDialogContextFactory<{
      data?: MotorQuoteFetchDetail
      refetch?: () => Promise<unknown>
    }>()

  const { data, isLoading, isError } = UseApiQuery<SubmitResponse>({
    url: 'quotation/motor/fetch',
    params: {
      page: filter.page,
      per_page: filter.pageSize,
      term: filter.term,
      sort_by: 'id',
      direction: 'desc',
    },
    queryOptions: { enabled: true },
  })

  const openDetail = async (row: MotorQuoteFetchListRow) => {
    try {
      const response = await apiClient.get<SubmitResponse>(`quotation/motor/fetch/${row.id}`)
      handleDialogContextSwitch({
        componentProps: {
          data: {
            ...(response.data?.data as MotorQuoteFetchDetail),
            id: row.id,
          } as MotorQuoteFetchDetail,
        },
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
      if (stage === 'quote' || stage === 'rates') {
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
      onSelect: (row) => {
        void resumeQuote(row)
      },
      conditional: (row) => row.last_ended_stage !== 'certificate',
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Listed motor quotations"
        description="Browse motor quotations across customers, vehicles, and stages."
      />
      <CustomBaseTable
        onPageChange={(page) =>
          optionsDispatcher({ payload: { page }, type: 'page' })
        }
        OtherToolsProps={{
          onChange: (term: string) =>
            optionsDispatcherDebounce({ payload: { term }, type: 'term' }),
          placeholder: 'Search quote code, registration, email…',
          includeFilter: true,
        }}
        columns={[...MotorQuoteFetchColumns, ActionColumn({ ActionsHandlerMapping })]}
        OtherTools={SearchTools}
        data={data?.data ?? []}
        pageCount={data?.pagination?.last_page ?? filter.page}
        title="Motor quotations"
        showPagination
        setPageSize={(pageSize) =>
          optionsDispatcher({ payload: { pageSize }, type: 'pageSize' })
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
    </div>
  )
}
