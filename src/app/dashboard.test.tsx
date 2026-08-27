import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import type { MotorDashboardReport } from "@/types/dashboard-report"

const mockReport: MotorDashboardReport = {
  period: { date_from: "2026-08-01", date_to: "2026-08-31" },
  organization: { organization_id: 1, organization_location_id: 4 },
  summary: {
    total_customers: 12,
    total_invoices: 8,
    total_payments: "150000.00",
    active_policies: 5,
    total_premium: "45000.00",
    total_quotations: 3,
  },
  pending_quotations: {
    total: 1,
    items: [
      {
        id: 55,
        quote_code: "QT-2026-001",
        status: "in_progress",
        customer: { id: 9, name: "Jane Policyholder", email: "jane@example.com" },
        vehicle: {
          id: 1,
          registration_number: "KDA123A",
          make: "Toyota",
          model: "Corolla",
        },
      },
    ],
  },
  pending_installments: {
    total: 1,
    items: [
      {
        id: 101,
        invoice_number: "INV-101",
        purchase_id: 20,
        installment_number: 2,
        total_installments: 2,
        installment_text: "2nd Installment",
        installment_amount: "10000.00",
        status: "Pending",
        due_date: "2026-09-01",
        customer: { id: 9, name: "Jane Policyholder" },
        vehicle: { id: 1, registration_number: "KDA123A" },
      },
    ],
  },
  certificates: { total: 5, items: [] },
  failed_certificates: { total: 2, items: [] },
  recent_notifications: {
    total: 1,
    items: [
      {
        id: 1,
        event_type: "quote.started",
        category: "quote",
        occurred_at: "2026-08-15T10:00:00.000Z",
      },
    ],
  },
}

const useApiQueryResult = vi.fn()

vi.mock("@/hooks/hooks", () => ({
  UseApiQuery: () => useApiQueryResult(),
}))

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  )
  return {
    ...actual,
    Link: ({
      children,
      to,
    }: {
      children: React.ReactNode
      to: string
    }) => <a href={to}>{children}</a>,
  }
})

import DashboardPage from "@/app/dashboard"

describe("DashboardPage", () => {
  beforeEach(() => {
    useApiQueryResult.mockReturnValue({
      data: {
        success: true,
        message: "Dashboard report retrieved.",
        data: mockReport,
      },
      isLoading: false,
      isError: false,
      error: null,
    })
  })

  it("renders KPI cards from the motor dashboard API", () => {
    render(<DashboardPage />)

    expect(screen.getByText("Total Policyholders")).toBeInTheDocument()
    expect(screen.getByText("12")).toBeInTheDocument()

    expect(screen.getByText("Total Payments")).toBeInTheDocument()
    expect(screen.getByText("Active Policies")).toBeInTheDocument()
    expect(screen.getByText("5 certificates listed")).toBeInTheDocument()

    expect(screen.getByText("Total Invoices")).toBeInTheDocument()
    expect(screen.getByText("8")).toBeInTheDocument()

    expect(screen.getByText("Premiums this period")).toBeInTheDocument()
    expect(screen.getByText("Failed certificates")).toBeInTheDocument()
    expect(screen.getByText("Quotations this period")).toBeInTheDocument()
    expect(screen.getByText("3")).toBeInTheDocument()
  })

  it("renders a pending quotation row from the API list", () => {
    render(<DashboardPage />)

    expect(screen.getByText("Pending Quotations")).toBeInTheDocument()
    expect(screen.getByText("QT-2026-001")).toBeInTheDocument()
    expect(screen.getByText("KDA123A")).toBeInTheDocument()
    expect(screen.getAllByText("Jane Policyholder").length).toBeGreaterThanOrEqual(1)
  })

  it("shows the API period in the page description", () => {
    render(<DashboardPage />)

    expect(
      screen.getByText(/Period for premium & quotations: 2026-08-01 → 2026-08-31/)
    ).toBeInTheDocument()
  })

  it("shows N/A and No available data when the API errors", () => {
    useApiQueryResult.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { message: "Forbidden" },
    })

    render(<DashboardPage />)

    expect(screen.getByText("Total Policyholders")).toBeInTheDocument()
    expect(screen.getByText("Total Payments")).toBeInTheDocument()
    expect(screen.getByText("Active Policies")).toBeInTheDocument()
    expect(screen.getByText("Total Invoices")).toBeInTheDocument()
    expect(screen.getByText("Pending Quotations")).toBeInTheDocument()
    expect(screen.getByText("Pending Installments")).toBeInTheDocument()
    expect(screen.getByText("Recent Notifications")).toBeInTheDocument()

    // KPI values fall back to N/A
    expect(screen.getAllByText("N/A").length).toBeGreaterThanOrEqual(4)

    // Empty list copy
    expect(screen.getAllByText("No available data").length).toBeGreaterThanOrEqual(1)

    expect(screen.getByText("Forbidden")).toBeInTheDocument()
  })
})
