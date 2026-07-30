import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { useForm } from "react-hook-form"
import { PoolSettingsForm } from "@/app/admin/credit/components/PoolSettingsForm"
import type { PoolSettingsFormValues } from "@/types/schema"

vi.mock("@/dev/core", () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  ReuseableInput: ({ label }: { label?: string }) => <div>{label}</div>,
  ReusableSelect: ({ label }: { label?: string }) => <div>{label}</div>,
}))

function PoolSettingsFormHarness({ requiresApproval }: { requiresApproval: boolean }) {
  const form = useForm<PoolSettingsFormValues>({
    defaultValues: {
      total_available: 100000,
      requires_approval: requiresApproval,
      auto_approve_threshold: requiresApproval ? 5000 : null,
      finance_can_override_without_payment: false,
      finance_role_id: "",
      overall_manager_role_id: "",
    },
  })

  return (
    <PoolSettingsForm
      control={form.control}
      requiresApproval={requiresApproval}
      roleOptions={[{ label: "Finance", value: "1" }]}
      onSubmit={vi.fn()}
    />
  )
}

describe("PoolSettingsForm", () => {
  it("hides auto-approve threshold when approval is disabled", () => {
    render(<PoolSettingsFormHarness requiresApproval={false} />)
    expect(screen.queryByText(/Auto-approve threshold/i)).not.toBeInTheDocument()
  })

  it("shows auto-approve threshold when approval is enabled", () => {
    render(<PoolSettingsFormHarness requiresApproval={true} />)
    expect(screen.getByText(/Auto-approve threshold/i)).toBeInTheDocument()
  })
})
