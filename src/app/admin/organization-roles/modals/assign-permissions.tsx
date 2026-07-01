/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardFooter } from "@/components/ui/card"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button, ReusableCheckboxGrid } from "@/dev/core"
import { UseApiMutation, UseApiQuery } from "@/hooks/hooks"
import { SubmitResponse } from "@/types/types"
import { EMETHODS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { useEffect, useMemo, useState } from "react"

import {
  extractInitialSelectedPermissionIds,
  extractPermissionsFromResponse,
  extractRolesFromResponse,
  getRoleId,
  groupPermissionsByModule,
  normalizeModuleKeys,
} from "../role-utils"

export const AssignPermissionsModal = ({
  handleDialogContextSwitch,
  componentProps,
}: {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: {
    data?: Record<string, any>
    organizationLocationId?: number | string
    refetch?: () => Promise<any>
  }
}) => {
  const role = componentProps?.data ?? {}
  const roleId = getRoleId(role)
  const organizationLocationId = componentProps?.organizationLocationId

  const { data: roleListData, isLoading: isLoadingRole } = UseApiQuery<SubmitResponse>({
    url: "roles",
    params: {
      role_id: roleId,
      organization_location_id: organizationLocationId,
    },
    queryOptions: {
      enabled: Boolean(roleId) && Boolean(organizationLocationId),
    },
  })

  const resolvedRole = useMemo(() => {
    const fromApi = extractRolesFromResponse(roleListData)[0]
    return fromApi ?? role
  }, [roleListData, role])

  const roleModules = normalizeModuleKeys(
    Array.isArray(resolvedRole?.modules) ? resolvedRole.modules : []
  )
  const modulesCsv = roleModules.join(",")

  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([])

  const { data: permissionsData, isLoading: isLoadingPermissions } = UseApiQuery<SubmitResponse>({
    url: `permissions/${roleId}`,
    params: {
      organization_location_id: organizationLocationId,
      modules: modulesCsv,
    },
    queryOptions: {
      enabled:
        Boolean(roleId) &&
        Boolean(organizationLocationId) &&
        Boolean(modulesCsv) &&
        !isLoadingRole,
    },
  })

  const permissions = useMemo(
    () => extractPermissionsFromResponse(permissionsData),
    [permissionsData]
  )

  const permissionGroups = useMemo(
    () => groupPermissionsByModule(permissions),
    [permissions]
  )

  useEffect(() => {
    const list = extractPermissionsFromResponse(permissionsData)
    setSelectedPermissionIds(extractInitialSelectedPermissionIds(list))
  }, [permissionsData])

  const saveMutation = UseApiMutation<SubmitResponse, { permission_ids: number[] }>({
    url: `roles/${roleId}/permissions`,
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response?.message || "Permissions assigned successfully")
        componentProps?.refetch?.()
        handleDialogContextSwitch({})
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

  const isLoading = isLoadingRole || isLoadingPermissions

  return (
    <div className="w-full min-w-[600px] max-w-[900px] p-6 space-y-6">
      <div className="border-b pb-3">
        <DialogTitle className="text-xl font-semibold">Assign Permissions</DialogTitle>
        <DialogDescription className="mt-1">
          Select permissions for role &quot;{resolvedRole?.name ?? role?.name ?? "N/A"}&quot;.
        </DialogDescription>
      </div>

      {!roleId ? (
        <div className="text-sm text-destructive">Unable to assign permissions: missing role id.</div>
      ) : !organizationLocationId ? (
        <div className="text-sm text-destructive">
          Unable to assign permissions: missing organization location.
        </div>
      ) : !modulesCsv ? (
        <div className="text-sm text-destructive">
          This role has no modules. Edit the role and add modules first.
        </div>
      ) : isLoading ? (
        <div className="text-sm text-muted-foreground">Loading permissions...</div>
      ) : permissions.length === 0 ? (
        <div className="text-sm text-muted-foreground">No permissions found for this role&apos;s modules.</div>
      ) : (
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
                  onChange: (checked) => togglePermission(permission.id, checked),
                }))}
              />
            </div>
          ))}
        </div>
      )}

      <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 mt-2 px-0">
        <Button
          type="button"
          className="w-full sm:w-auto rounded-full border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
          onClick={() => handleDialogContextSwitch({})}
        >
          Cancel
        </Button>

        <Button
          type="button"
          className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-full hover:bg-[#C20C0C]"
          disabled={!roleId || !modulesCsv || saveMutation.isPending}
          loading={saveMutation.isPending}
          onClick={handleSave}
        >
          Save Permissions
        </Button>
      </CardFooter>
    </div>
  )
}

export default AssignPermissionsModal
