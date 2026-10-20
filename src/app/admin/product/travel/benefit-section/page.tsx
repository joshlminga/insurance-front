/* eslint-disable no-extra-boolean-cast */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from "@/components/shared"
import { ActionColumn } from "@/dev/columns"
import { TravelBenefitSectionColumns } from "@/dev/columns/admin/travel-benefit-section"
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
import { CreateTravelBenefitSectionModal } from "./modals/create"
import { EditTravelBenefitSectionModal } from "./modals/edit"

/**
 * Travel Benefit Section admin list (Cover Types shell).
 * API: GET/POST travel/benefit-section, PATCH/DELETE …/{id}, PATCH …/{id}/status
 */
export function TravelBenefitSectionPage() {
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
    url: "travel/benefit-section",
    params: {
      page: filter.page,
      per_page: filter.pageSize,
      term: filter.term,
    },
    queryOptions: {
      enabled: true,
    },
  })

  const deleteMutation = UseApiMutation<SubmitResponse, { id: number | string }>(
    {
      url: ({ id }) => `travel/benefit-section/${id}`,
      method: EMETHODS.DELETE,
      mutationOptions: {
        onSuccess: (response) => {
          ShowToast.success(response?.message || "Section deleted successfully")
          refetch()
        },
        onError: (error) => {
          ShowToast.error(extractErrorMessage(error))
        },
      },
    }
  )

  const toggleStatusMutation = UseApiMutation<
    SubmitResponse,
    { id: number | string; is_active: boolean }
  >({
    url: ({ id }) => `travel/benefit-section/${id}/status`,
    method: EMETHODS.PATCH,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response?.message || "Section status updated")
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
          Component: EditTravelBenefitSectionModal,
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
        title="Benefit Sections"
        description="Manage travel benefit sections used to group product benefits"
        actions={[
          {
            icon: Plus,
            label: "Add Section",
            variant: "default",
            onClick: () => {
              handleDialogContextSwitch({
                componentProps: { refetch },
                Component: CreateTravelBenefitSectionModal,
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
              ...TravelBenefitSectionColumns,
              ActionColumn({ ActionsHandlerMapping }),
            ],
            OtherTools: SearchTools,
            data: data?.data ?? [],
            pageCount: data?.pagination?.last_page ?? 1,
            title: "Benefit Sections",
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
        className="sm:max-w-fit w-[95vw] sm:w-auto p-4 sm:p-6">
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
