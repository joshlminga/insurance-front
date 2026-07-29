import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { buildCreditTransactionColumns } from "@/dev/columns/admin/credit/transactions"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

const transactions: CreditTransaction[] = [
  { id: 1, amount_used: "1000.00", status: "approved" },
  { id: 2, amount_used: "2000.00", status: "pending_approval" },
]

function TablePreview({
  showSelection,
  selectedIds = new Set<number>(),
}: {
  showSelection?: boolean
  selectedIds?: Set<number>
}) {
  const columns = buildCreditTransactionColumns({
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

describe("buildCreditTransactionColumns", () => {
  it("shows checkbox on approved row when selection enabled", () => {
    render(<TablePreview showSelection selectedIds={new Set([1])} />)

    const checkboxes = screen.getAllByRole("checkbox")
    expect(checkboxes.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText("Approved")).toBeInTheDocument()
  })

  it("renders status badges", () => {
    render(<TablePreview />)
    expect(screen.getByText("Approved")).toBeInTheDocument()
    expect(screen.getByText("Pending approval")).toBeInTheDocument()
  })
})
