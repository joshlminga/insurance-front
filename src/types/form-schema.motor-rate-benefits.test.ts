import { describe, expect, it } from "vitest"
import { CreateMotorRateBenefitsSchema } from "./form-schema"

describe("CreateMotorRateBenefitsSchema", () => {
  it("allows Inclusive benefits with both rate and minimum empty", () => {
    const parsed = CreateMotorRateBenefitsSchema.parse({
      benefit_id: "5",
      rate: "",
      minimum: "",
      benefit_type: "Inclusive",
      description: "",
    })

    expect(parsed.rate).toBeNull()
    expect(parsed.minimum).toBeNull()
    expect(parsed.benefit_type).toBe("Inclusive")
  })

  it("requires at least one of rate or minimum for Optional benefits", () => {
    expect(() =>
      CreateMotorRateBenefitsSchema.parse({
        benefit_id: "5",
        rate: "",
        minimum: "",
        benefit_type: "Optional",
        description: "",
      }),
    ).toThrow()
  })

  it("requires at least one of rate or minimum for Compulsory benefits", () => {
    expect(() =>
      CreateMotorRateBenefitsSchema.parse({
        benefit_id: "5",
        rate: "",
        minimum: "",
        benefit_type: "Compulsory",
        description: "",
      }),
    ).toThrow()
  })

  it("accepts Optional benefits when only minimum is provided", () => {
    const parsed = CreateMotorRateBenefitsSchema.parse({
      benefit_id: "5",
      rate: "",
      minimum: "100.5",
      benefit_type: "Optional",
      description: "",
    })

    expect(parsed.rate).toBeNull()
    expect(parsed.minimum).toBe(100.5)
  })
})
