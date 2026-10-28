import { render, screen } from '@testing-library/react'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { describe, expect, it } from 'vitest'
import {
  OrganizationMotorVehicleReportColumns,
  OrganizationQuotationReportColumns,
} from './organization-reports'

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

/** Renders every cell in the motor vehicles report row (for copy + order checks). */
function MotorVehicleRowPreview({ row }: { row: Record<string, unknown> }) {
  const table = useReactTable({
    data: [row],
    columns: OrganizationMotorVehicleReportColumns,
    getCoreRowModel: getCoreRowModel(),
  })
  const cells = table.getRowModel().rows[0]?.getVisibleCells() ?? []
  return (
    <>
      {cells.map((cell) => (
        <div key={cell.id} data-column-id={cell.column.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </div>
      ))}
    </>
  )
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

describe('OrganizationMotorVehicleReportColumns', () => {
  it('places chassis immediately after registration', () => {
    const ids = OrganizationMotorVehicleReportColumns.map(
      (col) => col.id ?? ('accessorKey' in col ? String(col.accessorKey) : '')
    )
    expect(ids[0]).toBe('registration_number')
    expect(ids[1]).toBe('chassis_number')
  })

  it('shows copy buttons for registration and chassis when values exist', () => {
    render(
      <MotorVehicleRowPreview
        row={{
          registration_number: 'KAA 123A',
          chassis_number: 'CHS-999',
          make: 'Toyota',
        }}
      />
    )

    expect(screen.getByText('KAA 123A')).toBeInTheDocument()
    expect(screen.getByText('CHS-999')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Copy' })).toHaveLength(2)
  })

  it('shows dash without copy when registration or chassis is empty', () => {
    render(
      <MotorVehicleRowPreview
        row={{
          registration_number: '',
          chassis_number: null,
          make: 'Toyota',
        }}
      />
    )

    expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(2)
    expect(screen.queryByRole('button', { name: 'Copy' })).not.toBeInTheDocument()
  })
})
