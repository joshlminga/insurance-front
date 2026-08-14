import { beforeEach, describe, expect, it, vi } from "vitest"
import apiClient from "@/lib/api-client"
import { submitMotorCreditPayment } from "@/app/admin/credit/credit-payment"

vi.mock("@/lib/api-client", () => ({
  default: {
    post: vi.fn(),
  },
}))

const pendingPayload = {
  success: false,
  message: "Credit transaction requires approval before payment can be completed.",
  data: {
    invoice_id: 42,
    credit_transaction_id: 10,
    credit_schedule_id: 1,
    schedule_status: "pending_approval",
    cover_start_date: "2026-08-14",
    requires_cover_start_update: false,
    can_proceed: false,
  },
}

describe("submitMotorCreditPayment", () => {
  beforeEach(() => {
    vi.mocked(apiClient.post).mockReset()
  })

  it("maps 202 schedule fields from data even when success is false", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      status: 202,
      data: pendingPayload,
    })

    const result = await submitMotorCreditPayment("42", { credit_acknowledged: true })

    expect(result).toEqual({
      kind: "pending_approval",
      message: pendingPayload.message,
      creditTransactionId: 10,
      creditScheduleId: 1,
      scheduleStatus: "pending_approval",
      invoiceId: 42,
      coverStartDate: "2026-08-14",
      requiresCoverStartUpdate: false,
      canProceed: false,
    })
  })

  it("treats axios 202 errors as pending, not as a payment failure", async () => {
    vi.mocked(apiClient.post).mockRejectedValue({
      response: {
        status: 202,
        data: {
          ...pendingPayload,
          data: {
            ...pendingPayload.data,
            schedule_status: "awaiting_cover_update",
            requires_cover_start_update: true,
          },
        },
      },
    })

    const result = await submitMotorCreditPayment("42")

    expect(result.kind).toBe("pending_approval")
    if (result.kind === "pending_approval") {
      expect(result.scheduleStatus).toBe("awaiting_cover_update")
      expect(result.requiresCoverStartUpdate).toBe(true)
      expect(result.invoiceId).toBe(42)
    }
  })
})
