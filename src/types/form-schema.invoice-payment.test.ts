import { describe, expect, it } from "vitest"
import { InvoicePaymentSchema } from "./form-schema"

/** Valid payee payload; cover dates use future calendar days relative to Nov 2026. */
const baseInvoicePayload = {
  name: "Test Payee",
  email: "payee@example.com",
  phone: "0712345678",
  cover_start_date: "2026-11-18",
  payment_plan: "Full",
}

describe("InvoicePaymentSchema cover_end_date", () => {
  it("accepts end date at start + 12 months − 1 day", () => {
    const result = InvoicePaymentSchema.safeParse({
      ...baseInvoicePayload,
      cover_end_date: "2027-11-17",
    })

    expect(result.success).toBe(true)
  })

  it("rejects end date one day past the 12-month cap", () => {
    const result = InvoicePaymentSchema.safeParse({
      ...baseInvoicePayload,
      cover_end_date: "2027-11-18",
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      const endIssues = result.error.issues.filter((issue) =>
        issue.path.includes("cover_end_date"),
      )
      expect(endIssues[0]?.message).toContain("2027-11-17")
    }
  })

  it("allows omitting cover_end_date", () => {
    const result = InvoicePaymentSchema.safeParse(baseInvoicePayload)
    expect(result.success).toBe(true)
  })
})

describe("InvoicePaymentSchema DMVIC override fields", () => {
  it("accepts override flags from the confirm popup", () => {
    const result = InvoicePaymentSchema.safeParse({
      ...baseInvoicePayload,
      validate_double_insurance: true,
      is_logbook_verified: true,
      additional_comments: "Optional note",
    })

    expect(result.success).toBe(true)
  })

  it("rejects additional_comments over 200 characters", () => {
    const result = InvoicePaymentSchema.safeParse({
      ...baseInvoicePayload,
      additional_comments: "a".repeat(201),
    })

    expect(result.success).toBe(false)
  })
})

describe("InvoicePaymentSchema reminders and short-cover reason", () => {
  it("allows omitting reminders_enabled (forms supply false)", () => {
    const result = InvoicePaymentSchema.safeParse(baseInvoicePayload)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.reminders_enabled).toBeUndefined()
    }
  })

  it("accepts reminders_enabled true without a short cover", () => {
    const result = InvoicePaymentSchema.safeParse({
      ...baseInvoicePayload,
      reminders_enabled: true,
      cover_end_date: "2027-11-17",
    })

    expect(result.success).toBe(true)
  })

  it("requires issue_reason when cover is 30 days or less", () => {
    // 18 Nov → 18 Dec = 30 days → short cover
    const result = InvoicePaymentSchema.safeParse({
      ...baseInvoicePayload,
      cover_end_date: "2026-12-18",
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      const reasonIssues = result.error.issues.filter((issue) =>
        issue.path.includes("issue_reason"),
      )
      expect(reasonIssues.length).toBeGreaterThan(0)
    }
  })

  it("accepts a short cover with a valid issue_reason", () => {
    const result = InvoicePaymentSchema.safeParse({
      ...baseInvoicePayload,
      cover_end_date: "2026-12-18",
      issue_reason: "no_logbook",
    })

    expect(result.success).toBe(true)
  })

  it("requires other_reason when issue_reason is other", () => {
    const result = InvoicePaymentSchema.safeParse({
      ...baseInvoicePayload,
      cover_end_date: "2026-12-18",
      issue_reason: "other",
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      const otherIssues = result.error.issues.filter((issue) =>
        issue.path.includes("other_reason"),
      )
      expect(otherIssues.length).toBeGreaterThan(0)
    }
  })

  it("accepts other with a filled other_reason", () => {
    const result = InvoicePaymentSchema.safeParse({
      ...baseInvoicePayload,
      cover_end_date: "2026-12-18",
      issue_reason: "other",
      other_reason: "Special underwriting arrangement",
    })

    expect(result.success).toBe(true)
  })

  it("does not require issue_reason when cover is longer than 30 days", () => {
    // 18 Nov → 19 Dec = 31 days → yearly format, no reason
    const result = InvoicePaymentSchema.safeParse({
      ...baseInvoicePayload,
      cover_end_date: "2026-12-19",
    })

    expect(result.success).toBe(true)
  })
})
