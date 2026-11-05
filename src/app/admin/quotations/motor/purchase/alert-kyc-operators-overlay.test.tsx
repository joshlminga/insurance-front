import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { PURCHASE_SESSION_STORAGE_KEY } from '@/utils/constatnts'
import { AlertKycOperatorsOverlay } from './alert-kyc-operators-overlay'

const mutate = vi.fn()

vi.mock('@/hooks/hooks', () => ({
  UseApiQuery: () => ({
    data: {
      success: true,
      data: {
        quote_code: 'Q-MTR-TEST-001',
        operators: [
          { id: 11, name: 'Kyc Operator', email: 'kyc@example.test' },
        ],
      },
    },
    isLoading: false,
    isError: false,
  }),
  UseApiMutation: () => ({
    mutate,
    isPending: false,
  }),
}))

vi.mock('@/utils/utils', () => ({
  ShowToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('AlertKycOperatorsOverlay', () => {
  beforeEach(() => {
    sessionStorage.clear()
    sessionStorage.setItem(PURCHASE_SESSION_STORAGE_KEY, '55')
    mutate.mockReset()
  })

  it('shows the KYC alert with operator multi-select over a dimmed backdrop', () => {
    Element.prototype.scrollIntoView = () => {}

    render(
      <MemoryRouter>
        <AlertKycOperatorsOverlay />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', {
        name: 'Alert Operator to Finish KYC Process',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Q-MTR-TEST-001/)).toBeInTheDocument()
    expect(screen.queryByLabelText('Alert all')).not.toBeInTheDocument()
    expect(screen.getByText('Operators with KYC permission')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send alert' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Back to rates' })).toBeInTheDocument()

    const dialog = screen.getByRole('alertdialog')
    expect(dialog.className).toContain('bg-black/60')
    expect(dialog.className).toContain('z-[90]')
  })
})
