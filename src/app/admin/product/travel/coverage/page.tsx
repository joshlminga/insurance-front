/* eslint-disable no-extra-boolean-cast */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from "@/components/shared"
import { ActionColumn } from "@/dev/columns"
import { TravelCoverageColumns } from "@/dev/columns/admin/travel-coverage"
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
import { CreateTravelCoverageModal } from "./modals/create"
import { EditTravelCoverageModal } from "./modals/edit"
import { ViewTravelCoverageModal } from "./modals/view"

export function TravelCoveragePage() {
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
    }>()

  // Coverage list: data[] + pagination at top level (same shape as vehicle-classes)
  const { data, isLoading, refetch } = UseApiQuery<SubmitResponse>({
    url: "travel/coverage",
    params: {
      page: filter.page,
      per_page: filter.pageSize,
      term: filter.term,
    },
    queryOptions: {
      enabled: true,
    },
  })

  const deleteMutation = UseApiMutation<SubmitResponse, { id: number | string }>({
    url: ({ id }) => `travel/coverage/${id}`,
    method: EMETHODS.DELETE,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response?.message || "Coverage deleted successfully")
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
    url: ({ id }) => `travel/coverage/${id}/status`,
    method: EMETHODS.PATCH,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response?.message || "Coverage status updated")
        refetch()
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const ActionsHandlerMapping: SingleActionsHandler<any>[] = [
    {
      label: "View Details",
      onSelect: (row) => {
        handleDialogContextSwitch({
          componentProps: { data: row, refetch },
          Component: ViewTravelCoverageModal,
        })
      },
    },
    {
      label: "Edit",
      onSelect: (row) => {
        handleDialogContextSwitch({
          componentProps: { data: row, refetch },
          Component: EditTravelCoverageModal,
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
        title="Travel Coverage"
        description="Manage travel coverage zones — continents and optional country includes or excludes"
        actions={[
          {
            icon: Plus,
            label: "Add Coverage",
            variant: "default",
            onClick: () => {
              handleDialogContextSwitch({
                componentProps: { refetch },
                Component: CreateTravelCoverageModal,
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
              placeholder: "Search by name",
              includeFilter: true,
            },
            columns: [
              ...TravelCoverageColumns,
              ActionColumn({ ActionsHandlerMapping }),
            ],
            OtherTools: SearchTools,
            data: data?.data ?? [],
            pageCount: data?.pagination?.last_page ?? 1,
            title: "Travel Coverage",
            showPagination: true,
            setPageSize: (pageSize) =>
              optionsDispatcher({
                payload: { pageSize },
                type: "pageSize",
              }),
            pageSize: data?.pagination?.per_page ?? 10,
            page: data?.pagination?.current_page ?? 1,
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
