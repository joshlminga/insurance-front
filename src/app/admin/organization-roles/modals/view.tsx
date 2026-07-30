/* eslint-disable @typescript-eslint/no-explicit-any */
import { DetailGrid, DetailItem } from "@/components/shared"
import { Badge } from "@/components/ui/badge"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { UseApiQuery } from "@/hooks/hooks"
import { SubmitResponse } from "@/types/types"

import { getRoleId, getRoleIsActive, getModuleLabel, getRoleLabel, normalizeModuleKey } from "../role-utils"

export const ViewRoleModal = ({
  componentProps,
}: {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: {
    data?: Record<string, any>
    rolesBasePath?: string
  }
}) => {
  const roleId = getRoleId(componentProps?.data ?? {})
  const rolesBasePath = componentProps?.rolesBasePath ?? "roles"

  const { data, isLoading } = UseApiQuery<SubmitResponse>({
    url: `${rolesBasePath}/${roleId}`,
    queryOptions: {
      enabled: Boolean(roleId),
    },
  })

  const role = (data as any)?.data?.role ?? (data as any)?.data ?? componentProps?.data ?? {}
  const modules = Array.isArray(role?.modules) ? role.modules : []
  const isActive = getRoleIsActive(role)

  return (
    <div className="w-full min-w-[600px] max-w-[860px] space-y-6 p-6">
      <div className="border-b pb-3">
        <DialogTitle className="text-xl font-semibold">Role Details</DialogTitle>
        <DialogDescription className="mt-1">
          View role information and assigned modules.
        </DialogDescription>
      </div>

      {!roleId ? (
        <div className="text-sm text-destructive">Unable to load role: missing role id.</div>
      ) : isLoading ? (
        <div className="text-sm text-muted-foreground">Loading role details...</div>
      ) : (
        <>
          <DetailGrid columns={2}>
            <DetailItem label="Name" value={getRoleLabel(role, rolesBasePath)} />
            <DetailItem label="Authority" value={role?.authority ?? "N/A"} />
            <DetailItem label="Description" value={role?.description ?? "-"} />
            <DetailItem
              label="Status"
              value={
                <Badge
                  className={`rounded-full text-white ${isActive ? "bg-green-500" : "bg-red-500"}`}
                >
                  {isActive ? "Active" : "Inactive"}
                </Badge>
              }
            />
          </DetailGrid>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Modules</h3>
            {modules.length === 0 ? (
              <p className="text-sm text-muted-foreground">No modules assigned.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {modules.map((moduleItem: unknown, index: number) => {
                  const moduleKey = normalizeModuleKey(moduleItem)
                  if (!moduleKey) return null

                  return (
                    <Badge
                      key={`${moduleKey}-${index}`}
                      className="rounded-lg border-transparent bg-slate-100 font-mono text-xs text-slate-800"
                    >
                      {getModuleLabel(moduleItem)}
                    </Badge>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default ViewRoleModal
