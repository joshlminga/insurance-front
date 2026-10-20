import { describe, expect, it } from "vitest"
import { CreateMotorRateExcessBenefitsSchema } from "@/types/form-schema"
import {
  buildMotorRateBenefitPayload,
  emptyMotorRateBenefitFormValues,
} from "./motor-rate-benefit-form-utils"

describe("CreateMotorRateExcessBenefitsSchema", () => {
  it("requires key and allows empty value", () => {
    const parsed = CreateMotorRateExcessBenefitsSchema.parse({
      ...emptyMotorRateBenefitFormValues(),
      detail_benefit_id: "5",
      detail_type: "Excess",
      key: "Windshield excess",
      value: "",
      detail_highlight: "false",
    })
    expect(parsed.key).toBe("Windshield excess")
  })

  it("rejects missing key", () => {
    expect(() =>
      CreateMotorRateExcessBenefitsSchema.parse({
        ...emptyMotorRateBenefitFormValues(),
        detail_benefit_id: "5",
        detail_type: "Benefit",
        key: "",
      })
    ).toThrow()
  })
})

describe("buildMotorRateBenefitPayload", () => {
  it("maps highlight and optional value for the API", () => {
    const payload = buildMotorRateBenefitPayload(
      CreateMotorRateExcessBenefitsSchema.parse({
        ...emptyMotorRateBenefitFormValues(),
        detail_benefit_id: "12",
        detail_type: "Both",
        key: "Label",
        value: "  text  ",
        detail_highlight: "true",
      })
    )

    expect(payload).toEqual({
      detail_benefit_id: 12,
      detail_type: "Both",
      key: "Label",
      value: "text",
      detail_highlight: true,
    })
  })
})
