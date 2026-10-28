/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  isMotorQuoteResumable,
  persistCustomerMotorResumeFromDetail,
} from '@/app/customer/quotations/customer-motor-resume'
import {
  isTravelQuoteResumable,
  persistCustomerTravelResumeFromDetail,
} from '@/app/customer/quotations/customer-travel-resume'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ActionColumn } from '@/dev/columns'
import {
  CustomerMotorQuotationsColumns,
  CustomerTravelQuotationsColumns,
  type CustomerQuotationRow,
} from '@/dev/columns/customer/quotations/my-quotations'
import { CustomBaseTable, SearchTools } from '@/dev/table'
import { useDebounce } from '@/hooks'
import { UseApiQuery } from '@/hooks/hooks'
import { usePurchaseStepper } from '@/hooks/use-purchase-stepper'
import apiClient from '@/lib/api-client'
import type {
  MotorQuoteFetchDetail,
  SingleActionsHandler,
  SubmitResponse,
  TFilterOptions,
  TPaginationFilters,
  TravelQuoteFetchDetail,
} from '@/types/types'
import { FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts'
import { EPREFIX, EROUTES } from '@/utils/enums'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { Eye, Play } from 'lucide-react'
import { useReducer } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const QUOTE_PRODUCT_PARAM = 'product'

const QUOTE_PRODUCTS = {
  motor: {
    label: 'Motor',
    listUrl: 'reports/motor/user/quotations',
    fetchUrl: (id: number | string) => `quotation/motor/fetch/${id}`,
    continuePath: `/${EPREFIX.CUSTOMER}${EROUTES.MOTOR}`,
    coversPath: `/${EPREFIX.CUSTOMER}${EROUTES.COVERS}?product=motor`,
  },
  travel: {
    label: 'Travel',
    listUrl: 'reports/travel/user/quotations',
    fetchUrl: (id: number | string) => `quotation/travel/fetch/${id}`,
    continuePath: `/${EPREFIX.CUSTOMER}${EROUTES.TRAVEL}`,
    coversPath: `/${EPREFIX.CUSTOMER}${EROUTES.COVERS}?product=travel`,
  },
} as const

type QuoteProduct = keyof typeof QUOTE_PRODUCTS

function resolveQuoteProduct(value: string | null): QuoteProduct {
  return value === 'travel' ? 'travel' : 'motor'
}

export const CustomerQuotationsPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const product = resolveQuoteProduct(searchParams.get(QUOTE_PRODUCT_PARAM))
  const { setCurrentStep: setMotorStep } = usePurchaseStepper('motor')
  const { setCurrentStep: setTravelStep } = usePurchaseStepper('travel')

  const [filter, optionsDispatcher] = useReducer(
    ReusableReducer<TPaginationFilters & TFilterOptions>,
    { ...FILTEROPTIONS, page: 1, pageSize: 10 }
  )
  const optionsDispatcherDebounce = useDebounce({
    debounceCallback: optionsDispatcher,
  })

  const { data, isLoading } = UseApiQuery<SubmitResponse>({
    url: QUOTE_PRODUCTS[product].listUrl,
    params: {
      page: filter.page,
      pageSize: filter.pageSize,
      term: filter.term,
    },
    queryOptions: { enabled: true },
  })

  const resumeMotor = async (row: CustomerQuotationRow) => {
    try {
      const response = await apiClient.get<SubmitResponse>(
        QUOTE_PRODUCTS.motor.fetchUrl(row.id)
      )
      const detail = response.data?.data as MotorQuoteFetchDetail
      const { stage, step } = persistCustomerMotorResumeFromDetail(detail)
      setMotorStep(step)
      ShowToast.success(`Resuming from ${stage}`)
      navigate(QUOTE_PRODUCTS.motor.continuePath)
    } catch (error) {
      ShowToast.error(extractErrorMessage(error) || 'Failed to resume quotation')
    }
  }

  const resumeTravel = async (row: CustomerQuotationRow) => {
    try {
      const response = await apiClient.get<SubmitResponse>(
        QUOTE_PRODUCTS.travel.fetchUrl(row.id)
      )
      const detail = response.data?.data as TravelQuoteFetchDetail
      const { stage, step } = persistCustomerTravelResumeFromDetail(detail)
      setTravelStep(step)
      ShowToast.success(`Resuming from ${stage}`)
      navigate(QUOTE_PRODUCTS.travel.continuePath)
    } catch (error) {
      ShowToast.error(extractErrorMessage(error) || 'Failed to resume quotation')
    }
  }

  const ActionsHandlerMapping: SingleActionsHandler<CustomerQuotationRow>[] = [
    {
      label: 'Continue',
      icon: Play,
      onSelect: (row) => {
        if (product === 'motor') {
          void resumeMotor(row)
          return
        }
        void resumeTravel(row)
      },
      conditional: (row) =>
        product === 'motor' ? isMotorQuoteResumable(row) : isTravelQuoteResumable(row),
    },
    {
      label: 'View cover',
      icon: Eye,
      onSelect: () => {
        navigate(QUOTE_PRODUCTS[product].coversPath)
      },
      conditional: (row) =>
        product === 'motor' ? !isMotorQuoteResumable(row) : !isTravelQuoteResumable(row),
    },
  ]

  const columns =
    product === 'motor'
      ? CustomerMotorQuotationsColumns
      : CustomerTravelQuotationsColumns

  return (
    <section>
      <div className="grid grid-cols-1 lg:grid-cols-1">
        <div className="rounded-xl border border-[#EAEAEA] bg-white p-5 sm:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-[#111111] mb-1">
            My Quotations
          </h2>
          <p className="text-sm text-[#71717A] mb-5 sm:mb-6">
            Continue where you left off, or open completed covers.
          </p>

          <Tabs
            value={product}
            onValueChange={(value) => {
              setSearchParams({ [QUOTE_PRODUCT_PARAM]: value })
              optionsDispatcher({ payload: { page: 1, term: '' }, type: 'page' })
            }}
            className="mb-5"
          >
            <TabsList>
              <TabsTrigger value="motor">Motor</TabsTrigger>
              <TabsTrigger value="travel">Travel</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="w-full">
            <CustomBaseTable
              onPageChange={(page) =>
                optionsDispatcher({ payload: { page }, type: 'page' })
              }
              OtherToolsProps={{
                onChange: (term: string) =>
                  optionsDispatcherDebounce({ payload: { term }, type: 'term' }),
                placeholder: 'Search quote code…',
                includeFilter: true,
              }}
              columns={[...columns, ActionColumn({ ActionsHandlerMapping })]}
              OtherTools={SearchTools}
              data={data?.data ?? []}
              pageCount={data?.pagination?.last_page ?? 1}
              title={`${QUOTE_PRODUCTS[product].label} quotations`}
              showPagination
              setPageSize={(pageSize) =>
                optionsDispatcher({ payload: { pageSize }, type: 'pageSize' })
              }
              pageSize={data?.pagination?.per_page ?? 10}
              page={data?.pagination?.current_page ?? 1}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
