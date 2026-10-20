import { describe, expect, it } from "vitest"
import { TravelRateGroupSchema } from "@/types/form-schema"
import {
  buildTravelRateGroupPayload,
  emptyTravelRateGroupFormValues,
  mapTravelRateGroupToFormValues,
} from "./travel-rate-form-utils"

const validForm = {
  ...emptyTravelRateGroupFormValues(),
  plan: "Family" as const,
  charged: "Daily" as const,
  billing: "Per Family/Group" as const,
  min_age: "18",
  max_age: "65",
  min_member: "1",
  max_member: "4",
  start_date: "2026-01-01",
  expiry_date: "2026-12-31",
  is_maintenance: "false" as const,
  rates: [
    {
      id: "",
      min_days: "1",
      max_days: "7",
      trip: "Single" as const,
      premium: "100",
      minimum: "50",
      loading: "10%",
      description: "Week trip",
      is_active: "true" as const,
    },
    {
      id: "12",
      min_days: "8",
      max_days: "14",
      trip: "Multi" as const,
      premium: "180",
      minimum: "80",
      loading: "",
      description: "",
      is_active: "false" as const,
    },
  ],
}

describe("TravelRateGroupSchema", () => {
  it("accepts a group with two rate bands", () => {
    const parsed = TravelRateGroupSchema.parse(validForm)
    expect(parsed.rates).toHaveLength(2)
    expect(parsed.plan).toBe("Family")
  })

  it("rejects when max days is below min days on a band", () => {
    expect(() =>
      TravelRateGroupSchema.parse({
        ...validForm,
        rates: [
          {
            ...validForm.rates[0],
            min_days: "10",
            max_days: "5",
          },
        ],
      })
    ).toThrow()
  })
})

describe("buildTravelRateGroupPayload", () => {
  it("converts strings to numbers/booleans and keeps rate id when present", () => {
    const payload = buildTravelRateGroupPayload(TravelRateGroupSchema.parse(validForm))

    expect(payload).toMatchObject({
      plan: "Family",
      charged: "Daily",
      billing: "Per Family/Group",
      min_age: 18,
      max_age: 65,
      min_member: 1,
      max_member: 4,
      is_maintenance: false,
    })
    expect(payload.rates[0]).toMatchObject({
      min_days: 1,
      max_days: 7,
      trip: "Single",
      premium: 100,
      minimum: 50,
      loading: "10%",
      is_active: true,
    })
    expect(payload.rates[0]).not.toHaveProperty("id")
    expect(payload.rates[1]).toMatchObject({
      id: 12,
      trip: "Multi",
      is_active: false,
      loading: null,
      description: null,
    })
  })
})

describe("mapTravelRateGroupToFormValues", () => {
  it("maps API group + nested rates into form strings", () => {
    const form = mapTravelRateGroupToFormValues({
      plan: "Corporate",
      charged: "Once",
      billing: "Per Person",
      min_age: 21,
      max_age: 70,
      is_maintenance: true,
      start_date: "2026-03-01T00:00:00Z",
      rates: [
        {
          id: 9,
          min_days: 1,
          max_days: 30,
          trip: "Annual",
          premium: 500,
          minimum: 200,
          is_active: true,
        },
      ],
    })

    expect(form.plan).toBe("Corporate")
    expect(form.is_maintenance).toBe("true")
    expect(form.start_date).toBe("2026-03-01")
    expect(form.rates[0]).toMatchObject({
      id: "9",
      trip: "Annual",
      premium: "500",
      is_active: "true",
    })
  })
})
