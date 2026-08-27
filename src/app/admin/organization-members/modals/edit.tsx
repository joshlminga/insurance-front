/* eslint-disable @typescript-eslint/no-explicit-any */
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button, ReuseableInput } from "@/dev/core"
import { UseApiMutation, UseApiQuery } from "@/hooks/hooks"
import { OrganizationMemberEditSchema } from "@/types/form-schema"
import { OrganizationMemberEditFormValues } from "@/types/schema"
import { SubmitResponse } from "@/types/types"
import { EMETHODS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo, useRef } from "react"
import { Controller, useForm } from "react-hook-form"

import {
  extractMemberFromResponse,
  getMemberUserId,
  roleValuesToIds,
} from "../member-utils"
import { MemberRolesField } from "./roles-field"

/** Read the member's current active role ids from the role-assignments response */
const extractAssignedRoleValues = (data: any): string[] => {
  const payload = data?.data ?? data
  const assignments = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.assignments)
        ? payload.assignments
        : []

  return assignments
    .filter((assignment: any) => assignment?.is_active !== false)
    .map((assignment: any) => assignment?.role_id ?? assignment?.role?.id)
    .filter((id: unknown) => id != null)
    .map((id: any) => String(id))
}

/**
 * Edit a member's profile and (optionally) sync their roles at this location.
 * The API requires multipart/form-data even for text-only updates, and only
 * syncs roles when the `roles` key is present — so we send it only when the
 * role picker actually changed.
 */
export const EditMemberModal = ({
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
  const memberUserId = getMemberUserId(componentProps?.data ?? {})
  const organizationLocationId = componentProps?.organizationLocationId

  // Remember the roles the member had when the form loaded,
  // so we can tell whether the picker was changed.
  const initialRolesRef = useRef<string[]>([])

  const { data: showData, isLoading } = UseApiQuery<SubmitResponse>({
    url: `organization-location-user/${memberUserId}`,
    params: { organization_location_id: organizationLocationId },
    queryOptions: {
      enabled: Boolean(memberUserId) && Boolean(organizationLocationId),
    },
  })

  const { data: assignmentsData, isLoading: isRolesLoading } = UseApiQuery<SubmitResponse>({
    url: "role-assignments",
    params: {
      user_id: memberUserId,
      organization_location_id: organizationLocationId,
    },
    queryOptions: {
      enabled: Boolean(memberUserId) && Boolean(organizationLocationId),
    },
  })

  const member = useMemo(
    () => extractMemberFromResponse(showData) ?? componentProps?.data ?? {},
    [showData, componentProps?.data]
  )

  const form = useForm<OrganizationMemberEditFormValues>({
    resolver: zodResolver(OrganizationMemberEditSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      roles: [],
      profile_picture: undefined,
    },
  })

  useEffect(() => {
    const assignedRoles = extractAssignedRoleValues(assignmentsData)
    initialRolesRef.current = assignedRoles

    form.reset({
      name: String(member?.name ?? ""),
      email: String(member?.email ?? ""),
      phone: String(member?.phone ?? ""),
      roles: assignedRoles,
      profile_picture: undefined,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member?.name, member?.email, member?.phone, assignmentsData])

  const updateMutation = UseApiMutation<SubmitResponse, FormData>({
    url: `organization-location-user/${memberUserId}?organization_location_id=${organizationLocationId}`,
    method: EMETHODS.POST,
    config: {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response?.message || "Member updated successfully")
        componentProps?.refetch?.()
        handleDialogContextSwitch({})
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const onSubmit = (data: OrganizationMemberEditFormValues) => {
    if (!memberUserId) {
      ShowToast.error("Unable to update member: missing user id")
      return
    }

    const formData = new FormData()
    formData.append("name", data.name)
    formData.append("email", data.email)
    if (data.phone) formData.append("phone", data.phone)
    if (data.profile_picture instanceof File) {
      formData.append("profile_picture", data.profile_picture)
    }

    // Only send roles when the selection changed — sending the key triggers
    // a full role sync at this location on the API side.
    const initial = [...initialRolesRef.current].sort().join(",")
    const current = [...data.roles].sort().join(",")
    if (initial !== current) {
      roleValuesToIds(data.roles).forEach((id) =>
        formData.append("roles[]", String(id))
      )
    }

    updateMutation.mutate(formData)
  }

  return (
    <div className="w-full min-w-[600px] max-w-[700px] p-6 space-y-6">
      <div className="border-b pb-3">
        <DialogTitle className="text-xl font-semibold">Edit Member</DialogTitle>
        <DialogDescription className="mt-1">
          Update the member&apos;s profile and roles for this organization.
        </DialogDescription>
      </div>

      {!memberUserId ? (
        <div className="text-sm text-destructive">
          Unable to load member: missing user id.
        </div>
      ) : isLoading || isRolesLoading ? (
        <div className="text-sm text-muted-foreground">Loading member details...</div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <ReuseableInput
            control={form.control}
            name="name"
            label="Full Name"
            required
            className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
          />

          <ReuseableInput
            control={form.control}
            name="email"
            type="email"
            label="Email Address"
            required
            className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
          />

          <ReuseableInput
            control={form.control}
            name="phone"
            type="tel"
            label="Phone Number"
            className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
          />

          <Controller
            control={form.control}
            name="roles"
            render={({ field }) => (
              <MemberRolesField
                organizationLocationId={organizationLocationId}
                value={field.value ?? []}
                onChange={field.onChange}
                required
              />
            )}
          />

          {form.formState.errors.roles && (
            <p className="text-sm text-destructive">
              {form.formState.errors.roles.message}
            </p>
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

export default EditMemberModal
