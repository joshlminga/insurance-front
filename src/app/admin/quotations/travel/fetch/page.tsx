/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from '@/components/shared'
import { ActionColumn } from '@/dev/columns'
import { TravelQuoteFetchColumns } from '@/dev/columns/admin/quotations/travel-quote-fetch'
import { CustomDialogComponent } from '@/dev/core'
import { CustomBaseTable, SearchTools } from '@/dev/table'
import { useCustomDialogContextFactory, useDebounce } from '@/hooks'
import { UseApiQuery } from '@/hooks/hooks'
import apiClient from '@/lib/api-client'
import type {
  SingleActionsHandler,
  SubmitResponse,
  TFilterOptions,
  TPaginationFilters,
  TravelQuoteFetchDetail,
  TravelQuoteFetchListRow,
} from '@/types/types'
import { FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts'
import { EROUTES } from '@/utils/enums'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { Eye, Play } from 'lucide-react'
import { useMemo, useReducer } from 'react'
import { useNavigate } from 'react-router-dom'
import { persistAdminTravelResumeFromDetail } from '../admin-travel-session'
import { TravelQuoteFetchDetailDialog } from './detail-dialog'

type FetchFilters = TPaginationFilters & TFilterOptions

export const AdminTravelQuotationFetchPage = () => {
  const navigate = useNavigate()
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

  const { data, isLoading, isError } = UseApiQuery<SubmitResponse>({
    url: 'quotation/travel/fetch',
    params: queryParams,
    queryOptions: { enabled: true },
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
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Find travel quotation"
        description="Search by quote code, customer, traveler, or destination. View details or resume the same session."
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
    </div>
  )
}
