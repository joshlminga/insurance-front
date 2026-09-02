import { describe, expect, it } from "vitest"
import { CreateMotorProductRatesSchema } from "./form-schema"

const requiredMotorRatePayload = {
  coverfor_id: "1",
  covertype_id: "2",
  covering_id: "3",
  usedfor_id: "4",
  bodytype_id: "",
  used_tonnage_id: "",
  min_tonnage: "",
  max_tonnage: "",
  is_all_sum: false,
  valued_from: "",
  valued_to: "",
  is_all_age: false,
  age_from: "",
  age_to: "",
  rate: "",
  minimum: "",
  pll: "",
  is_fleet: false,
  min_fleet: "",
  max_fleet: "",
  target_audience: "Any",
  cover_target: "Any",
  min_age: "",
  max_age: "",
  start_date: "2026-01-01",
  expiry_date: "2026-12-31",
  is_active: true,
  makemodel_offered: [],
  makemodel_notoffered: [],
  meta: [],
}

describe("CreateMotorProductRatesSchema", () => {
  it("accepts empty optional fields and normalizes them for the API", () => {
    const parsed = CreateMotorProductRatesSchema.parse(requiredMotorRatePayload)

    expect(parsed.bodytype_id).toBeNull()
    expect(parsed.rate).toBeNull()
    expect(parsed.minimum).toBe(0)
    expect(parsed.pll).toBeNull()
    expect(parsed.min_fleet).toBeNull()
    expect(parsed.valued_from).toBeNull()
  })

  it("still requires cover class and dates", () => {
    expect(() =>
      CreateMotorProductRatesSchema.parse({
        ...requiredMotorRatePayload,
        coverfor_id: "",
      }),
    ).toThrow()

    expect(() =>
      CreateMotorProductRatesSchema.parse({
        ...requiredMotorRatePayload,
        start_date: "",
      }),
    ).toThrow()
  })
})
