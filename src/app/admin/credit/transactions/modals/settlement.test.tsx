import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import SettlementModal from "@/app/admin/credit/transactions/modals/settlement"
import type { CreditTransaction } from "@/types/types"
import { CreateSettlementSchema, RejectApprovalSchema } from "@/types/form-schema"

vi.mock("@/hooks/hooks", () => ({
  UseApiMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  UseApiQuery: () => ({
    data: undefined,
    isError: false,
    isLoading: false,
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
  { id: 1, amount_used: "40000.00", outstanding_amount: "40000.00", status: "approved" },
  { id: 2, amount_used: "30000.00", outstanding_amount: "30000.00", status: "approved" },
]

describe("SettlementModal", () => {
  it("shows sum of outstanding amounts for selected transactions", () => {
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

  it("shows phone field and M-Pesa label by default", () => {
    render(
      <SettlementModal
        handleDialogContextSwitch={vi.fn()}
        componentProps={{ selectedTransactions }}
      />
    )

    expect(screen.getByText(/M-Pesa phone number/i)).toBeInTheDocument()
    expect(screen.getByText("Paystack")).toBeInTheDocument()
  })
})

describe("CreateSettlementSchema", () => {
  it("requires phone for M-Pesa", () => {
    const result = CreateSettlementSchema.safeParse({
      payment_gateway: "mpesa",
      phone: "",
    })
    expect(result.success).toBe(false)
  })

  it("requires phone or email for Pesapal", () => {
    const result = CreateSettlementSchema.safeParse({
      payment_gateway: "pesapal",
      phone: "",
      email: "",
    })
    expect(result.success).toBe(false)
  })

  it("accepts Pesapal with email only", () => {
    const result = CreateSettlementSchema.safeParse({
      payment_gateway: "pesapal",
      email: "agent@example.com",
    })
    expect(result.success).toBe(true)
  })

  it("requires email for Paystack", () => {
    const result = CreateSettlementSchema.safeParse({
      payment_gateway: "paystack",
      email: "",
    })
    expect(result.success).toBe(false)
  })

  it("accepts Paystack with a valid email", () => {
    const result = CreateSettlementSchema.safeParse({
      payment_gateway: "paystack",
      email: "agent@example.com",
    })
    expect(result.success).toBe(true)
  })
})

describe("RejectApprovalSchema", () => {
  it("requires a non-empty reason", () => {
    const result = RejectApprovalSchema.safeParse({ reason: "" })
    expect(result.success).toBe(false)
  })
})
