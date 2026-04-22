import React, { useMemo } from "react"
import type { Control, FieldValues, Path } from "react-hook-form"
import { ReuseableInput } from "@/dev/core"

export type YearOfManufactureInputProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  covertypeId: string | number | null | undefined
  name?: Path<TFieldValues>
  comprehensiveId?: string | number
  className?: string
}

export function YearOfManufactureInput<TFieldValues extends FieldValues>({
  control,
  covertypeId,
  name,
  comprehensiveId = 1384,
  className,
}: YearOfManufactureInputProps<TFieldValues>) {
  const currentYear = new Date().getFullYear()

  const minYear = useMemo(() => {
    const isComprehensive = String(covertypeId ?? "") === String(comprehensiveId)
    return isComprehensive ? currentYear - 15 : currentYear - 50
  }, [covertypeId, comprehensiveId, currentYear])

  return (
    <ReuseableInput
      className={className}
      control={control}
      name={(name ?? ("year" as Path<TFieldValues>)) as Path<TFieldValues>}
      label={`Year of Manufacture (min ${minYear})`}
      required
      type="number"
      placeholder={`e.g. ${Math.min(currentYear, Math.max(minYear, currentYear - 2))}`}
    />
  )
}

