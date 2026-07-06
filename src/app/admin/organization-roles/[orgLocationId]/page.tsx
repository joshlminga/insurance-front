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
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button"
import { ActionColumn } from "@/dev/columns"
import {
  OrganizationRolesColumns,
  RoleModulesExpandedContent,
} from "@/dev/columns/admin/organization-roles"
import { CustomDialogComponent } from "@/dev/core"
import { CustomBaseTable, SearchTools } from "@/dev/table"
import { useCustomDialogContextFactory, useDebounce } from "@/hooks"
import { UseApiMutation, UseApiQuery } from "@/hooks/hooks"
import { SingleActionsHandler, SubmitResponse, TFilterOptions, TPaginationFilters } from "@/types/types"
import { FILTEROPTIONS, ReusableReducer } from "@/utils/constatnts"
import { EMETHODS } from "@/utils/constatnts"
import { EROUTES } from "@/utils/enums"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { ArrowLeft, Plus } from "lucide-react"
import { useMemo, useReducer, useState } from "react"
import { Link, useParams } from "react-router-dom"

import {
  extractRolesFromResponse,
  getRoleId,
  getRoleIsActive,
  getRoleIsEditable,
  getRoleLabel,
} from "../role-utils"
import AssignPermissionsModal from "../modals/assign-permissions"
import CreateRoleModal from "../modals/create"
import EditRoleModal from "../modals/edit"
import ViewRoleModal from "../modals/view"

const OrganizationRolesDetailPage = () => {
  const { orgLocationId } = useParams<{ orgLocationId: string }>()

  const [expandedRoleId, setExpandedRoleId] = useState<string | number | null>(null)

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
      orgId?: number | string
      organizationLocationId?: number | string
    }>()

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

  const orgId =
    organizationLocation?.organization_id ??
    organizationLocation?.organization?.id ??
    organizationLocation?.org_id

  const organizationName =
    organizationLocation?.organization_name ??
    organizationLocation?.organization?.name ??
    "Organization"

  const countryName = organizationLocation?.country?.name ?? ""
  const orgLocationDisplayName = [organizationName, countryName].filter(Boolean).join(" ")

  const { data, isLoading, refetch, isError } = UseApiQuery<SubmitResponse>({
    url: "roles",
    params: {
      organization_location_id: orgLocationId,
      page: filter.page,
      pageSize: filter.pageSize,
      term: filter.term,
    },
    queryOptions: {
      enabled: Boolean(orgLocationId),
    },
  })

  const deleteRoleMutation = UseApiMutation<SubmitResponse, { id: number | string }>({
    url: ({ id }) => `roles/${id}`,
    method: EMETHODS.DELETE,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response?.message || "Role deleted successfully")
        refetch()
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const toggleRoleStatusMutation = UseApiMutation<
    SubmitResponse,
    { id: number | string; is_active: boolean }
  >({
    url: ({ id }) => `roles/${id}/status`,
    method: EMETHODS.PATCH,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response?.message || "Role status updated successfully")
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
          componentProps: { data: rowData },
          Component: ViewRoleModal,
        })
      },
      conditional: (rowData) => Boolean(getRoleId(rowData)),
    },
    {
      label: "Edit",
      onSelect: (rowData) => {
        handleDialogContextSwitch({
          componentProps: {
            data: rowData,
            orgId,
            organizationLocationId: orgLocationId,
            refetch,
          },
          Component: EditRoleModal,
        })
      },
      conditional: (rowData) =>
        Boolean(getRoleId(rowData)) && getRoleIsEditable(rowData),
    },
    {
      label: "Permission",
      onSelect: (rowData) => {
        handleDialogContextSwitch({
          componentProps: {
            data: rowData,
            organizationLocationId: orgLocationId,
            refetch,
            readOnly: !getRoleIsEditable(rowData),
          },
          Component: AssignPermissionsModal,
        })
      },
      conditional: (rowData) => Boolean(getRoleId(rowData)),
    },
    {
      label: "Delete",
      onSelect: (rowData) => {
        const id = getRoleId(rowData)
        if (!id) return
        setDeleteTarget({
          id,
          label: getRoleLabel(rowData, "roles"),
        })
      },
      conditional: (rowData) =>
        Boolean(getRoleId(rowData)) && getRoleIsEditable(rowData),
    },
    {
      label: "Deactivate",
      onSelect: (rowData) => {
        const id = getRoleId(rowData)
        if (!id) return
        toggleRoleStatusMutation.mutate({ id, is_active: false })
      },
      conditional: (rowData) =>
        Boolean(getRoleId(rowData)) &&
        getRoleIsEditable(rowData) &&
        Boolean(getRoleIsActive(rowData)),
    },
    {
      label: "Activate",
      onSelect: (rowData) => {
        const id = getRoleId(rowData)
        if (!id) return
        toggleRoleStatusMutation.mutate({ id, is_active: true })
      },
      conditional: (rowData) =>
        Boolean(getRoleId(rowData)) &&
        getRoleIsEditable(rowData) &&
        !Boolean(getRoleIsActive(rowData)),
    },
  ]

  const tableData = extractRolesFromResponse(data)

  const handleToggleExpand = (roleId: string | number) => {
    setExpandedRoleId((current) => (current === roleId ? null : roleId))
  }

  return (
    <div>
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
          <Link to={EROUTES.ORGANIZATION_ROLES}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Organizations
          </Link>
        </Button>
      </div>

      <PageHeader
        title={`Roles — ${orgLocationDisplayName}`}
        description="Manage roles and permissions for this organization"
        actions={[
          {
            icon: Plus,
            label: "Create Role",
            variant: "default",
            onClick: () => {
              handleDialogContextSwitch({
                componentProps: {
                  orgId,
                  organizationLocationId: orgLocationId,
                  refetch,
                },
                Component: CreateRoleModal,
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
              placeholder: "Search roles",
              includeFilter: true,
            },
            columns: [
              ...OrganizationRolesColumns,
              ActionColumn({ ActionsHandlerMapping }),
            ],
            OtherTools: SearchTools,
            data: tableData,
            pageCount:
              (data as any)?.data?.pagination?.last_page ??
              (data as any)?.pagination?.last_page ??
              1,
            title: "Organization Roles",
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
            rolesBasePath: "roles",
            expandedRowId: expandedRoleId,
            getRowId: (row: any) => getRoleId(row) ?? null,
            canExpandRow: (row: any) =>
              Array.isArray(row?.modules) && row.modules.length > 0 && Boolean(getRoleId(row)),
            onToggleExpand: handleToggleExpand,
            renderExpandedRow: (row) => (
              <RoleModulesExpandedContent
                modules={
                  Array.isArray((row.original as any)?.modules)
                    ? (row.original as any).modules
                    : []
                }
              />
            ),
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
            <AlertDialogTitle>Delete role?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. You are about to delete &quot;
              {deleteTarget?.label}&quot;. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              disabled={deleteRoleMutation.isPending}
              onClick={() => {
                if (!deleteTarget) return
                deleteRoleMutation.mutate({ id: deleteTarget.id })
                setDeleteTarget(null)
              }}
            >
              {deleteRoleMutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default OrganizationRolesDetailPage
