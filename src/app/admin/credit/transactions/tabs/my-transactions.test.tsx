import { describe, expect, it, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { CreditTransaction } from "@/types/types"

const mockTransactions: CreditTransaction[] = [
  {
    id: 1,
    amount_used: "40000.00",
    outstanding_amount: "40000.00",
    status: "approved",
  },
  {
    id: 2,
    amount_used: "20000.00",
    outstanding_amount: "0.00",
    status: "approved",
  },
  {
    id: 3,
    amount_used: "10000.00",
    outstanding_amount: "10000.00",
    status: "pending_approval",
  },
]

const canModuleAction = vi.fn()
const handleDialogContextSwitch = vi.fn()

vi.mock("@/auth/useCan", () => ({
  useCan: () => ({
    canModuleAction,
  }),
}))

vi.mock("@/hooks/hooks", () => ({
  UseApiQuery: () => ({
    data: {
      data: mockTransactions,
      pagination: { last_page: 1, per_page: 15, current_page: 1 },
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}))

vi.mock("@/hooks", () => ({
  useCustomDialogContextFactory: () => ({
    handleDialogContextSwitch,
    dialogContent: null,
    dialogOpen: false,
  }),
  useDebounce: ({ debounceCallback }: { debounceCallback: (args: unknown) => void }) =>
    debounceCallback,
}))

vi.mock("@/dev/core", async () => {
  const actual = await vi.importActual<typeof import("@/dev/core")>("@/dev/core")
  return {
    ...actual,
    CustomDialogComponent: () => null,
  }
})

import MyTransactionsPage from "@/app/admin/credit/transactions/tabs/my-transactions"

describe("MyTransactionsPage settlement control", () => {
  beforeEach(() => {
    canModuleAction.mockReset()
    handleDialogContextSwitch.mockReset()
    canModuleAction.mockReturnValue(true)
  })

  it("shows checkboxes only on approved rows with outstanding balance", () => {
    render(<MyTransactionsPage />)

    const checkboxes = screen.getAllByRole("checkbox")
    // Header select-all + one selectable body row (id 1)
    expect(checkboxes.length).toBeGreaterThanOrEqual(2)
    expect(
      screen.getByRole("checkbox", { name: /Select transaction 1/i })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("checkbox", { name: /Select transaction 2/i })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("checkbox", { name: /Select transaction 3/i })
    ).not.toBeInTheDocument()
  })

  it("shows recharge bar even when nothing is selected", () => {
    render(<MyTransactionsPage />)

    expect(screen.getByRole("button", { name: /Recharge credit/i })).toBeDisabled()
    expect(
      screen.getByText(/Select approved outstanding transactions below/i)
    ).toBeInTheDocument()
  })

  it("shows pay bar after selecting a settleable transaction", async () => {
    const user = userEvent.setup()
    render(<MyTransactionsPage />)

    await user.click(
      screen.getByRole("checkbox", { name: /Select transaction 1/i })
    )

    expect(screen.getByText(/1 transaction\(s\) selected/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Recharge credit/i })).toBeInTheDocument()
  })

  it("hides selection when user lacks finance-control.action", () => {
    canModuleAction.mockReturnValue(false)
    render(<MyTransactionsPage />)

    expect(
      screen.queryByRole("checkbox", { name: /Select transaction 1/i })
    ).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Recharge credit/i })).not.toBeInTheDocument()
  })

  it("opens SettlementModal when Recharge credit is clicked", async () => {
    const user = userEvent.setup()
    render(<MyTransactionsPage />)

    await user.click(
      screen.getByRole("checkbox", { name: /Select transaction 1/i })
    )
    await user.click(screen.getByRole("button", { name: /Recharge credit/i }))

    expect(handleDialogContextSwitch).toHaveBeenCalledWith(
      expect.objectContaining({
        Component: expect.any(Function),
        componentProps: expect.objectContaining({
          selectedTransactions: [mockTransactions[0]],
        }),
      })
    )
  })
})
