import { describe, expect, it } from "vitest"
import { InvoicePaymentSchema } from "./form-schema"

/** Valid payee payload; cover dates use future calendar days relative to Sep 2026. */
const baseInvoicePayload = {
  name: "Test Payee",
  email: "payee@example.com",
  phone: "0712345678",
  cover_start_date: "2026-09-18",
  payment_plan: "Full",
}

describe("InvoicePaymentSchema cover_end_date", () => {
  it("accepts end date at start + 12 months − 1 day", () => {
    const result = InvoicePaymentSchema.safeParse({
      ...baseInvoicePayload,
      cover_end_date: "2027-09-17",
    })

    expect(result.success).toBe(true)
  })

  it("rejects end date one day past the 12-month cap", () => {
    const result = InvoicePaymentSchema.safeParse({
      ...baseInvoicePayload,
      cover_end_date: "2027-09-18",
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      const endIssues = result.error.issues.filter((issue) =>
        issue.path.includes("cover_end_date"),
      )
      expect(endIssues[0]?.message).toContain("2027-09-17")
    }
  })

  it("allows omitting cover_end_date", () => {
    const result = InvoicePaymentSchema.safeParse(baseInvoicePayload)
    expect(result.success).toBe(true)
  })
})
