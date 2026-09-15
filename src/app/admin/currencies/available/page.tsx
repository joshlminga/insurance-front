/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCan } from "@/auth/useCan"
import { MODULES } from "@/auth/module-keys"
import { PageHeader } from "@/components/shared"
import { ActionColumn } from "@/dev/columns"
import {
  CurrenciesAvailableColumns,
  type CurrencyRow,
} from "@/dev/columns/admin/currencies/available"
import { CustomDialogComponent } from "@/dev/core"
import { CustomBaseTable, SearchTools } from "@/dev/table"
import { useCustomDialogContextFactory, useDebounce } from "@/hooks"
import { UseApiMutation, UseApiQuery } from "@/hooks/hooks"
import type {
  SingleActionsHandler,
  SubmitResponse,
  TFilterOptions,
  TPaginationFilters,
} from "@/types/types"
import {
  EMETHODS,
  FILTEROPTIONS,
  ReusableReducer,
} from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { Plus } from "lucide-react"
import { useReducer } from "react"
import { CreateCurrencyModal } from "./modals/create"
import { EditCurrencyModal } from "./modals/edit"
import { ViewCurrencyModal } from "./modals/view"

function isCurrencyActive(row: CurrencyRow) {
  if (typeof row.is_active === "boolean") return row.is_active
  return row.status === "Active"
}

export function CurrenciesAvailablePage() {
  const { canModuleAction } = useCan()
  const canCreate = canModuleAction(MODULES.ATU_MULTICURRENCY_CURRENCY, "create")
  const canRead = canModuleAction(MODULES.ATU_MULTICURRENCY_CURRENCY, "read")
  const canUpdate = canModuleAction(MODULES.ATU_MULTICURRENCY_CURRENCY, "update")
  const canDelete = canModuleAction(MODULES.ATU_MULTICURRENCY_CURRENCY, "delete")
  const canAction = canModuleAction(MODULES.ATU_MULTICURRENCY_CURRENCY, "action")
  const canAdvance = canModuleAction(MODULES.ATU_MULTICURRENCY_CURRENCY, "advance")

  const [filter, optionsDispatcher] = useReducer(
    ReusableReducer<TPaginationFilters & TFilterOptions>,
    { ...FILTEROPTIONS, page: 1, pageSize: 10 },
  )
  const optionsDispatcherDebounce = useDebounce({
    debounceCallback: optionsDispatcher,
  })

  const { handleDialogContextSwitch, dialogContent, dialogOpen } =
    useCustomDialogContextFactory<{
      refetch?: () => Promise<any>
      data?: CurrencyRow
    }>()

  const { data, isLoading, refetch, isError } = UseApiQuery<SubmitResponse>({
    url: "atu/multicurrency/currencies",
    params: {
      page: filter.page,
      per_page: filter.pageSize,
      search: filter.term || undefined,
    },
  })

  const setDefaultMutation = UseApiMutation<
    SubmitResponse,
    { id: number | string }
  >({
    url: ({ id }) => `atu/multicurrency/currencies/${id}/default`,
    method: EMETHODS.PATCH,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response?.message || "Default currency updated")
        refetch()
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const statusMutation = UseApiMutation<
    SubmitResponse,
    { id: number | string; is_active: boolean }
  >({
    url: ({ id }) => `atu/multicurrency/currencies/${id}/status`,
    method: EMETHODS.PATCH,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response?.message || "Currency status updated")
        refetch()
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const deleteMutation = UseApiMutation<
    SubmitResponse,
    { id: number | string }
  >({
    url: ({ id }) => `atu/multicurrency/currencies/${id}`,
    method: EMETHODS.DELETE,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response?.message || "Currency deleted")
        refetch()
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const ActionsHandlerMapping: SingleActionsHandler<CurrencyRow>[] = [
    {
      label: "View",
      onSelect: (row) => {
        handleDialogContextSwitch({
          componentProps: { data: row, refetch },
          Component: ViewCurrencyModal,
        })
      },
      conditional: () => canRead,
    },
    {
      label: "Edit",
      onSelect: (row) => {
        handleDialogContextSwitch({
          componentProps: { data: row, refetch },
          Component: EditCurrencyModal,
        })
      },
      conditional: () => canUpdate,
    },
    {
      label: "Deactivate",
      onSelect: (row) =>
        statusMutation.mutate({ id: row.id, is_active: false }),
      conditional: (row) =>
        canAction && isCurrencyActive(row) && !row.is_default,
    },
    {
      label: "Activate",
      onSelect: (row) =>
        statusMutation.mutate({ id: row.id, is_active: true }),
      conditional: (row) => canAction && !isCurrencyActive(row),
    },
    {
      label: "Set as Default",
      onSelect: (row) => setDefaultMutation.mutate({ id: row.id }),
      conditional: (row) =>
        canAdvance && !row.is_default && isCurrencyActive(row),
    },
    {
      label: "Delete",
      onSelect: (row) => deleteMutation.mutate({ id: row.id }),
      conditional: (row) => canDelete && !row.is_default,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Available Currencies"
        description="Manage exchange currencies, rates, and the system default."
        actions={
          canCreate
            ? [
                {
                  icon: Plus,
                  label: "Add New Currency",
                  variant: "default" as const,
                  onClick: () => {
                    handleDialogContextSwitch({
                      componentProps: { refetch },
                      Component: CreateCurrencyModal,
                    })
                  },
                },
              ]
            : undefined
        }
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
              onChange: (searchTerm: any) =>
                optionsDispatcherDebounce({
                  payload: { term: searchTerm },
                  type: "term",
                }),
              placeholder: "Search currencies",
              includeFilter: true,
            },
            columns: [
              ...CurrenciesAvailableColumns,
              ActionColumn({ ActionsHandlerMapping }),
            ],
            OtherTools: SearchTools,
            data: data?.data ?? [],
            pageCount: data?.pagination?.last_page ?? 1,
            title: "Currencies",
            showPagination: true,
            setPageSize: (pageSize) =>
              optionsDispatcher({
                payload: { pageSize },
                type: "pageSize",
              }),
            pageSize: data?.pagination?.per_page ?? filter.pageSize,
            page: data?.pagination?.current_page ?? filter.page,
            isLoading,
            isError,
          }}
        />
      </div>

      <CustomDialogComponent
        {...{ handleDialogContextSwitch, dialogOpen }}
        className="sm:max-w-fit w-[95vw] sm:w-auto p-4 sm:p-6"
      >
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

export default CurrenciesAvailablePage
