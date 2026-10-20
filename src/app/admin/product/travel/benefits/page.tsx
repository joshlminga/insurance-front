/* eslint-disable no-extra-boolean-cast */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from "@/components/shared"
import { ActionColumn } from "@/dev/columns"
import { TravelBenefitsColumns } from "@/dev/columns/admin/travel-benefits"
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
import { useParams } from "react-router-dom"
import { CreateTravelBenefitModal } from "./modals/create"
import { EditTravelBenefitModal } from "./modals/edit"

/**
 * Product-scoped benefits — same idea as travel-rates/:productId.
 * List filters by product_travel_id from the route.
 */
export const TravelProductBenefitsPage = () => {
  const { productId } = useParams()

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
      productId?: string | number
      productName?: string
    }>()

  // Load product so the page / modals can show which product we are editing.
  const { data: productResponse } = UseApiQuery<SubmitResponse>({
    url: `products/travel/${productId}`,
    queryOptions: {
      enabled: !!productId,
    },
  })
  const productName: string =
    productResponse?.data?.product?.name ??
    (productId ? `Product #${productId}` : "Travel product")

  const { data, isLoading, refetch } = UseApiQuery<SubmitResponse>({
    url: "products/travel/benefits",
    params: {
      page: filter.page,
      per_page: filter.pageSize,
      term: filter.term,
      product_travel_id: productId,
    },
    queryOptions: {
      enabled: !!productId,
    },
  })

  const deleteMutation = UseApiMutation<SubmitResponse, { id: number | string }>({
    url: ({ id }) => `products/travel/benefits/${id}`,
    method: EMETHODS.DELETE,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response?.message || "Benefit deleted successfully")
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
    url: ({ id }) => `products/travel/benefits/${id}/status`,
    method: EMETHODS.PATCH,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response?.message || "Benefit status updated")
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
          componentProps: { data: row, refetch, productId, productName },
          Component: EditTravelBenefitModal,
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
        title="Travel Product Benefits"
        description={`Benefits for ${productName}`}
        actions={[
          {
            icon: Plus,
            label: "Add Benefit",
            variant: "default",
            onClick: () => {
              handleDialogContextSwitch({
                componentProps: { refetch, productId, productName },
                Component: CreateTravelBenefitModal,
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
              placeholder: "Search benefits",
              includeFilter: true,
            },
            columns: [
              ...TravelBenefitsColumns,
              ActionColumn({ ActionsHandlerMapping }),
            ],
            OtherTools: SearchTools,
            data: data?.data ?? [],
            pageCount: data?.pagination?.last_page ?? 1,
            title: "Travel Benefits",
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
