import { isOrganizationLocationProductActive } from "@/app/admin/organization-location/organization-location-query"
import { Checkbox } from "@/components/ui/checkbox"
import { Button, ReusableSelect } from "@/dev/core"
import { cn } from "@/lib/utils"
import { PRODUCT_TYPES } from "@/utils/constatnts"
import { Minus, Plus } from "lucide-react"
import {
  Control,
  Controller,
  FieldValues,
  Path,
  useFieldArray,
  useWatch,
} from "react-hook-form"

import {
  DEFAULT_ORG_LOCATION_PRODUCT_CREATE_ROW,
  DEFAULT_ORG_LOCATION_PRODUCT_EDIT_ROW,
} from "../organization-location-products"

type OrganizationLocationProductsFieldProps<T extends FieldValues> = {
  control: Control<T>
  name: Path<T>
  showStatus?: boolean
}

export function OrganizationLocationProductsField<T extends FieldValues>({
  control,
  name,
  showStatus = false,
}: OrganizationLocationProductsFieldProps<T>) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as never,
  })

  const watchedRows = useWatch({
    control,
    name,
  }) as Array<{
    product?: string
    access_public?: boolean
    product_status?: boolean
  }>

  const handleAddRow = () => {
    append(
      (showStatus
        ? { ...DEFAULT_ORG_LOCATION_PRODUCT_EDIT_ROW }
        : { ...DEFAULT_ORG_LOCATION_PRODUCT_CREATE_ROW }) as never
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Products</label>
        <Button
          type="button"
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          className="inline-flex h-8 shrink-0 whitespace-nowrap rounded-full border-0 bg-[#1f2937] px-4 text-white hover:bg-[#111827]"
          onClick={handleAddRow}
        >
          Add
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No products added. Click &quot;Add&quot; to include product types.
        </p>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => {
            const currentValue = watchedRows?.[index]?.product ?? ""
            const selectedInOtherRows = new Set(
              (watchedRows ?? [])
                .map((row, rowIndex) =>
                  rowIndex !== index ? String(row?.product ?? "").trim() : ""
                )
                .filter(Boolean)
            )

            const options = PRODUCT_TYPES.map((option) => ({
              ...option,
              disabled:
                selectedInOtherRows.has(option.value) &&
                option.value !== currentValue,
            }))

            const isRowActive = isOrganizationLocationProductActive({
              product_status: watchedRows?.[index]?.product_status,
            })

            return (
              <div
                key={field.id}
                className={cn(
                  "flex flex-nowrap items-center gap-3 rounded-[5px] border p-3",
                  showStatus && !isRowActive
                    ? "border-red-500"
                    : "border-[#ADABAB]"
                )}
              >
                <ReusableSelect
                  control={control}
                  name={`${name}.${index}.product` as Path<T>}
                  placeholder="Product"
                  options={options}
                  className="w-36 shrink-0"
                  triggerClassName="h-9 text-sm"
                />

                <Controller
                  control={control}
                  name={`${name}.${index}.access_public` as Path<T>}
                  render={({ field: accessField }) => (
                    <div className="flex h-9 shrink-0 flex-nowrap items-center gap-2 whitespace-nowrap">
                      <Checkbox
                        id={`${String(name)}-${index}-access-public`}
                        className="shrink-0"
                        checked={accessField.value ?? true}
                        onCheckedChange={(checked) =>
                          accessField.onChange(checked === true)
                        }
                      />
                      <label
                        htmlFor={`${String(name)}-${index}-access-public`}
                        className="text-sm leading-none whitespace-nowrap"
                      >
                        Access Public Products
                      </label>
                    </div>
                  )}
                />

                {showStatus && (
                  <Controller
                    control={control}
                    name={`${name}.${index}.product_status` as Path<T>}
                    render={({ field: statusField }) => (
                      <div className="flex h-9 shrink-0 flex-nowrap items-center gap-2 whitespace-nowrap">
                        <Checkbox
                          id={`${String(name)}-${index}-product-status`}
                          className="shrink-0"
                          checked={statusField.value ?? true}
                          onCheckedChange={(checked) =>
                            statusField.onChange(checked === true)
                          }
                        />
                        <label
                          htmlFor={`${String(name)}-${index}-product-status`}
                          className="text-sm leading-none whitespace-nowrap"
                        >
                          Is Active
                        </label>
                      </div>
                    )}
                  />
                )}

                <div className="ml-auto flex h-9 shrink-0 items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => remove(index)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
