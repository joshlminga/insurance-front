/* eslint-disable @typescript-eslint/no-explicit-any */
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button, ReusableApiMultiSelect, ReuseableInput } from "@/dev/core"
import { UseApiMutation } from "@/hooks/hooks"
import { OrganizationMemberCreateSchema } from "@/types/form-schema"
import { OrganizationMemberCreateFormValues } from "@/types/schema"
import { SubmitResponse } from "@/types/types"
import { EMETHODS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"

import { roleValuesToIds } from "../member-utils"
import MemberPasswordModal from "./password-display"

export const CreateMemberModal = ({
  handleDialogContextSwitch,
  componentProps,
}: {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: {
    organizationLocationId?: number | string
    refetch?: () => Promise<any>
  }
}) => {
  const organizationLocationId = componentProps?.organizationLocationId

  const form = useForm<OrganizationMemberCreateFormValues>({
    resolver: zodResolver(OrganizationMemberCreateSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      roles: [],
      profile_picture: undefined,
    },
  })

  const submitMutation = UseApiMutation<SubmitResponse, Record<string, unknown> | FormData>({
    url: "organization-location-user",
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(
          response?.message || "Member created successfully. Check email for verification."
        )
        form.reset()
        componentProps?.refetch?.()
        handleDialogContextSwitch({
          componentProps: { data: (response as any)?.data },
          Component: MemberPasswordModal,
          state: true,
        })
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const onSubmit = (data: OrganizationMemberCreateFormValues) => {
    if (!organizationLocationId) {
      ShowToast.error("Unable to create member: missing organization location")
      return
    }

    const roleIds = roleValuesToIds(data.roles)
    if (data.profile_picture instanceof File) {
      const formData = new FormData()
      formData.append("organization_location_id", String(organizationLocationId))
      formData.append("name", data.name)
      formData.append("email", data.email)
      if (data.phone) formData.append("phone", data.phone)
      roleIds.forEach((id) => formData.append("roles[]", String(id)))
      formData.append("profile_picture", data.profile_picture)
      submitMutation.mutate(formData)
      return
    }

    submitMutation.mutate({
      organization_location_id: Number(organizationLocationId),
      name: data.name,
      email: data.email,
      ...(data.phone ? { phone: data.phone } : {}),
      roles: roleIds,
    })
  }

  return (
    <div className="w-full min-w-150 max-w-175 p-6 space-y-6">
      <div className="border-b pb-3">
        <DialogTitle className="text-xl font-semibold">Add New Member</DialogTitle>
        <DialogDescription className="mt-1">
          Register a staff member for this organization. A password is generated
          and emailed to them automatically.
        </DialogDescription>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <ReuseableInput
          control={form.control}
          name="name"
          label="Full Name"
          required
          placeholder="e.g. Jane Member"
          className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
        />

        <ReuseableInput
          control={form.control}
          name="email"
          type="email"
          label="Email Address"
          required
          placeholder="jane@example.com"
          className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
        />

        <ReuseableInput
          control={form.control}
          name="phone"
          type="tel"
          label="Phone Number"
          placeholder="254712345678"
          className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
        />

        <Controller
          control={form.control}
          name="roles"
          render={({ field }) => (
            <ReusableApiMultiSelect
              url="roles"
              organizationLocationId={organizationLocationId}
              value={field.value ?? []}
              onChange={field.onChange}
              required
            />
          )}
        />

        {form.formState.errors.roles && (
          <p className="text-sm text-destructive">{form.formState.errors.roles.message}</p>
        )}

        <ReuseableInput
          control={form.control}
          name="profile_picture"
          type="file"
          label="Profile Picture"
          className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
        />

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
            loading={submitMutation.isPending}
          >
            Add Member
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CreateMemberModal
