import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { CreditScheduleStatusView } from "@/app/admin/credit/components/CreditScheduleStatusView"
import type { CreditSchedule } from "@/types/types"

const today = "2026-08-14"

function schedule(overrides: Partial<CreditSchedule> = {}): CreditSchedule {
  return {
    id: 1,
    invoice_id: 42,
    cover_start_date: today,
    status: "pending_approval",
    invoice_unpaid: true,
    can_proceed: false,
    requires_cover_start_update: false,
    ...overrides,
  }
}

describe("CreditScheduleStatusView", () => {
  it("shows the cover date editor when the invoice is still unpaid", () => {
    render(
      <CreditScheduleStatusView
        schedule={schedule()}
        coverStartDraft={today}
        onCoverStartDraftChange={vi.fn()}
        onSaveCoverStart={vi.fn()}
        onProceed={vi.fn()}
        todayMinDate={today}
      />
    )

    expect(screen.getByLabelText("Cover start date")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Save cover start date" })).toBeInTheDocument()
  })

  it("disables Proceed until can_proceed is true", () => {
    const { rerender } = render(
      <CreditScheduleStatusView
        schedule={schedule({ status: "awaiting_cover_update", can_proceed: false })}
        coverStartDraft={today}
        onCoverStartDraftChange={vi.fn()}
        onSaveCoverStart={vi.fn()}
        onProceed={vi.fn()}
        todayMinDate={today}
      />
    )

    expect(screen.getByRole("button", { name: "Proceed" })).toBeDisabled()

    rerender(
      <CreditScheduleStatusView
        schedule={schedule({
          status: "awaiting_cover_update",
          can_proceed: true,
          requires_cover_start_update: true,
        })}
        coverStartDraft={today}
        onCoverStartDraftChange={vi.fn()}
        onSaveCoverStart={vi.fn()}
        onProceed={vi.fn()}
        todayMinDate={today}
      />
    )

    expect(screen.getByRole("button", { name: "Proceed" })).toBeEnabled()
  })

  it("shows the rejection reason after a cancelled schedule", () => {
    render(
      <CreditScheduleStatusView
        schedule={schedule({
          status: "cancelled",
          invoice_unpaid: true,
          rejection_reason: "Amount not allowed",
        })}
        coverStartDraft={today}
        onCoverStartDraftChange={vi.fn()}
        onSaveCoverStart={vi.fn()}
        onProceed={vi.fn()}
        todayMinDate={today}
      />
    )

    expect(screen.getByText("Credit spend was rejected")).toBeInTheDocument()
    expect(screen.getByText("Reason: Amount not allowed")).toBeInTheDocument()
    expect(screen.queryByLabelText("Cover start date")).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Proceed" })).not.toBeInTheDocument()
  })
})
