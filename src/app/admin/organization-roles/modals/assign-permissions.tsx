/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardFooter } from "@/components/ui/card"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button, ReusableCheckboxGrid } from "@/dev/core"
import { UseApiMutation, UseApiQuery } from "@/hooks/hooks"
import type { RbacPermission } from "@/types/rbac-roles"
import { SubmitResponse } from "@/types/types"
import { EMETHODS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { useEffect, useMemo, useState } from "react"

import {
  buildRolePermissionsParams,
  extractInitialSelectedPermissionIds,
  extractPaginationFromResponse,
  extractPermissionsFromResponse,
  extractRolesFromResponse,
  getRoleId,
  getRoleIsEditable,
  getRoleLabel,
  groupPermissionsByModule,
  mergePermissionsById,
  normalizeModuleKeys,
} from "../role-utils"

type PermissionsPagination = {
  current_page?: number
  last_page?: number
  per_page?: number
  total?: number
}

export const AssignPermissionsModal = ({
  handleDialogContextSwitch,
  componentProps,
}: {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: {
    data?: Record<string, any>
    organizationLocationId?: number | string
    rolesBasePath?: string
    refetch?: () => Promise<any>
    readOnly?: boolean
  }
}) => {
  const role = componentProps?.data ?? {}
  const roleId = getRoleId(role)
  const rolesBasePath = componentProps?.rolesBasePath ?? "roles"
  const organizationLocationId = componentProps?.organizationLocationId
  const isReadOnly = componentProps?.readOnly ?? !getRoleIsEditable(role)
  const isScopedRole = rolesBasePath === "roles"

  const { data: roleListData, isLoading: isLoadingRole, refetch: refetchRole } =
    UseApiQuery<SubmitResponse>({
      url: isScopedRole ? "roles" : `${rolesBasePath}/${roleId}`,
      params: isScopedRole
        ? {
            role_id: roleId,
            organization_location_id: organizationLocationId,
          }
        : undefined,
      queryOptions: {
        enabled: Boolean(roleId) && (isScopedRole ? Boolean(organizationLocationId) : true),
      },
    })

  const resolvedRole = useMemo(() => {
    if (isScopedRole) {
      const fromApi = extractRolesFromResponse(roleListData)[0]
      return fromApi ?? role
    }
    const payload = (roleListData as any)?.data?.role ?? (roleListData as any)?.data
    return payload ?? role
  }, [roleListData, role, isScopedRole])

  const roleModules = normalizeModuleKeys(
    Array.isArray(resolvedRole?.modules) ? resolvedRole.modules : []
  )
  const modulesCsv = roleModules.join(",")

  const [page, setPage] = useState(1)
  const [accumulatedPermissions, setAccumulatedPermissions] = useState<RbacPermission[]>([])
  const [pagination, setPagination] = useState<PermissionsPagination | null>(null)
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([])

  const permissionsEnabled =
    Boolean(roleId) &&
    (isScopedRole ? Boolean(organizationLocationId) : true) &&
    Boolean(modulesCsv) &&
    !isLoadingRole

  const { data: permissionsData, isLoading: isLoadingPermissions, refetch: refetchPermissions } =
    UseApiQuery<SubmitResponse>({
      url: `permissions/${roleId}`,
      params: buildRolePermissionsParams({
        organizationLocationId,
        modules: modulesCsv,
        page,
      }),
      queryOptions: {
        enabled: permissionsEnabled,
      },
    })

  // Reset paging when role or modules change
  useEffect(() => {
    setPage(1)
    setAccumulatedPermissions([])
    setPagination(null)
    setSelectedPermissionIds([])
  }, [roleId, organizationLocationId, modulesCsv])

  // Merge each fetched page into accumulated list and sync selections
  useEffect(() => {
    if (!permissionsData) return

    const batch = extractPermissionsFromResponse(permissionsData)
    const nextPagination = extractPaginationFromResponse(permissionsData)
    const syncedIds = extractInitialSelectedPermissionIds(batch)

    setPagination(nextPagination)
    setAccumulatedPermissions((current) => (page === 1 ? batch : mergePermissionsById(current, batch)))
    setSelectedPermissionIds((current) => {
      if (page === 1) return syncedIds
      return Array.from(new Set([...current, ...syncedIds]))
    })
  }, [permissionsData, page])

  const permissionGroups = useMemo(
    () => groupPermissionsByModule(accumulatedPermissions),
    [accumulatedPermissions]
  )

  const saveMutation = UseApiMutation<SubmitResponse, { permission_ids: number[] }>({
    url: `${rolesBasePath}/${roleId}/permissions`,
    method: EMETHODS.POST,
    invalidateQueries: roleId ? [`permissions/${roleId}`, rolesBasePath] : [rolesBasePath],
    mutationOptions: {
      onSuccess: async (response) => {
        ShowToast.success(response?.message || "Permissions assigned successfully")
        setPage(1)
        setAccumulatedPermissions([])
        setPagination(null)
        await Promise.all([
          refetchPermissions(),
          refetchRole(),
          componentProps?.refetch?.(),
        ])
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const togglePermission = (permissionId: number, checked: boolean) => {
    setSelectedPermissionIds((current) => {
      if (checked) {
        return current.includes(permissionId) ? current : [...current, permissionId]
      }
      return current.filter((id) => id !== permissionId)
    })
  }

  const handleSave = () => {
    if (!roleId) {
      ShowToast.error("Unable to assign permissions: missing role id")
      return
    }

    saveMutation.mutate({ permission_ids: selectedPermissionIds })
  }

  const handleLoadMore = () => {
    setPage((currentPage) => currentPage + 1)
  }

  const isInitialLoading = isLoadingRole || (isLoadingPermissions && page === 1)
  const isLoadingMore = isLoadingPermissions && page > 1
  const hasMore =
    pagination != null &&
    (pagination.current_page ?? page) < (pagination.last_page ?? 1)
  const totalCount = pagination?.total ?? accumulatedPermissions.length

  return (
    <div className="w-full min-w-[600px] max-w-[900px] p-6 space-y-6">
      <div className="border-b pb-3">
        <DialogTitle className="text-xl font-semibold">
          {isReadOnly ? "View Permissions" : "Assign Permissions"}
        </DialogTitle>
        <DialogDescription className="mt-1">
          {isReadOnly
            ? `Viewing permissions for role "${getRoleLabel(resolvedRole ?? role, rolesBasePath)}" (read-only).`
            : `Select permissions for role "${getRoleLabel(resolvedRole ?? role, rolesBasePath)}".`}
        </DialogDescription>
      </div>

      {!roleId ? (
        <div className="text-sm text-destructive">Unable to assign permissions: missing role id.</div>
      ) : isScopedRole && !organizationLocationId ? (
        <div className="text-sm text-destructive">
          Unable to assign permissions: missing organization location.
        </div>
      ) : !modulesCsv ? (
        <div className="text-sm text-destructive">
          This role has no modules. Edit the role and add modules first.
        </div>
      ) : isInitialLoading ? (
        <div className="text-sm text-muted-foreground">Loading permissions...</div>
      ) : accumulatedPermissions.length === 0 ? (
        <div className="text-sm text-muted-foreground">No permissions found for this role&apos;s modules.</div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Showing {accumulatedPermissions.length} of {totalCount} permissions
          </p>

          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            {permissionGroups.map(([moduleKey, modulePermissions]) => (
              <div key={moduleKey} className="space-y-3">
                <h3 className="text-sm font-semibold capitalize">{moduleKey}</h3>
                <ReusableCheckboxGrid
                  name={`permissions-${moduleKey}`}
                  columns={2}
                  options={modulePermissions.map((permission) => ({
                    id: String(permission.id),
                    name: permission.description || permission.name,
                    checked: selectedPermissionIds.includes(permission.id),
                    disabled: isReadOnly,
                    onChange: isReadOnly
                      ? undefined
                      : (checked) => togglePermission(permission.id, checked),
                  }))}
                />
              </div>
            ))}
          </div>

          {hasMore && (
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-full"
              disabled={isLoadingMore}
              loading={isLoadingMore}
              onClick={handleLoadMore}
            >
              {isLoadingMore
                ? "Loading more..."
                : `Load more (${accumulatedPermissions.length} of ${totalCount})`}
            </Button>
          )}
        </div>
      )}

      <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 mt-2 px-0">
        <Button
          type="button"
          className="w-full sm:w-auto rounded-full border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
          onClick={() => handleDialogContextSwitch({})}
        >
          {isReadOnly ? "Close" : "Cancel"}
        </Button>

        {!isReadOnly && (
          <Button
            type="button"
            className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-full hover:bg-[#C20C0C]"
            disabled={!roleId || !modulesCsv || saveMutation.isPending}
            loading={saveMutation.isPending}
            onClick={handleSave}
          >
            Save Permissions
          </Button>
        )}
      </CardFooter>
    </div>
  )
}

export default AssignPermissionsModal
