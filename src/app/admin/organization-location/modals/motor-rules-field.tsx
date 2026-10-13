/* eslint-disable @typescript-eslint/no-explicit-any */
import { Checkbox } from "@/components/ui/checkbox"
import { Button, ReusableSelect } from "@/dev/core"
import { UseApiQuery } from "@/hooks/hooks"
import { cn } from "@/lib/utils"
import { Minus, Plus } from "lucide-react"
import { useMemo } from "react"
import {
  Control,
  Controller,
  FieldValues,
  Path,
  useFieldArray,
  useWatch,
} from "react-hook-form"

import { DEFAULT_MOTOR_RULE_ROW } from "../organization-location-motor-rules"

type MotorRulesFieldProps<T extends FieldValues> = {
  control: Control<T>
  name: Path<T>
  locationId: string | number | null | undefined
  locationProductId: number | null
  /** Show only when Motor is assigned on this location. */
  enabled: boolean
}

/**
 * Admin UI: configure org motor mandatory-benefit rules for a location's Motor product.
 * Loads available products/benefits from the nested motor-rules API.
 */
export function OrganizationLocationMotorRulesField<T extends FieldValues>({
  control,
  name,
  locationId,
  locationProductId,
  enabled,
}: MotorRulesFieldProps<T>) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as never,
  })

  const watchedRows = useWatch({
    control,
    name,
  }) as Array<{
    product_id?: string
    benefit_id?: string
    allow_unselect?: boolean
  }>

  const baseUrl =
    enabled && locationId && locationProductId
      ? `organization-location/${locationId}/products/${locationProductId}/motor-rules`
      : ""

  const { data: productsData } = UseApiQuery<any>({
    url: `${baseUrl}/available-products`,
    queryOptions: { enabled: Boolean(baseUrl) },
  })

  const productOptions = useMemo(() => {
    const products = productsData?.data?.products ?? []
    return products.map((product: { id: number; name?: string }) => ({
      value: String(product.id),
      label: product.name ?? `Product ${product.id}`,
    }))
  }, [productsData])

  if (!enabled) {
    return null
  }

  if (!locationProductId) {
    return (
      <p className="text-sm text-muted-foreground">
        Save Motor product assignment first, then configure motor benefit rules.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium">Motor benefit rules</label>
          <p className="text-xs text-muted-foreground">
            Force selected Optional benefits to apply for this organization
            (treat as compulsory unless Allow unselect is checked).
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          className="inline-flex h-8 shrink-0 whitespace-nowrap rounded-full border-0 bg-[#1f2937] px-4 text-white hover:bg-[#111827]"
          onClick={() => append({ ...DEFAULT_MOTOR_RULE_ROW } as never)}
        >
          Add rule
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No motor rules yet. Click &quot;Add rule&quot; to require an optional
          benefit.
        </p>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => {
            const productId = watchedRows?.[index]?.product_id ?? ""

            return (
              <MotorRuleRow
                key={field.id}
                control={control}
                name={name}
                index={index}
                baseUrl={baseUrl}
                productId={productId}
                productOptions={productOptions}
                onRemove={() => remove(index)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

function MotorRuleRow<T extends FieldValues>({
  control,
  name,
  index,
  baseUrl,
  productId,
  productOptions,
  onRemove,
}: {
  control: Control<T>
  name: Path<T>
  index: number
  baseUrl: string
  productId: string
  productOptions: Array<{ value: string; label: string }>
  onRemove: () => void
}) {
  const { data: benefitsData } = UseApiQuery<any>({
    url: `${baseUrl}/available-benefits`,
    params: { product_id: productId },
    queryOptions: {
      enabled: Boolean(baseUrl && productId),
    },
  })

  const benefitOptions = useMemo(() => {
    const benefits = benefitsData?.data?.benefits ?? []
    return benefits.map((benefit: { id: number; name?: string }) => ({
      value: String(benefit.id),
      label: benefit.name ?? `Benefit ${benefit.id}`,
    }))
  }, [benefitsData])

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-[5px] border border-[#ADABAB] p-3 sm:flex-row sm:flex-wrap sm:items-center"
      )}
    >
      <ReusableSelect
        control={control}
        name={`${name}.${index}.product_id` as Path<T>}
        placeholder="Motor product"
        options={productOptions}
        className="w-full sm:w-48 shrink-0"
        triggerClassName="h-9 text-sm"
      />

      <ReusableSelect
        control={control}
        name={`${name}.${index}.benefit_id` as Path<T>}
        placeholder="Optional benefit"
        options={benefitOptions}
        className="w-full sm:w-48 shrink-0"
        triggerClassName="h-9 text-sm"
        disabled={!productId}
      />

      <Controller
        control={control}
        name={`${name}.${index}.allow_unselect` as Path<T>}
        render={({ field: allowField }) => (
          <div className="flex h-9 shrink-0 flex-nowrap items-center gap-2 whitespace-nowrap">
            <Checkbox
              id={`motor-rule-${index}-allow-unselect`}
              className="shrink-0"
              checked={allowField.value ?? false}
              onCheckedChange={(checked) =>
                allowField.onChange(checked === true)
              }
            />
            <label
              htmlFor={`motor-rule-${index}-allow-unselect`}
              className="text-sm leading-none whitespace-nowrap"
            >
              Allow unselect
            </label>
          </div>
        )}
      />

      <div className="ml-auto flex h-9 shrink-0 items-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={onRemove}
        >
          <Minus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
