import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SurePremiumCarousel } from './sure-premium-carousel'

describe('SurePremiumCarousel', () => {
  it('shows insurer name only and page range, not product names', () => {
    render(
      <SurePremiumCarousel
        payload={{
          quote_code: 'Q-MTR-1',
          offers: [
            {
              rate_id: 1,
              insurer: 'APA Insurance Limited',
              vehicle_premium: 110000,
              total_duty: 760,
              total_premium: 160760,
              benefit_rows: [
                {
                  id: 1,
                  name: 'Political Violence & Terrorism',
                  text: 'Inclusive',
                  status: 'inclusive',
                },
              ],
            },
            {
              rate_id: 2,
              insurer: 'CIC Group',
              vehicle_premium: 80000,
              total_duty: 445,
              total_premium: 90445,
            },
          ],
          pagination: {
            page: 1,
            per_page: 8,
            total: 11,
            has_more: true,
          },
        }}
      />
    )

    expect(screen.getByText(/1–2 of 11|1–8 of 11/)).toBeTruthy()
    expect(screen.getByText('APA Insurance Limited')).toBeTruthy()
    expect(screen.getByText('CIC Group')).toBeTruthy()
    expect(screen.queryByText(/Motor 2024/i)).toBeNull()
    expect(screen.getByText(/next page/i)).toBeTruthy()
  })

  it('renders next/prev arrows when more than two offers', () => {
    render(
      <SurePremiumCarousel
        payload={{
          offers: [
            { insurer: 'A', total_premium: 1 },
            { insurer: 'B', total_premium: 2 },
            { insurer: 'C', total_premium: 3 },
          ],
        }}
      />
    )

    expect(screen.getByRole('button', { name: 'Previous offers' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Next offers' })).toBeTruthy()
  })
})
