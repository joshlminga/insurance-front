/* eslint-disable no-extra-boolean-cast */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from "@/components/shared"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { buttonVariants } from "@/components/ui/button"
import { ActionColumn } from "@/dev/columns"
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
import { FILTEROPTIONS, ReusableReducer } from "@/utils/constatnts"
import { EMETHODS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { Plus } from "lucide-react"
import { useReducer, useState } from "react"

import { OrganizationLocationColumns } from "@/dev/columns/admin/organization-location"
import CreateOrganizationLocationModal from "./modals/create"
import ViewOrganizationLocationModal from "./modals/view"
import EditOrganizationLocationModal from "./modals/edit"

const OrganizationLocationPage = () => {
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number | string
    label: string
  } | null>(null)

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
    url: "organization-location",
    params: {
      page: filter.page,
      pageSize: filter.pageSize,
      term: filter.term,
    },
    queryOptions: {
      enabled: true,
    },
  })

  const deleteLocationMutation = UseApiMutation<
    SubmitResponse,
    { id: number | string }
  >({
    url: ({ id }) => `organization-location/${id}`,
    method: EMETHODS.DELETE,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(
          response?.message || "Organization location deleted successfully"
        )
        refetch()
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const toggleLocationStatusMutation = UseApiMutation<
    SubmitResponse,
    { id: number | string; is_active: boolean }
  >({
    url: ({ id }) => `organization-location/${id}/status`,
    method: EMETHODS.PATCH,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(
          response?.message || "Organization location status updated successfully"
        )
        refetch()
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const setDefaultLocationMutation = UseApiMutation<
    SubmitResponse,
    { id: number | string; override: true }
  >({
    url: ({ id }) => `organization-location/${id}/default`,
    method: EMETHODS.PATCH,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(
          response?.message ||
            "Organization location default updated successfully"
        )
        refetch()
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const getRowId = (rowData: any) =>
    rowData?.organization_location_id ??
    rowData?.organizationLocationId ??
    rowData?.id

  const getIsActive = (rowData: any) =>
    typeof rowData?.is_active === "boolean"
      ? rowData.is_active
      : Boolean(rowData?.is_active)

  const ActionsHandlerMapping: SingleActionsHandler<any>[] = [
    {
      label: "View",
      onSelect: (rowData) => {
        handleDialogContextSwitch({
          componentProps: { data: rowData, refetch },
          Component: ViewOrganizationLocationModal,
        })
      },
      conditional: (rowData) => Boolean(getRowId(rowData)),
    },
    {
      label: "Edit",
      onSelect: (rowData) => {
        handleDialogContextSwitch({
          componentProps: { data: rowData, refetch },
          Component: EditOrganizationLocationModal,
        })
      },
      conditional: (rowData) => Boolean(getRowId(rowData)),
    },
    {
      label: "Set Default",
      onSelect: (rowData) => {
        const id = getRowId(rowData)
        if (!id) return
        setDefaultLocationMutation.mutate({ id, override: true })
      },
      conditional: (rowData) => Boolean(getRowId(rowData)),
    },
    {
      label: "Delete",
      onSelect: (rowData) => {
        const id = getRowId(rowData)
        if (!id) return
        const orgName =
          rowData?.organization_name ??
          rowData?.organization?.name ??
          "this location"
        const country =
          rowData?.country?.name ?? rowData?.country_name ?? null
        const label = country ? `${orgName} (${country})` : orgName
        setDeleteTarget({ id, label })
      },
      conditional: (rowData) => Boolean(getRowId(rowData)),
    },
    {
      label: "Deactivate",
      onSelect: (rowData) => {
        const id = getRowId(rowData)
        if (!id) return
        toggleLocationStatusMutation.mutate({
          id,
          is_active: false,
        })
      },
      conditional: (rowData) => Boolean(getRowId(rowData)) && Boolean(getIsActive(rowData)),
    },
    {
      label: "Activate",
      onSelect: (rowData) => {
        const id = getRowId(rowData)
        if (!id) return
        toggleLocationStatusMutation.mutate({
          id,
          is_active: true,
        })
      },
      conditional: (rowData) => Boolean(getRowId(rowData)) && !Boolean(getIsActive(rowData)),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Organization Location"
        description="Manage organization locations, their countries, defaults, and status"
        actions={[
          {
            icon: Plus,
            label: "Add Organization Location",
            variant: "default",
            onClick: () => {
              handleDialogContextSwitch({
                componentProps: { refetch },
                Component: CreateOrganizationLocationModal,
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
                  payload: { term },
                  type: "term",
                }),
              placeholder: "Search",
              includeFilter: true,
            },
            columns: [
              ...OrganizationLocationColumns,
              ActionColumn({ ActionsHandlerMapping }),
            ],
            OtherTools: SearchTools,
            data:
              (data as any)?.data?.organization_locations ??
              (data as any)?.data?.organization_location ??
              (data as any)?.data?.data ??
              (data as any)?.data ??
              [],
            pageCount:
              (data as any)?.data?.pagination?.last_page ??
              (data as any)?.pagination?.last_page ??
              1,
            title: "Organization Location",
            showPagination: true,
            setPageSize: (pageSize) =>
              optionsDispatcher({
                payload: { pageSize },
                type: "pageSize",
              }),
            pageSize:
              (data as any)?.data?.pagination?.per_page ??
              (data as any)?.pagination?.per_page ??
              10,
            page:
              (data as any)?.data?.pagination?.current_page ??
              (data as any)?.pagination?.current_page ??
              1,
            isLoading,
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

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete organization location?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. You are about to delete the
              location for &quot;{deleteTarget?.label}&quot;. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              disabled={deleteLocationMutation.isPending}
              onClick={() => {
                if (!deleteTarget) return
                deleteLocationMutation.mutate({ id: deleteTarget.id })
              }}
            >
              {deleteLocationMutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default OrganizationLocationPage

