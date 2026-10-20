import type { TravelBenefitCommonFormValues } from "@/types/schema"
import {
  TRAVEL_BENEFIT_SHOW_IN,
  TRAVEL_BENEFIT_TYPE,
} from "@/utils/travel-enums"

/** JSON body for POST/PATCH travel/benefit-common. */
export type TravelBenefitCommonPayload = {
  type: string
  group: string
  name: string
  title: string | null
}

export const emptyTravelBenefitCommonFormValues =
  (): TravelBenefitCommonFormValues => ({
    type: TRAVEL_BENEFIT_TYPE.Benefits,
    group: TRAVEL_BENEFIT_SHOW_IN.All,
    name: "",
    title: "",
  })

/** Map a list/show row into react-hook-form values. */
export const mapTravelBenefitCommonToFormValues = (
  row: Record<string, unknown>
): TravelBenefitCommonFormValues => {
  const meta = (row.meta as Record<string, unknown> | undefined) ?? {}
  const titleFromMeta =
    typeof meta.title === "string" ? meta.title : undefined
  const title =
    typeof row.title === "string" && row.title.trim() !== ""
      ? row.title
      : titleFromMeta ?? ""

  return {
    type:
      typeof row.type === "string" && row.type.trim() !== ""
        ? row.type
        : TRAVEL_BENEFIT_TYPE.Benefits,
    group:
      typeof row.group === "string" && row.group.trim() !== ""
        ? row.group
        : TRAVEL_BENEFIT_SHOW_IN.All,
    name: typeof row.name === "string" ? row.name : "",
    title,
  }
}

/** Turn form strings into the API payload (empty title → null). */
export const buildTravelBenefitCommonPayload = (
  values: TravelBenefitCommonFormValues
): TravelBenefitCommonPayload => {
  const title = values.title?.trim() ?? ""
  return {
    type: values.type,
    group: values.group,
    name: values.name.trim(),
    title: title === "" ? null : title,
  }
}
