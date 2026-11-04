/* eslint-disable @typescript-eslint/no-explicit-any */
import { isPlatformSuperAdmin } from "@/auth/org-context"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button, ReusableCheckboxGrid } from "@/dev/core"
import { UseApiMutation, UseApiQuery } from "@/hooks/hooks"
import { useAuthStore } from "@/stores/auth-store"
import type { RbacModulesCatalogData } from "@/types/rbac-modules"
import type { RbacPermission } from "@/types/rbac-roles"
import { SubmitResponse } from "@/types/types"
import { EMETHODS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import {
  buildRolePermissionsParams,
  extractInitialSelectedPermissionIds,
  extractPaginationFromResponse,
  extractPermissionsFromResponse,
  extractRolesFromResponse,
  getRoleId,
  getRoleIsEditable,
  getRoleIsGeneral,
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

type RbacModulesCatalogResponse = Omit<SubmitResponse, "data"> & {
  data: RbacModulesCatalogData
}

/** Human label for a module key; prefer catalog label, else spaced key. */
const formatModuleLabel = (moduleKey: string, catalogLabels: Map<string, string>) => {
  const fromCatalog = catalogLabels.get(moduleKey)
  if (fromCatalog) return fromCatalog
  return moduleKey.replace(/-/g, " ")
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
  const isScopedRole = rolesBasePath === "roles"
  const abilities = useAuthStore((s) => s.abilities)
  // super_admin role name only. Parent-locked roles stay read-only via API is_editable.
  const platformSuperAdmin = isPlatformSuperAdmin(abilities)

  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const loadMoreSentinelRef = useRef<HTMLDivElement | null>(null)

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

  // Same catalog as role module picker — used for friendly module card titles.
  const { data: modulesCatalogData } = UseApiQuery<RbacModulesCatalogResponse>({
    url: "rbac-modules/catalog",
    queryOptions: {
      staleTime: 5 * 60 * 1000,
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

  const roleIsGeneral = getRoleIsGeneral(resolvedRole ?? role)
  const isReadOnly =
    (roleIsGeneral && !platformSuperAdmin) ||
    (componentProps?.readOnly ?? !getRoleIsEditable(resolvedRole ?? role))

  const roleModules = normalizeModuleKeys(
    Array.isArray(resolvedRole?.modules) ? resolvedRole.modules : []
  )
  const modulesCsv = roleModules.join(",")

  const moduleLabelByKey = useMemo(() => {
    const map = new Map<string, string>()
    const list = modulesCatalogData?.data?.modules ?? []
    list.forEach((module) => {
      if (module.key) map.set(module.key, module.label || module.key)
    })
    return map
  }, [modulesCatalogData?.data?.modules])

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
    if (isReadOnly) return
    const permission = accumulatedPermissions.find((item) => item.id === permissionId)
    // Checkbox is disabled for these; ignore a toggle if one still fires.
    if (permission?.super_admin && !platformSuperAdmin) return
    setSelectedPermissionIds((current) => {
      if (checked) {
        return current.includes(permissionId) ? current : [...current, permissionId]
      }
      return current.filter((id) => id !== permissionId)
    })
  }

  const handleSave = () => {
    if (isReadOnly) return
    if (!roleId) {
      ShowToast.error("Unable to assign permissions: missing role id")
      return
    }

    saveMutation.mutate({ permission_ids: selectedPermissionIds })
  }

  const isInitialLoading = isLoadingRole || (isLoadingPermissions && page === 1)
  const isLoadingMore = isLoadingPermissions && page > 1
  const hasMore =
    pagination != null &&
    (pagination.current_page ?? page) < (pagination.last_page ?? 1)
  const totalCount = pagination?.total ?? accumulatedPermissions.length

  const handleLoadMore = useCallback(() => {
    if (!hasMore || isLoadingPermissions) return
    setPage((currentPage) => currentPage + 1)
  }, [hasMore, isLoadingPermissions])

  // Async pagination: when the list sentinel enters view, fetch the next page.
  useEffect(() => {
    const scrollRoot = scrollContainerRef.current
    const sentinel = loadMoreSentinelRef.current
    if (!scrollRoot || !sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          handleLoadMore()
        }
      },
      { root: scrollRoot, rootMargin: "80px", threshold: 0 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [handleLoadMore, permissionGroups.length, hasMore])

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

          <div
            ref={scrollContainerRef}
            className="space-y-4 max-h-[60vh] overflow-y-auto pr-2"
          >
            {/* Each card is one permission group (module). */}
            {permissionGroups.map(([moduleKey, modulePermissions]) => (
              <div
                key={moduleKey}
                className="rounded-md border border-[#ADABAB] overflow-hidden"
              >
                <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-muted/40 border-b border-[#ADABAB]">
                  <h3 className="text-sm font-semibold capitalize">
                    {formatModuleLabel(moduleKey, moduleLabelByKey)}
                  </h3>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {modulePermissions.length}{" "}
                    {modulePermissions.length === 1 ? "permission" : "permissions"}
                  </span>
                </div>
                <div className="px-4 py-3">
                  <ReusableCheckboxGrid
                    name={`permissions-${moduleKey}`}
                    columns={2}
                    options={modulePermissions.map((permission) => {
                      // super_admin on the permission row means only a platform super admin may tick it.
                      const lockedToSuperAdmin = Boolean(permission.super_admin) && !platformSuperAdmin
                      const checkboxLocked = isReadOnly || lockedToSuperAdmin

                      return {
                        id: String(permission.id),
                        name: permission.description || permission.name,
                        checked: selectedPermissionIds.includes(permission.id),
                        disabled: checkboxLocked,
                        onChange: checkboxLocked
                          ? undefined
                          : (checked) => togglePermission(permission.id, checked),
                      }
                    })}
                  />
                </div>
              </div>
            ))}

            {/* Sentinel at the end of the scroll list — triggers the next page. */}
            <div
              ref={loadMoreSentinelRef}
              className="flex items-center justify-center py-2 text-sm text-muted-foreground"
              aria-hidden={!hasMore && !isLoadingMore}
            >
              {isLoadingMore
                ? "Loading more..."
                : hasMore
                  ? "Scroll for more"
                  : accumulatedPermissions.length > 0
                    ? "All permissions loaded"
                    : null}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-end gap-3 mt-2 px-0">
        <Button
          type="button"
          className="w-full sm:w-auto rounded-sm border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
          onClick={() => handleDialogContextSwitch({})}
        >
          {isReadOnly ? "Close" : "Cancel"}
        </Button>

        {!isReadOnly && (
          <Button
            type="button"
            className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-sm hover:bg-[#C20C0C]"
            disabled={!roleId || !modulesCsv || saveMutation.isPending}
            loading={saveMutation.isPending}
            onClick={handleSave}
          >
            Save Permissions
          </Button>
        )}
      </div>
    </div>
  )
}

export default AssignPermissionsModal
