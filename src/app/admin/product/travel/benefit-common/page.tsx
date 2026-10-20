/* eslint-disable no-extra-boolean-cast */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from "@/components/shared"
import { ActionColumn } from "@/dev/columns"
import { TravelBenefitCommonColumns } from "@/dev/columns/admin/travel-benefit-common"
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
import { CreateTravelBenefitCommonModal } from "./modals/create"
import { EditTravelBenefitCommonModal } from "./modals/edit"

export function TravelBenefitCommonPage() {
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

  const { data, isLoading, refetch } = UseApiQuery<SubmitResponse>({
    url: "travel/benefit-common",
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
    url: ({ id }) => `travel/benefit-common/${id}`,
    method: EMETHODS.DELETE,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(
          response?.message || "Common benefit deleted successfully"
        )
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
    url: ({ id }) => `travel/benefit-common/${id}/status`,
    method: EMETHODS.PATCH,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(
          response?.message || "Common benefit status updated"
        )
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
          componentProps: { data: row, refetch },
          Component: EditTravelBenefitCommonModal,
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
        title="Common Benefits"
        description="Manage travel common benefits shown in comparison and single views"
        actions={[
          {
            icon: Plus,
            label: "Add Common Benefit",
            variant: "default",
            onClick: () => {
              handleDialogContextSwitch({
                componentProps: { refetch },
                Component: CreateTravelBenefitCommonModal,
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
              placeholder: "Search by short title",
              includeFilter: true,
            },
            columns: [
              ...TravelBenefitCommonColumns,
              ActionColumn({ ActionsHandlerMapping }),
            ],
            OtherTools: SearchTools,
            data: data?.data ?? [],
            pageCount: data?.pagination?.last_page ?? 1,
            title: "Common Benefits",
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
