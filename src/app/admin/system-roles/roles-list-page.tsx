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
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { Plus } from "lucide-react"
import { useReducer, useState } from "react"

import AssignPermissionsModal from "../organization-roles/modals/assign-permissions"
import CreateRoleModal from "../organization-roles/modals/create"
import EditRoleModal from "../organization-roles/modals/edit"
import ViewRoleModal from "../organization-roles/modals/view"
import {
  extractRolesFromResponse,
  getRoleId,
  getRoleIsActive,
  getRoleIsEditable,
} from "../organization-roles/role-utils"

type RolesListPageProps = {
  rolesBasePath: "global-roles" | "system-roles"
  title: string
  description: string
  tableTitle: string
}

/** Shared list page for global (template) and system (admin) roles */
export const RolesListPage = ({
  rolesBasePath,
  title,
  description,
  tableTitle,
}: RolesListPageProps) => {
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
      rolesBasePath?: string
    }>()

  const { data, isLoading, refetch, isError } = UseApiQuery<SubmitResponse>({
    url: rolesBasePath,
    params: {
      page: filter.page,
      pageSize: filter.pageSize,
      term: filter.term,
    },
    queryOptions: {
      enabled: true,
    },
  })

  const deleteRoleMutation = UseApiMutation<SubmitResponse, { id: number | string }>({
    url: ({ id }) => `${rolesBasePath}/${id}`,
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
    url: ({ id }) => `${rolesBasePath}/${id}/status`,
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
          componentProps: { data: rowData, rolesBasePath },
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
            rolesBasePath,
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
            rolesBasePath,
            refetch,
          },
          Component: AssignPermissionsModal,
        })
      },
      conditional: (rowData) =>
        Boolean(getRoleId(rowData)) && getRoleIsEditable(rowData),
    },
    {
      label: "View Permissions",
      onSelect: (rowData) => {
        handleDialogContextSwitch({
          componentProps: {
            data: rowData,
            rolesBasePath,
            refetch,
            readOnly: true,
          },
          Component: AssignPermissionsModal,
        })
      },
      conditional: (rowData) =>
        Boolean(getRoleId(rowData)) && !getRoleIsEditable(rowData),
    },
    {
      label: "Delete",
      onSelect: (rowData) => {
        const id = getRoleId(rowData)
        if (!id) return
        setDeleteTarget({
          id,
          label: rowData?.name ?? "this role",
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
        Boolean(getRoleIsActive(rowData)) &&
        getRoleIsEditable(rowData),
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
        !Boolean(getRoleIsActive(rowData)) &&
        getRoleIsEditable(rowData),
    },
  ]

  const tableData = extractRolesFromResponse(data)

  const handleToggleExpand = (roleId: string | number) => {
    setExpandedRoleId((current) => (current === roleId ? null : roleId))
  }

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={[
          {
            icon: Plus,
            label: "Create Role",
            variant: "default",
            onClick: () => {
              handleDialogContextSwitch({
                componentProps: {
                  rolesBasePath,
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
            title: tableTitle,
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

export default RolesListPage
