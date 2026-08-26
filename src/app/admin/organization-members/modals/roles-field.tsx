/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react"
import { Label } from "@/components/ui/label"
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select"
import { UseApiQuery } from "@/hooks/hooks"
import type { SubmitResponse } from "@/types/types"

import { extractRolesFromResponse } from "../../organization-roles/role-utils"
import { isAssignableRole } from "../member-utils"

interface MemberRolesFieldProps {
  organizationLocationId?: number | string
  value: string[]
  onChange: (values: string[]) => void
  label?: string
  required?: boolean
}

/**
 * Multi-select of roles that can be assigned to a member at this location.
 * Loads roles scoped to the organization location and hides inactive/system
 * roles because the API would reject them anyway.
 */
export function MemberRolesField({
  organizationLocationId,
  value,
  onChange,
  label = "Roles",
  required = false,
}: MemberRolesFieldProps) {
  const { data, isLoading } = UseApiQuery<SubmitResponse>({
    url: "roles",
    params: {
      organization_location_id: organizationLocationId,
      per_page: 100,
    },
    queryOptions: {
      enabled: Boolean(organizationLocationId),
      staleTime: 5 * 60 * 1000,
    },
  })

  const roleOptions = useMemo(() => {
    return extractRolesFromResponse(data)
      .filter((role: any) => isAssignableRole(role))
      .map((role: any) => ({
        value: String(role.id),
        label: role.display_name ?? role.name ?? `Role #${role.id}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [data])

  return (
    <div className="space-y-2 w-full">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <MultiSelect values={value ?? []} onValuesChange={(vals) => onChange(vals)}>
        <MultiSelectTrigger className="w-full h-10 rounded-[5px] border border-[#ADABAB]">
          <MultiSelectValue placeholder={isLoading ? "Loading roles..." : "Select roles..."} />
        </MultiSelectTrigger>
        <MultiSelectContent>
          <MultiSelectGroup>
            {!isLoading && roleOptions.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No assignable roles found for this organization.
              </div>
            )}
            {roleOptions.map((role) => (
              <MultiSelectItem key={role.value} value={role.value}>
                {role.label}
              </MultiSelectItem>
            ))}
          </MultiSelectGroup>
        </MultiSelectContent>
      </MultiSelect>
    </div>
  )
}
