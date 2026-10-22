import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { OrganizationReportSummaryBoxes } from './organization-report-summary'

describe('OrganizationReportSummaryBoxes', () => {
  it('shows the API label and four default boxes', () => {
    render(
      <OrganizationReportSummaryBoxes
        summary={{
          label: 'Overall issued by Acme Brokers',
          scope: 'organization',
          can_filter_agent: true,
          overall: 10,
          success: 4,
          active: 3,
          failed: 1,
        }}
      />
    )

    expect(screen.getByTestId('report-summary-label')).toHaveTextContent(
      'Overall issued by Acme Brokers'
    )
    expect(screen.getByText('Overall')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('Success')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.queryByTestId('report-summary-cancelled')).not.toBeInTheDocument()
  })

  it('shows Cancelled when the API includes it', () => {
    render(
      <OrganizationReportSummaryBoxes
        summary={{
          label: 'Overall issued by Jane Admin',
          scope: 'user',
          can_filter_agent: false,
          overall: 5,
          success: 2,
          active: 1,
          failed: 0,
          cancelled: 2,
        }}
      />
    )

    expect(screen.getByTestId('report-summary-cancelled')).toHaveTextContent('2')
    expect(screen.getByText('Cancelled')).toBeInTheDocument()
  })
})
