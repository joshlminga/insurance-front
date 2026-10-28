import { describe, expect, it } from "vitest"
import { TravelReasonSchema } from "@/types/form-schema"

describe("TravelReasonSchema", () => {
  it("accepts a valid reason name", () => {
    const result = TravelReasonSchema.safeParse({ name: "Leisure" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe("Leisure")
    }
  })

  it("trims whitespace from the name", () => {
    const result = TravelReasonSchema.safeParse({ name: "  Business  " })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe("Business")
    }
  })

  it("rejects names shorter than 2 characters", () => {
    const result = TravelReasonSchema.safeParse({ name: "A" })
    expect(result.success).toBe(false)
  })

  it("rejects empty names", () => {
    const result = TravelReasonSchema.safeParse({ name: "   " })
    expect(result.success).toBe(false)
  })
})
