import { describe, expect, it } from "vitest"
import { TravelProductSchema } from "@/types/form-schema"
import {
  buildTravelProductPayload,
  emptyTravelProductFormValues,
  mapTravelProductToFormValues,
} from "./travel-product-form-utils"

const validForm = {
  ...emptyTravelProductFormValues(),
  organization_location_id: "10",
  name: "Schengen Cover",
  officename: "Nairobi",
  levy_applied: "true" as const,
  for_public: "false" as const,
  currency: "3",
  start_date: "2026-01-01",
  expiry_date: "2026-12-31",
  organization_location_ids: [{ organization_location_id: "22" }],
  coverages: [{ coverage_id: "5", bound_type: "Outbound" as const }],
  has_rules: "true" as const,
  quotation_api: "true" as const,
  policy_api: "false" as const,
  payment_api: "false" as const,
  certificate_api: "true" as const,
  custom_rules: [{ key: "partner_code", value: "ABC123" }],
}

describe("buildTravelProductPayload", () => {
  it("sends real booleans and only the API flags that are yes when rules are on", () => {
    const payload = buildTravelProductPayload(TravelProductSchema.parse(validForm))

    expect(payload).toMatchObject({
      organization_location_id: 10,
      levy_applied: true,
      for_public: false,
      currency: 3,
      organization_location_ids: [22],
      is_external: false,
      coverages: [{ coverage_id: 5, bound_type: "Outbound" }],
      has_rules: true,
      quotation_api: true,
      policy_api: false,
      payment_api: false,
      certificate_api: true,
      custom_rules: [{ key: "partner_code", value: "ABC123" }],
    })
  })

  it("hides the rules by sending has_rules false and clearing every API flag", () => {
    const payload = buildTravelProductPayload(
      TravelProductSchema.parse({
        ...validForm,
        has_rules: "false",
        quotation_api: "true",
        certificate_api: "true",
      })
    )

    expect(payload.has_rules).toBe(false)
    expect(payload.quotation_api).toBe(false)
    expect(payload.policy_api).toBe(false)
    expect(payload.payment_api).toBe(false)
    expect(payload.certificate_api).toBe(false)
    expect(payload.custom_rules).toEqual([])
  })

  it("skips blank-key custom rule rows on submit", () => {
    const payload = buildTravelProductPayload(
      TravelProductSchema.parse({
        ...validForm,
        custom_rules: [
          { key: "partner_code", value: "ABC123" },
          { key: "", value: "" },
        ],
      })
    )

    expect(payload.custom_rules).toEqual([{ key: "partner_code", value: "ABC123" }])
  })

  it("does not send target organizations for a public product", () => {
    const payload = buildTravelProductPayload(
      TravelProductSchema.parse({
        ...validForm,
        for_public: "true",
        organization_location_ids: [{ organization_location_id: "22" }],
        currency: "",
      })
    )

    expect(payload.for_public).toBe(true)
    expect(payload.organization_location_ids).toEqual([])
    expect(payload.currency).toBeNull()
  })

  it("sends null office name when the optional field is empty", () => {
    const payload = buildTravelProductPayload(
      TravelProductSchema.parse({
        ...validForm,
        officename: "",
      })
    )

    expect(payload.officename).toBeNull()
  })

  it("sends an empty target list for a private product with none selected", () => {
    const payload = buildTravelProductPayload(
      TravelProductSchema.parse({
        ...validForm,
        for_public: "false",
        organization_location_ids: [],
      })
    )

    expect(payload.for_public).toBe(false)
    expect(payload.organization_location_ids).toEqual([])
  })

  it("does not send coverage pairs when the cover is external", () => {
    const payload = buildTravelProductPayload(
      TravelProductSchema.parse({
        ...validForm,
        is_external: "true",
        coverages: [],
      })
    )

    expect(payload.is_external).toBe(true)
    expect(payload.coverages).toBeUndefined()
  })
})

describe("TravelProductSchema", () => {
  it("requires at least one coverage", () => {
    expect(() =>
      TravelProductSchema.parse({
        ...validForm,
        coverages: [],
      })
    ).toThrow()
  })

  it("allows an external cover with no coverages", () => {
    expect(() =>
      TravelProductSchema.parse({
        ...validForm,
        is_external: "true",
        coverages: [],
      })
    ).not.toThrow()
  })

  it("allows a private product with no target organizations", () => {
    expect(() =>
      TravelProductSchema.parse({
        ...validForm,
        for_public: "false",
        organization_location_ids: [],
      })
    ).not.toThrow()
  })

  it("rejects reserved API keys in custom_rules", () => {
    expect(() =>
      TravelProductSchema.parse({
        ...validForm,
        custom_rules: [{ key: "quotation_api", value: "nope" }],
      })
    ).toThrow()
  })

  it("rejects duplicate custom rule keys", () => {
    expect(() =>
      TravelProductSchema.parse({
        ...validForm,
        custom_rules: [
          { key: "partner_code", value: "A" },
          { key: "partner_code", value: "B" },
        ],
      })
    ).toThrow()
  })
})

describe("mapTravelProductToFormValues", () => {
  it("refills rules from the API and treats a missing rule row as No", () => {
    const values = mapTravelProductToFormValues({
      organization_location_id: 10,
      name: "Schengen Cover",
      officename: "Nairobi",
      levy_applied: true,
      for_public: false,
      currency: { id: 3, code: "USD", name: "US Dollar" },
      start_date: "2026-01-01T00:00:00.000000Z",
      expiry_date: "2026-12-31",
      targets: [{ organization_location_id: 22, organization_name: "Agent Co" }],
      coverages: [
        { coverage_id: 5, coverage_name: "Worldwide", bound_type: "Inbound" },
      ],
      has_rules: true,
      quotation_api: true,
      policy_api: false,
      custom_rules: [{ key: "partner_code", value: "ABC123" }],
    })

    expect(values.has_rules).toBe("true")
    expect(values.quotation_api).toBe("true")
    expect(values.policy_api).toBe("false")
    expect(values.payment_api).toBe("false")
    expect(values.certificate_api).toBe("false")
    expect(values.custom_rules).toEqual([{ key: "partner_code", value: "ABC123" }])
    expect(values.is_external).toBe("false")
    expect(values.currency).toBe("3")
    expect(values.start_date).toBe("2026-01-01")
    expect(values.coverages).toEqual([{ coverage_id: "5", bound_type: "Inbound" }])
  })

  it("keeps an empty target list when the product has no targets", () => {
    const values = mapTravelProductToFormValues({
      organization_location_id: 10,
      name: "Schengen Cover",
      for_public: false,
      coverages: [{ coverage_id: 5, bound_type: "Outbound" }],
      targets: [],
    })

    expect(values.organization_location_ids).toEqual([])
  })
})
