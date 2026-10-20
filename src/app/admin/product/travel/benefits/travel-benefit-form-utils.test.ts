import { describe, expect, it } from "vitest"
import {
  TravelBenefitCreateSchema,
  TravelBenefitSchema,
} from "@/types/form-schema"
import {
  buildTravelBenefitCreatePayload,
  buildTravelBenefitUpdatePayload,
  emptyTravelBenefitCreateFormValues,
  emptyTravelBenefitFormValues,
  mapTravelBenefitToFormValues,
} from "./travel-benefit-form-utils"

const validRow = {
  ...emptyTravelBenefitFormValues(),
  common_id: "1952",
  section_id: "1919",
  name: "Medical",
  benefit: "Medical expenses up to limit",
  excess: "USD 50",
}

describe("TravelBenefitSchema", () => {
  it("accepts a row with both benefit and excess", () => {
    const parsed = TravelBenefitSchema.parse(validRow)
    expect(parsed.benefit).toBe("Medical expenses up to limit")
    expect(parsed.excess).toBe("USD 50")
  })

  it("accepts excess-only (benefit empty)", () => {
    const parsed = TravelBenefitSchema.parse({
      ...validRow,
      benefit: "",
      excess: "USD 100",
    })
    expect(parsed.excess).toBe("USD 100")
  })

  it("accepts benefit-only (excess empty)", () => {
    const parsed = TravelBenefitSchema.parse({
      ...validRow,
      excess: "",
    })
    expect(parsed.benefit).toContain("Medical")
  })

  it("rejects when both benefit and excess are empty", () => {
    expect(() =>
      TravelBenefitSchema.parse({
        ...validRow,
        benefit: "",
        excess: "",
      })
    ).toThrow()
  })
})

describe("TravelBenefitCreateSchema", () => {
  it("requires at least one benefit row", () => {
    expect(() => TravelBenefitCreateSchema.parse({ benefits: [] })).toThrow()
  })

  it("accepts multiple rows", () => {
    const parsed = TravelBenefitCreateSchema.parse({
      benefits: [
        validRow,
        { ...validRow, name: "Baggage", benefit: "Lost baggage", excess: "" },
      ],
    })
    expect(parsed.benefits).toHaveLength(2)
  })
})

describe("buildTravelBenefitCreatePayload", () => {
  it("forces product_travel_ids from route productId and maps rows", () => {
    const form = TravelBenefitCreateSchema.parse({
      benefits: [validRow],
    })
    const payload = buildTravelBenefitCreatePayload(form, "42")
    expect(payload).toEqual({
      benefits: [
        {
          common_id: 1952,
          section_id: 1919,
          name: "Medical",
          benefit: "Medical expenses up to limit",
          excess: "USD 50",
        },
      ],
      product_travel_ids: [42],
    })
  })

  it("sends multiple rows with the same forced product id", () => {
    const form = TravelBenefitCreateSchema.parse({
      benefits: [
        validRow,
        {
          ...emptyTravelBenefitFormValues(),
          common_id: "10",
          section_id: "20",
          benefit: "",
          excess: "Nil",
        },
      ],
    })
    const payload = buildTravelBenefitCreatePayload(form, 7)
    expect(payload.product_travel_ids).toEqual([7])
    expect(payload.benefits).toHaveLength(2)
    expect(payload.benefits[1]).toMatchObject({
      benefit: null,
      excess: "Nil",
    })
  })

  it("ignores any product ids that might exist on form state", () => {
    // Create schema has no product_travel_ids — product comes only from arg.
    const form = emptyTravelBenefitCreateFormValues()
    form.benefits[0] = { ...validRow }
    const parsed = TravelBenefitCreateSchema.parse(form)
    expect(buildTravelBenefitCreatePayload(parsed, 99).product_travel_ids).toEqual([
      99,
    ])
  })
})

describe("buildTravelBenefitUpdatePayload", () => {
  it("sends a flat patch body with forced product link", () => {
    const payload = buildTravelBenefitUpdatePayload(
      TravelBenefitSchema.parse(validRow),
      "5"
    )
    expect(payload).toEqual({
      common_id: 1952,
      section_id: 1919,
      name: "Medical",
      benefit: "Medical expenses up to limit",
      excess: "USD 50",
      product_travel_ids: [5],
    })
  })
})

describe("mapTravelBenefitToFormValues", () => {
  it("maps benefit fields without product multi-select state", () => {
    const form = mapTravelBenefitToFormValues({
      id: 10,
      common_id: 2,
      section_id: 4,
      name: "Bag",
      benefit: "Text",
      excess: null,
      product_travel_ids: [7, 8],
      common: { id: 2, name: "Common A" },
      section: { id: 4, name: "Section B" },
    })

    expect(form).toEqual({
      common_id: "2",
      section_id: "4",
      name: "Bag",
      benefit: "Text",
      excess: "",
    })
    expect(form).not.toHaveProperty("product_travel_ids")
  })
})
