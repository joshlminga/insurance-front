import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { CreditBalanceCard } from "@/app/admin/credit/components/CreditBalanceCard"
import type { CreditWallet } from "@/types/types"

const sampleWallet: CreditWallet = {
  allocated_balance: "100000.00",
  available_balance: "75000.00",
  pending_balance: "10000.00",
  minimum_spend_threshold: "50000.00",
}

describe("CreditBalanceCard", () => {
  it("renders four balance stats", () => {
    render(<CreditBalanceCard wallet={sampleWallet} />)

    expect(screen.getByText("Allocated")).toBeInTheDocument()
    expect(screen.getByText("Available")).toBeInTheDocument()
    expect(screen.getByText("Pending")).toBeInTheDocument()
    expect(screen.getByText("Credit floor")).toBeInTheDocument()
    expect(
      screen.getByText(
        "You must keep at least this amount available after using credit."
      )
    ).toBeInTheDocument()
  })

  it("shows empty state when wallet is null", () => {
    render(<CreditBalanceCard wallet={null} />)

    expect(screen.getByText(/No credit allocated for this location/i)).toBeInTheDocument()
  })

  it("shows loading state", () => {
    render(<CreditBalanceCard wallet={null} isLoading />)

    expect(screen.getByText(/Loading credit wallet/i)).toBeInTheDocument()
  })
})
