/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAbilities } from "@/auth/useAbilities"
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
import { Button, buttonVariants } from "@/components/ui/button"
import { ActionColumn } from "@/dev/columns"
import { OrganizationMembersColumns } from "@/dev/columns/admin/users"
import { CustomDialogComponent } from "@/dev/core"
import { CustomBaseTable, SearchTools } from "@/dev/table"
import { useCustomDialogContextFactory, useDebounce } from "@/hooks"
import { UseApiMutation, UseApiQuery } from "@/hooks/hooks"
import { SingleActionsHandler, SubmitResponse, TFilterOptions, TPaginationFilters } from "@/types/types"
import { EMETHODS, FILTEROPTIONS, ReusableReducer } from "@/utils/constatnts"
import { EROUTES } from "@/utils/enums"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { ArrowLeft, Plus } from "lucide-react"
import { useMemo, useReducer, useState } from "react"
import { Link, useParams } from "react-router-dom"

import {
  extractMembersFromResponse,
  getMemberIsActive,
  getMemberLabel,
  getMemberUserId,
} from "../member-utils"
import CreateMemberModal from "../modals/create"
import EditMemberModal from "../modals/edit"
import ViewMemberModal from "../modals/view"

/**
 * Members table for one organization location.
 * Lists staff users and offers Add / View / Edit / Suspend / UnSuspend / Delete,
 * each action gated by the matching `organization-location-user.*` permission.
 */
const OrganizationMembersDetailPage = () => {
  const { orgLocationId } = useParams<{ orgLocationId: string }>()
  const { can } = useAbilities()

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
      organizationLocationId?: number | string
    }>()

  // Location details for the page header
  const { data: orgLocationData } = UseApiQuery<SubmitResponse>({
    url: `organization-location/${orgLocationId}`,
    queryOptions: {
      enabled: Boolean(orgLocationId),
    },
  })

  const organizationLocation = useMemo(() => {
    const payload = (orgLocationData as any)?.data
    return payload?.location ?? payload ?? {}
  }, [orgLocationData])

  const organizationName =
    organizationLocation?.organization_name ??
    organizationLocation?.organization?.name ??
    "Organization"

  const countryName = organizationLocation?.country?.name ?? ""
  const orgLocationDisplayName = [organizationName, countryName].filter(Boolean).join(" ")

  // Members list — organization_location_id is required by the API
  const { data, isLoading, refetch, isError } = UseApiQuery<SubmitResponse>({
    url: "organization-location-user",
    params: {
      organization_location_id: orgLocationId,
      page: filter.page,
      per_page: filter.pageSize,
      term: filter.term,
    },
    queryOptions: {
      enabled: Boolean(orgLocationId),
    },
  })

  const deleteMemberMutation = UseApiMutation<SubmitResponse, { id: number | string }>({
    url: ({ id }) =>
      `organization-location-user/${id}?organization_location_id=${orgLocationId}`,
    method: EMETHODS.DELETE,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response?.message || "Member deleted successfully")
        refetch()
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  // Suspend = is_active: false, UnSuspend = is_active: true
  const toggleMemberStatusMutation = UseApiMutation<
    SubmitResponse,
    { id: number | string; is_active: boolean }
  >({
    url: ({ id }) =>
      `organization-location-user/${id}/status?organization_location_id=${orgLocationId}`,
    method: EMETHODS.PATCH,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response?.message || "Member status updated successfully")
        refetch()
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const ActionsHandlerMapping: SingleActionsHandler<any>[] = [
    {
      label: "View",
      onSelect: (rowData) => {
        handleDialogContextSwitch({
          componentProps: {
            data: rowData,
            organizationLocationId: orgLocationId,
          },
          Component: ViewMemberModal,
        })
      },
      conditional: (rowData) =>
        Boolean(getMemberUserId(rowData)) && can("organization-location-user.read"),
    },
    {
      label: "Edit",
      onSelect: (rowData) => {
        handleDialogContextSwitch({
          componentProps: {
            data: rowData,
            organizationLocationId: orgLocationId,
            refetch,
          },
          Component: EditMemberModal,
        })
      },
      conditional: (rowData) =>
        Boolean(getMemberUserId(rowData)) && can("organization-location-user.update"),
    },
    {
      label: "Suspend",
      onSelect: (rowData) => {
        const id = getMemberUserId(rowData)
        if (!id) return
        toggleMemberStatusMutation.mutate({ id, is_active: false })
      },
      conditional: (rowData) =>
        Boolean(getMemberUserId(rowData)) &&
        getMemberIsActive(rowData) &&
        can("organization-location-user.action"),
    },
    {
      label: "UnSuspend",
      onSelect: (rowData) => {
        const id = getMemberUserId(rowData)
        if (!id) return
        toggleMemberStatusMutation.mutate({ id, is_active: true })
      },
      conditional: (rowData) =>
        Boolean(getMemberUserId(rowData)) &&
        !getMemberIsActive(rowData) &&
        can("organization-location-user.action"),
    },
    {
      label: "Delete",
      onSelect: (rowData) => {
        const id = getMemberUserId(rowData)
        if (!id) return
        setDeleteTarget({
          id,
          label: getMemberLabel(rowData),
        })
      },
      conditional: (rowData) =>
        Boolean(getMemberUserId(rowData)) && can("organization-location-user.delete"),
    },
  ]

  const tableData = extractMembersFromResponse(data)

  return (
    <div>
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
          <Link to={EROUTES.ORGANIZATION_MEMBERS}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Organizations
          </Link>
        </Button>
      </div>

      <PageHeader
        title={`Members — ${orgLocationDisplayName}`}
        description="Manage staff members for this organization"
        actions={
          can("organization-location-user.create")
            ? [
                {
                  icon: Plus,
                  label: "Add New Member",
                  variant: "default",
                  onClick: () => {
                    handleDialogContextSwitch({
                      componentProps: {
                        organizationLocationId: orgLocationId,
                        refetch,
                      },
                      Component: CreateMemberModal,
                    })
                  },
                },
              ]
            : []
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
              onChange: (term: any) =>
                optionsDispatcherDebounce({
                  payload: { term },
                  type: "term",
                }),
              placeholder: "Search members",
              includeFilter: true,
            },
            columns: [
              ...OrganizationMembersColumns,
              ActionColumn({ ActionsHandlerMapping }),
            ],
            OtherTools: SearchTools,
            data: tableData,
            pageCount:
              (data as any)?.data?.pagination?.last_page ??
              (data as any)?.pagination?.last_page ??
              1,
            title: "Organization Members",
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

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete member?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. You are about to delete &quot;
              {deleteTarget?.label}&quot;. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              disabled={deleteMemberMutation.isPending}
              onClick={() => {
                if (!deleteTarget) return
                deleteMemberMutation.mutate({ id: deleteTarget.id })
                setDeleteTarget(null)
              }}
            >
              {deleteMemberMutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default OrganizationMembersDetailPage
