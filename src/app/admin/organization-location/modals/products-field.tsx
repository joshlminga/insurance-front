import { Checkbox } from "@/components/ui/checkbox"
import { Button, ReusableSelect } from "@/dev/core"
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
          variant="outline"
          size="sm"
          className="h-8 gap-1"
          onClick={handleAddRow}
        >
          <Plus className="h-4 w-4" />
          Add more
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No products added. Click &quot;Add more&quot; to include product types.
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

            return (
              <div
                key={field.id}
                className="grid gap-3 rounded-[5px] border border-[#ADABAB] p-3 sm:grid-cols-[1fr_auto_auto_auto]"
              >
                <ReusableSelect
                  control={control}
                  name={`${name}.${index}.product` as Path<T>}
                  label="Product"
                  placeholder="Select product type"
                  options={options}
                />

                <Controller
                  control={control}
                  name={`${name}.${index}.access_public` as Path<T>}
                  render={({ field: accessField }) => (
                    <div className="flex items-end gap-2 pb-1">
                      <Checkbox
                        id={`${String(name)}-${index}-access-public`}
                        checked={accessField.value ?? true}
                        onCheckedChange={(checked) =>
                          accessField.onChange(checked === true)
                        }
                      />
                      <label
                        htmlFor={`${String(name)}-${index}-access-public`}
                        className="text-sm"
                      >
                        Public product
                      </label>
                    </div>
                  )}
                />

                {showStatus && (
                  <Controller
                    control={control}
                    name={`${name}.${index}.product_status` as Path<T>}
                    render={({ field: statusField }) => (
                      <div className="flex items-end gap-2 pb-1">
                        <Checkbox
                          id={`${String(name)}-${index}-product-status`}
                          checked={statusField.value ?? true}
                          onCheckedChange={(checked) =>
                            statusField.onChange(checked === true)
                          }
                        />
                        <label
                          htmlFor={`${String(name)}-${index}-product-status`}
                          className="text-sm"
                        >
                          Status
                        </label>
                      </div>
                    )}
                  />
                )}

                <div className="flex items-end justify-end pb-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 p-0"
                    onClick={() => remove(index)}
                  >
                    <Minus className="h-4 w-4" />
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
