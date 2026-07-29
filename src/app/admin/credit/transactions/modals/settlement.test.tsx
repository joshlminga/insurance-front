import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import SettlementModal from "@/app/admin/credit/transactions/modals/settlement"
import type { CreditTransaction } from "@/types/types"
import { RejectApprovalSchema } from "@/types/form-schema"

vi.mock("@/hooks/hooks", () => ({
  UseApiMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}))

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

const selectedTransactions: CreditTransaction[] = [
  { id: 1, amount_used: "40000.00", status: "approved" },
  { id: 2, amount_used: "30000.00", status: "approved" },
]

describe("SettlementModal", () => {
  it("shows sum of selected transaction amounts", () => {
    render(
      <SettlementModal
        handleDialogContextSwitch={vi.fn()}
        componentProps={{ selectedTransactions }}
      />
    )

    expect(screen.getByText(/70,000/)).toBeInTheDocument()
    expect(screen.getByText(/2 transaction\(s\) selected/)).toBeInTheDocument()
  })

  it("disables submit when no transactions selected", () => {
    render(
      <SettlementModal
        handleDialogContextSwitch={vi.fn()}
        componentProps={{ selectedTransactions: [] }}
      />
    )

    expect(screen.getByRole("button", { name: /Create settlement & pay/i })).toBeDisabled()
  })
})

describe("RejectApprovalSchema", () => {
  it("requires a non-empty reason", () => {
    const result = RejectApprovalSchema.safeParse({ reason: "" })
    expect(result.success).toBe(false)
  })
})
