import { describe, expect, it } from "vitest"
import { TravelBenefitCommonSchema } from "@/types/form-schema"
import {
  TRAVEL_BENEFIT_SHOW_IN,
  TRAVEL_BENEFIT_TYPE,
} from "@/utils/travel-enums"
import {
  buildTravelBenefitCommonPayload,
  emptyTravelBenefitCommonFormValues,
  mapTravelBenefitCommonToFormValues,
} from "./travel-benefit-common-form-utils"

const apiRow = {
  id: 12,
  type: "benefittravel_benefit",
  group: "comparison",
  name: "Personal Accident",
  title: "Personal Accident Cover",
  meta: { title: "Personal Accident Cover" },
  is_active: true,
}

describe("emptyTravelBenefitCommonFormValues", () => {
  it("defaults type to Benefits and group to All", () => {
    expect(emptyTravelBenefitCommonFormValues()).toEqual({
      type: TRAVEL_BENEFIT_TYPE.Benefits,
      group: TRAVEL_BENEFIT_SHOW_IN.All,
      name: "",
      title: "",
    })
  })
})

describe("mapTravelBenefitCommonToFormValues", () => {
  it("maps list/show fields including title", () => {
    expect(mapTravelBenefitCommonToFormValues(apiRow)).toEqual({
      type: "benefittravel_benefit",
      group: "comparison",
      name: "Personal Accident",
      title: "Personal Accident Cover",
    })
  })

  it("falls back to meta.title when top-level title is missing", () => {
    expect(
      mapTravelBenefitCommonToFormValues({
        type: "benefittravel_benefit",
        group: "single",
        name: "Medical",
        meta: { title: "Medical Expenses" },
      })
    ).toEqual({
      type: "benefittravel_benefit",
      group: "single",
      name: "Medical",
      title: "Medical Expenses",
    })
  })
})

describe("buildTravelBenefitCommonPayload", () => {
  it("sends trimmed fields and null title when empty", () => {
    const form = TravelBenefitCommonSchema.parse({
      ...emptyTravelBenefitCommonFormValues(),
      type: TRAVEL_BENEFIT_TYPE.Benefits,
      group: TRAVEL_BENEFIT_SHOW_IN.Comparison,
      name: "  PA  ",
      title: "   ",
    })

    expect(buildTravelBenefitCommonPayload(form)).toEqual({
      type: "benefittravel_benefit",
      group: "comparison",
      name: "PA",
      title: null,
    })
  })

  it("keeps optional full title when provided", () => {
    const form = TravelBenefitCommonSchema.parse({
      ...emptyTravelBenefitCommonFormValues(),
      group: TRAVEL_BENEFIT_SHOW_IN.All,
      name: "PA",
      title: " Personal Accident Cover ",
    })

    expect(buildTravelBenefitCommonPayload(form).title).toBe(
      "Personal Accident Cover"
    )
  })
})

describe("TravelBenefitCommonSchema", () => {
  it("requires type, group, and name", () => {
    const result = TravelBenefitCommonSchema.safeParse({
      type: "",
      group: "",
      name: "",
      title: "",
    })
    expect(result.success).toBe(false)
  })

  it("accepts optional empty title", () => {
    const result = TravelBenefitCommonSchema.safeParse({
      type: TRAVEL_BENEFIT_TYPE.Benefits,
      group: TRAVEL_BENEFIT_SHOW_IN.Single,
      name: "Baggage",
      title: "",
    })
    expect(result.success).toBe(true)
  })
})
