import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { CreditStatusBadge } from "@/app/admin/credit/components/CreditStatusBadge"

describe("CreditStatusBadge", () => {
  it("renders approved status", () => {
    render(<CreditStatusBadge status="approved" />)
    expect(screen.getByText("Approved")).toBeInTheDocument()
  })

  it("renders pending approval status", () => {
    render(<CreditStatusBadge status="pending_approval" />)
    expect(screen.getByText("Pending approval")).toBeInTheDocument()
  })

  it("renders awaiting cover date status", () => {
    render(<CreditStatusBadge status="awaiting_cover_update" />)
    expect(screen.getByText("Awaiting cover date")).toBeInTheDocument()
  })

  it("renders cancelled status", () => {
    render(<CreditStatusBadge status="cancelled" />)
    expect(screen.getByText("Cancelled")).toBeInTheDocument()
  })

  it("renders settlement failed status", () => {
    render(<CreditStatusBadge status="failed" />)
    expect(screen.getByText("Failed")).toBeInTheDocument()
  })
})
