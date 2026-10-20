/* eslint-disable no-extra-boolean-cast */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from "@/components/shared"
import { ActionColumn } from "@/dev/columns"
import { MotorRateExcessBenefitsColumns } from "@/dev/columns/admin/motor-excess-benefits"
import { CustomDialogComponent } from "@/dev/core"
import { CustomBaseTable, SearchTools } from "@/dev/table"
import { useCustomDialogContextFactory, useDebounce } from "@/hooks"
import { UseApiMutation, UseApiQuery } from "@/hooks/hooks"
import {
  SingleActionsHandler,
  SubmitResponse,
  TFilterOptions,
  TPaginationFilters,
} from "@/types/types"
import { EMETHODS, FILTEROPTIONS, ReusableReducer } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { Plus } from "lucide-react"
import { useReducer } from "react"
import { useLocation, useParams } from "react-router-dom"
import { CreateMotorRateBenefitModal } from "./modals/create"
import { EditMotorRateBenefitModal } from "./modals/edit"

/**
 * Rate-scoped benefit/excess details — Travel-style View Benefits for Motor rates.
 * List filters by product_rate_id from the route.
 */
export const MotorRateBenefitsPage = () => {
  const { rateId } = useParams()
  const location = useLocation()
  const navState = (location.state ?? {}) as { productName?: string }

  const [filter, optionsDispatcher] = useReducer(
    ReusableReducer<TPaginationFilters & TFilterOptions>,
    { ...FILTEROPTIONS, page: 1, pageSize: 15 }
  )
  const optionsDispatcherDebounce = useDebounce({
    debounceCallback: optionsDispatcher,
  })

  const { handleDialogContextSwitch, dialogContent, dialogOpen } =
    useCustomDialogContextFactory<{
      refetch?: () => Promise<any>
      data?: any
      rateId?: string | number
      rateLabel?: string
    }>()

  const rateLabel =
    navState.productName?.trim() ||
    (rateId ? `Rate #${rateId}` : "Motor rate")

  const { data, isLoading, refetch } = UseApiQuery<SubmitResponse>({
    url: "products/motor/rate-details",
    params: {
      product_rate_id: rateId,
      page: filter.page,
      per_page: filter.pageSize,
      term: filter.term,
    },
    queryOptions: {
      enabled: !!rateId,
    },
  })

  const deleteMutation = UseApiMutation<SubmitResponse, { id: number | string }>({
    url: ({ id }) => `products/motor/rate-details/${id}`,
    method: EMETHODS.DELETE,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response?.message || "Benefit detail deleted")
        refetch()
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const toggleStatusMutation = UseApiMutation<
    SubmitResponse,
    { id: number | string; is_active: boolean }
  >({
    url: ({ id }) => `products/motor/rate-details/${id}/status`,
    method: EMETHODS.PATCH,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response?.message || "Status updated")
        refetch()
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const ActionsHandlerMapping: SingleActionsHandler<any>[] = [
    {
      label: "Edit",
      onSelect: (row) => {
        handleDialogContextSwitch({
          componentProps: { data: row, refetch, rateId, rateLabel },
          Component: EditMotorRateBenefitModal,
        })
      },
    },
    {
      label: "Delete",
      onSelect: (row) => {
        deleteMutation.mutate({ id: row?.id })
      },
      conditional: (row) => Boolean(row?.id),
    },
    {
      label: "Deactivate",
      onSelect: (row) => {
        toggleStatusMutation.mutate({ is_active: false, id: row?.id })
      },
      conditional: (row) => Boolean(row?.id) && Boolean(row?.is_active),
    },
    {
      label: "Activate",
      onSelect: (row) => {
        toggleStatusMutation.mutate({ is_active: true, id: row?.id })
      },
      conditional: (row) => Boolean(row?.id) && !Boolean(row?.is_active),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Motor Rate Benefits"
        description={`Benefit / excess details for ${rateLabel}`}
        actions={[
          {
            icon: Plus,
            label: "Add Benefit",
            variant: "default",
            onClick: () => {
              handleDialogContextSwitch({
                componentProps: { refetch, rateId, rateLabel },
                Component: CreateMotorRateBenefitModal,
              })
            },
          },
        ]}
      />
      <div className="w-full">
        <CustomBaseTable
          {...{
            onPageChange: (page) =>
              optionsDispatcher({
                payload: { page },
                type: "page",
              }),
            OtherToolsProps: {
              onChange: (term: any) =>
                optionsDispatcherDebounce({
                  payload: { term, page: 1 },
                  type: "term",
                }),
              placeholder: "Search by key or value",
              includeFilter: true,
            },
            columns: [
              ...MotorRateExcessBenefitsColumns,
              ActionColumn({ ActionsHandlerMapping }),
            ],
            OtherTools: SearchTools,
            data: data?.data ?? [],
            pageCount: data?.pagination?.last_page ?? 1,
            title: "Rate Benefits",
            showPagination: true,
            setPageSize: (pageSize) =>
              optionsDispatcher({
                payload: { pageSize },
                type: "pageSize",
              }),
            pageSize: data?.pagination?.per_page ?? filter?.pageSize,
            page: data?.pagination?.current_page ?? filter?.page,
            isLoading: isLoading,
          }}
        />
      </div>
      <CustomDialogComponent
        {...{ handleDialogContextSwitch, dialogOpen }}
        className="sm:max-w-fit w-[95vw] sm:w-auto h-auto max-h-[80dvh]">
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
