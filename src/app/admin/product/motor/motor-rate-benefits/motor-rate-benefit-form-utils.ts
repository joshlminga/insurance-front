import type { CreateMotorRateExcessBenefitsFormValues } from "@/types/schema"

export type MotorRateBenefitPayload = {
  detail_benefit_id: number
  detail_type: "Benefit" | "Excess" | "Both"
  key: string
  value: string | null
  detail_highlight: boolean
}

export const emptyMotorRateBenefitFormValues =
  (): CreateMotorRateExcessBenefitsFormValues => ({
    detail_benefit_id: "",
    detail_type: "Benefit",
    key: "",
    value: "",
    detail_highlight: "false",
    product_rate_id: "",
  })

/** Turn form strings into the rate-details API body. */
export const buildMotorRateBenefitPayload = (
  values: CreateMotorRateExcessBenefitsFormValues
): MotorRateBenefitPayload => ({
  detail_benefit_id: Number(values.detail_benefit_id),
  detail_type: values.detail_type,
  key: values.key.trim(),
  value: values.value?.trim() ? values.value.trim() : null,
  detail_highlight: values.detail_highlight === "true",
})
