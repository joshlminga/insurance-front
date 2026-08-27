import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { BuildCreditTransactionColumns } from "@/dev/columns/admin/credit/transactions"
import type { CreditTransaction } from "@/types/types"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

const transactions: CreditTransaction[] = [
  { id: 1, amount_used: "1000.00", outstanding_amount: "1000.00", status: "approved" },
  { id: 2, amount_used: "2000.00", outstanding_amount: "0.00", status: "approved" },
  { id: 3, amount_used: "2000.00", status: "pending_approval" },
]

function TablePreview({
  showSelection,
  selectedIds = new Set<number>(),
}: {
  showSelection?: boolean
  selectedIds?: Set<number>
}) {
  const columns = BuildCreditTransactionColumns({
    showSelection,
    selectedIds,
    onToggleRow: vi.fn(),
    onToggleAll: vi.fn(),
  })

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <table>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

describe("BuildCreditTransactionColumns", () => {
  it("shows checkbox only on approved rows with outstanding > 0", () => {
    render(<TablePreview showSelection selectedIds={new Set([1])} />)

    // TablePreview only renders tbody cells — one selectable row (id 1).
    // Fully settled approved (id 2) and pending (id 3) have no checkbox.
    const checkboxes = screen.getAllByRole("checkbox")
    expect(checkboxes).toHaveLength(1)
    expect(screen.getAllByText("Approved").length).toBeGreaterThanOrEqual(1)
  })

  it("renders status badges", () => {
    render(<TablePreview />)
    expect(screen.getAllByText("Approved").length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText("Pending approval")).toBeInTheDocument()
  })
})
