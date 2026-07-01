/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardFooter } from "@/components/ui/card"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button, ReuseableInput } from "@/dev/core"
import { UseApiMutation } from "@/hooks/hooks"
import { RoleCreateSchema } from "@/types/form-schema"
import { ROLE_AUTHORITY_DEFAULT } from "@/types/rbac-roles"
import { RoleCreateFormValues } from "@/types/schema"
import { SubmitResponse } from "@/types/types"
import { EMETHODS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"

import { RoleModulesField } from "./modules-field"
import { normalizeModuleKeys } from "../role-utils"

export const CreateRoleModal = ({
  handleDialogContextSwitch,
  componentProps,
}: {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: {
    orgId?: number | string
    organizationLocationId?: number | string
    refetch?: () => Promise<any>
  }
}) => {
  const form = useForm<RoleCreateFormValues>({
    resolver: zodResolver(RoleCreateSchema),
    defaultValues: {
      name: "",
      description: "",
      modules: [],
      org_id: String(componentProps?.orgId ?? ""),
    },
  })

  const submitMutation = UseApiMutation<SubmitResponse, Record<string, unknown>>({
    url: "roles",
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response?.message || "Role created successfully")
        form.reset({
          name: "",
          description: "",
          modules: [],
          org_id: String(componentProps?.orgId ?? ""),
        })
        componentProps?.refetch?.()
        handleDialogContextSwitch({})
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const onSubmit = (data: RoleCreateFormValues) => {
    const moduleKeys = normalizeModuleKeys(data.modules ?? [])
    submitMutation.mutate({
      name: data.name,
      description: data.description || undefined,
      modules: moduleKeys,
      authority: ROLE_AUTHORITY_DEFAULT,
      org_id: Number(data.org_id),
      organization_location_id: componentProps?.organizationLocationId
        ? Number(componentProps.organizationLocationId)
        : undefined,
    })
  }

  return (
    <div className="w-full min-w-[600px] max-w-[700px] p-6 space-y-6">
      <div className="border-b pb-3">
        <DialogTitle className="text-xl font-semibold">Create Role</DialogTitle>
        <DialogDescription className="mt-1">
          Define a new role and assign modules for this organization.
        </DialogDescription>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <ReuseableInput
          control={form.control}
          name="name"
          label="Role Name"
          required
          placeholder="e.g. manager"
          className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
        />

        <ReuseableInput
          control={form.control}
          name="description"
          label="Description"
          placeholder="Organization manager"
          className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
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

        <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 mt-2 px-0">
          <Button
            type="button"
            className="w-full sm:w-auto rounded-full border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
            onClick={() => handleDialogContextSwitch({})}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-full hover:bg-[#C20C0C]"
            loading={submitMutation.isPending}
          >
            Create Role
          </Button>
        </CardFooter>
      </form>
    </div>
  )
}

export default CreateRoleModal
