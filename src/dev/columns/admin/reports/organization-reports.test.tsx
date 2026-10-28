import { render, screen } from '@testing-library/react'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { describe, expect, it } from 'vitest'
import { OrganizationQuotationReportColumns } from './organization-reports'

/**
 * Tiny table harness so we can assert column cell output
 * without mounting the full OrganizationReportPage.
 */
function QuoteColumnPreview({ row }: { row: Record<string, unknown> }) {
  const table = useReactTable({
    data: [row],
    columns: OrganizationQuotationReportColumns,
    getCoreRowModel: getCoreRowModel(),
  })
  const quoteCell = table.getRowModel().rows[0]?.getVisibleCells().find(
    (cell) => cell.column.id === 'quote_code'
  )
  if (!quoteCell) {
    return null
  }
  return <>{flexRender(quoteCell.column.columnDef.cell, quoteCell.getContext())}</>
}

describe('OrganizationQuotationReportColumns', () => {
  it('shows vehicle registration under the quote code when present', () => {
    render(
      <QuoteColumnPreview
        row={{
          quote_code: 'Q-MOTOR-1',
          vehicle: { registration_number: 'KAA 123A' },
        }}
      />
    )

    expect(screen.getByText('Q-MOTOR-1')).toBeInTheDocument()
    expect(screen.getByText('KAA 123A')).toBeInTheDocument()
  })

  it('hides registration when the row has no vehicle (e.g. travel)', () => {
    render(
      <QuoteColumnPreview
        row={{
          quote_code: 'Q-TRAVEL-1',
        }}
      />
    )

    expect(screen.getByText('Q-TRAVEL-1')).toBeInTheDocument()
    expect(screen.queryByText(/KAA/)).not.toBeInTheDocument()
  })
})
