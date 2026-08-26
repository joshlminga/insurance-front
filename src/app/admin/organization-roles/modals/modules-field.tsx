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
import type { RbacModulesCatalogData } from "@/types/rbac-modules"
import type { SubmitResponse } from "@/types/types"

type RbacModulesCatalogResponse = Omit<SubmitResponse, "data"> & {
  data: RbacModulesCatalogData
}

interface RoleModulesFieldProps {
  value: string[]
  onChange: (values: string[]) => void
  label?: string
  required?: boolean
}

/** Multi-select of RBAC catalog modules (module.key / module.label) */
export function RoleModulesField({
  value,
  onChange,
  label = "Modules",
  required = false,
}: RoleModulesFieldProps) {
  const { data, isLoading } = UseApiQuery<RbacModulesCatalogResponse>({
    url: "rbac-modules/catalog",
    queryOptions: {
      staleTime: 5 * 60 * 1000,
    },
  })

  const moduleOptions = useMemo(() => {
    const list = data?.data?.modules ?? []
    return [...list].sort((a, b) => a.label.localeCompare(b.label))
  }, [data?.data?.modules])

  return (
    <div className="space-y-2 w-full">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <MultiSelect values={value ?? []} onValuesChange={(vals) => onChange(vals)}>
        <MultiSelectTrigger className="w-full h-10 rounded-[5px] border border-[#ADABAB]">
          <MultiSelectValue placeholder={isLoading ? "Loading modules..." : "Select modules..."} />
        </MultiSelectTrigger>
        <MultiSelectContent>
          <MultiSelectGroup>
            {!isLoading && moduleOptions.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground">No modules found.</div>
            )}
            {moduleOptions.map((module) => (
              <MultiSelectItem key={module.key} value={module.key}>
                {module.label}
              </MultiSelectItem>
            ))}
          </MultiSelectGroup>
        </MultiSelectContent>
      </MultiSelect>
    </div>
  )
}
