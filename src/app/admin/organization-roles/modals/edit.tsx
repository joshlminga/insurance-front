/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog"
import { Button, ReuseableInput } from "@/dev/core"
import { UseApiMutation, UseApiQuery } from "@/hooks/hooks"
import { RoleEditSchema } from "@/types/form-schema"
import { ROLE_AUTHORITY_DEFAULT } from "@/types/rbac-roles"
import { RoleEditFormValues } from "@/types/schema"
import { SubmitResponse } from "@/types/types"
import { EMETHODS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { getRoleId, normalizeModuleKeys } from "../role-utils"
import { RoleModulesField } from "./modules-field"

export const EditRoleModal = ({
  handleDialogContextSwitch,
  componentProps,
}: {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: {
    data?: Record<string, any>
    orgId?: number | string
    organizationLocationId?: number | string
    rolesBasePath?: string
    refetch?: () => Promise<any>
  }
}) => {
  const roleId = getRoleId(componentProps?.data ?? {})
  const rolesBasePath = componentProps?.rolesBasePath ?? "roles"
  const isScopedRole = rolesBasePath === "roles"

  const { data: showData, isLoading } = UseApiQuery<SubmitResponse>({
    url: `${rolesBasePath}/${roleId}`,
    queryOptions: {
      enabled: Boolean(roleId),
    },
  })

  const role = useMemo(
    () => (showData as any)?.data?.role ?? (showData as any)?.data ?? componentProps?.data ?? {},
    [showData, componentProps?.data]
  )

  const form = useForm<RoleEditFormValues>({
    resolver: zodResolver(RoleEditSchema),
    defaultValues: {
      name: "",
      description: "",
      modules: [],
      org_id: String(componentProps?.orgId ?? ""),
    },
  })

  useEffect(() => {
    const rawModules = Array.isArray(role?.modules) ? role.modules : []
    form.reset({
      name: String(
        isScopedRole ? (role?.display_name ?? "") : (role?.name ?? "")
      ),
      description: String(role?.description ?? ""),
      modules: normalizeModuleKeys(rawModules),
      org_id: String(role?.org_id ?? componentProps?.orgId ?? ""),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    role?.name,
    role?.display_name,
    role?.description,
    role?.modules,
    role?.org_id,
    componentProps?.orgId,
    isScopedRole,
  ])

  const updateMutation = UseApiMutation<SubmitResponse, Record<string, unknown>>({
    url: `${rolesBasePath}/${roleId}`,
    method: EMETHODS.PATCH,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response?.message || "Role updated successfully")
        componentProps?.refetch?.()
        handleDialogContextSwitch({})
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const onSubmit = (data: RoleEditFormValues) => {
    if (!roleId) {
      ShowToast.error("Unable to update role: missing role id")
      return
    }

    const roleNamePayload = isScopedRole
      ? { display_name: data.name }
      : { name: data.name }

    const payload: Record<string, unknown> = {
      ...roleNamePayload,
      description: data.description || undefined,
      modules: normalizeModuleKeys(data.modules ?? []),
      authority: ROLE_AUTHORITY_DEFAULT,
    }

    if (isScopedRole) {
      payload.org_id = Number(data.org_id)
      if (componentProps?.organizationLocationId) {
        payload.organization_location_id = Number(componentProps.organizationLocationId)
      }
    }

    updateMutation.mutate(payload)
  }

  return (
    <div className="w-full min-w-[600px] max-w-[700px] p-6 space-y-6">
      <div className="border-b pb-3">
        <DialogTitle className="text-xl font-semibold">Edit Role</DialogTitle>
        <DialogDescription className="mt-1">
          Update role details and assigned modules.
        </DialogDescription>
      </div>

      {!roleId ? (
        <div className="text-sm text-destructive">Unable to load role: missing role id.</div>
      ) : isLoading ? (
        <div className="text-sm text-muted-foreground">Loading role details...</div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <ReuseableInput
            control={form.control}
            name="name"
            label="Role Name"
            required
            className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
          />

          <ReuseableInput
            control={form.control}
            name="description"
            label="Description"
            className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
          />

          <Controller
            control={form.control}
            name="modules"
            render={({ field }) => (
              <RoleModulesField
                value={field.value ?? []}
                onChange={field.onChange}
                required
              />
            )}
          />

          {form.formState.errors.modules && (
            <p className="text-sm text-destructive">{form.formState.errors.modules.message}</p>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-2 px-0">
            <Button
              type="button"
              className="w-full sm:w-auto rounded-sm border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
              onClick={() => handleDialogContextSwitch({})}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-sm hover:bg-[#C20C0C]"
              disabled={updateMutation.isPending}
              loading={updateMutation.isPending}
            >
              Save Changes
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

export default EditRoleModal
