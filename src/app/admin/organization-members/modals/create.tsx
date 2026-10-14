/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react"
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

/** Shape returned on HTTP 409 when email already belongs to another org. */
type ExistingUserConflict = {
  user: { id: number; name?: string; email: string }
  organizations: { id: number; name: string }[]
  message?: string
}

function getExistingUserConflict(error: unknown): ExistingUserConflict | null {
  const err = error as any
  if (err?.response?.status !== 409) return null

  const payload = err?.response?.data?.data
  if (payload?.code !== "EXISTING_USER" || !payload?.user?.email) return null

  return {
    user: payload.user,
    organizations: Array.isArray(payload.organizations) ? payload.organizations : [],
    message: err?.response?.data?.message,
  }
}

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
  // Set when API returns 409 EXISTING_USER — ask admin before reuse_existing
  const [existingConflict, setExistingConflict] = useState<ExistingUserConflict | null>(null)

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

  const finishSuccess = (response: SubmitResponse, data: Record<string, any> | undefined) => {
    ShowToast.success(
      response?.message || "Member created successfully. Check email for verification."
    )
    form.reset()
    setExistingConflict(null)
    componentProps?.refetch?.()

    // New create returns a one-time password → show it. Reuse has no password.
    if (data?.password) {
      handleDialogContextSwitch({
        componentProps: { data },
        Component: MemberPasswordModal,
        state: true,
      })
      return
    }

    handleDialogContextSwitch({})
  }

  const submitMutation = UseApiMutation<SubmitResponse, Record<string, unknown> | FormData>({
    url: "organization-location-user",
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (response) => {
        finishSuccess(response, (response as any)?.data)
      },
      onError: (error) => {
        const conflict = getExistingUserConflict(error)
        if (conflict) {
          setExistingConflict(conflict)
          return
        }
        // ALREADY_MEMBER (422) and other errors → toast
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const buildCreatePayload = (data: OrganizationMemberCreateFormValues) => {
    const roleIds = roleValuesToIds(data.roles)

    if (data.profile_picture instanceof File) {
      const formData = new FormData()
      formData.append("organization_location_id", String(organizationLocationId))
      formData.append("name", data.name)
      formData.append("email", data.email)
      if (data.phone) formData.append("phone", data.phone)
      roleIds.forEach((id) => formData.append("roles[]", String(id)))
      formData.append("profile_picture", data.profile_picture)
      return formData
    }

    return {
      organization_location_id: Number(organizationLocationId),
      name: data.name,
      email: data.email,
      ...(data.phone ? { phone: data.phone } : {}),
      roles: roleIds,
    }
  }

  const onSubmit = (data: OrganizationMemberCreateFormValues) => {
    if (!organizationLocationId) {
      ShowToast.error("Unable to create member: missing organization location")
      return
    }

    setExistingConflict(null)
    submitMutation.mutate(buildCreatePayload(data))
  }

  /** Admin confirmed: grant this location access to the existing user. */
  const continueWithExisting = () => {
    if (!organizationLocationId || !existingConflict) return

    const roleIds = roleValuesToIds(form.getValues("roles"))
    if (roleIds.length === 0) {
      ShowToast.error("Select at least one role before continuing")
      return
    }

    submitMutation.mutate({
      organization_location_id: Number(organizationLocationId),
      email: existingConflict.user.email || form.getValues("email"),
      roles: roleIds,
      reuse_existing: true,
    })
  }

  const useDifferentEmail = () => {
    setExistingConflict(null)
    // Let admin edit the email on the form
    setTimeout(() => form.setFocus("email"), 0)
  }

  const orgNames =
    existingConflict?.organizations.map((org) => org.name).filter(Boolean).join(", ") ||
    "another organization"

  return (
    <div className="w-full min-w-150 max-w-175 p-6 space-y-6">
      <div className="border-b pb-3">
        <DialogTitle className="text-xl font-semibold">Add New Member</DialogTitle>
        <DialogDescription className="mt-1">
          Register a staff member for this organization. A password is generated
          and emailed to them automatically.
        </DialogDescription>
      </div>

      {/* Confirm before linking an email that already exists elsewhere */}
      {existingConflict ? (
        <div className="space-y-4 rounded-md border border-amber-200 bg-amber-50/80 p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Account already exists
            </p>
            <p className="text-sm text-muted-foreground">
              {existingConflict.message ||
                "An account with this email already exists in another organization."}
            </p>
            <dl className="grid gap-1 text-sm">
              <div className="flex gap-2">
                <dt className="text-muted-foreground shrink-0">Name:</dt>
                <dd className="font-medium">{existingConflict.user.name || "—"}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted-foreground shrink-0">Email:</dt>
                <dd className="font-medium break-all">{existingConflict.user.email}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted-foreground shrink-0">Organizations:</dt>
                <dd className="font-medium">{orgNames}</dd>
              </div>
            </dl>
            <p className="text-sm text-muted-foreground pt-1">
              Continue to grant this person access here using their existing
              account (no new password). Or use a different email to create a
              new member.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button
              type="button"
              className="w-full sm:w-auto rounded-sm border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
              onClick={useDifferentEmail}
              disabled={submitMutation.isPending}
            >
              Use a different email
            </Button>
            <Button
              type="button"
              className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-sm hover:bg-[#C20C0C]"
              loading={submitMutation.isPending}
              onClick={continueWithExisting}
            >
              Continue with same email
            </Button>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  )
}

export default CreateMemberModal
