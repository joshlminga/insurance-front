/* eslint-disable @typescript-eslint/no-explicit-any */
import { DetailGrid, DetailItem } from "@/components/shared"
import { Badge } from "@/components/ui/badge"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { UseApiQuery } from "@/hooks/hooks"
import { SubmitResponse } from "@/types/types"

import {
  extractMemberFromResponse,
  getMemberIsActive,
  getMemberRoleLabel,
  getMemberRoles,
  getMemberUserId,
} from "../member-utils"

/** Read-only member details fetched from the show endpoint */
export const ViewMemberModal = ({
  componentProps,
}: {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: {
    data?: Record<string, any>
    organizationLocationId?: number | string
  }
}) => {
  const memberUserId = getMemberUserId(componentProps?.data ?? {})
  const organizationLocationId = componentProps?.organizationLocationId

  const { data, isLoading } = UseApiQuery<SubmitResponse>({
    url: `organization-location-user/${memberUserId}`,
    params: { organization_location_id: organizationLocationId },
    queryOptions: {
      enabled: Boolean(memberUserId) && Boolean(organizationLocationId),
    },
  })

  const member = extractMemberFromResponse(data) ?? componentProps?.data ?? {}
  const isActive = getMemberIsActive(member)
  const roles = getMemberRoles(member)
  const organizationName =
    member?.organization?.name ?? member?.organization?.organization_name ?? "N/A"

  return (
    <div className="w-full min-w-[600px] max-w-[860px] space-y-6 p-6">
      <div className="border-b pb-3">
        <DialogTitle className="text-xl font-semibold">Member Details</DialogTitle>
        <DialogDescription className="mt-1">
          View this member&apos;s profile information.
        </DialogDescription>
      </div>

      {!memberUserId ? (
        <div className="text-sm text-destructive">
          Unable to load member: missing user id.
        </div>
      ) : isLoading ? (
        <div className="text-sm text-muted-foreground">Loading member details...</div>
      ) : (
        <>
          <DetailGrid columns={2}>
            <DetailItem label="Name" value={member?.name ?? "N/A"} />
            <DetailItem label="Email" value={member?.email ?? "N/A"} />
            <DetailItem label="Username" value={member?.username ?? "-"} />
            <DetailItem label="Phone" value={member?.phone ?? "-"} />
            <DetailItem label="Organization" value={organizationName} />
            <DetailItem
              label="Status"
              value={
                <Badge
                  className={`rounded-full text-white ${isActive ? "bg-green-500" : "bg-red-500"}`}
                >
                  {isActive ? "Active" : "Suspended"}
                </Badge>
              }
            />
          </DetailGrid>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Roles</h3>
            {roles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No roles assigned at this location.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {roles.map((role: any, index: number) => (
                  <Badge
                    key={`${role?.role_id ?? role?.name ?? index}-${index}`}
                    className="rounded-lg border-transparent bg-slate-100 text-xs text-slate-800"
                  >
                    {getMemberRoleLabel(role)}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default ViewMemberModal
