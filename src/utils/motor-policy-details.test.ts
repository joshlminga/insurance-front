import { beforeEach, describe, expect, it, vi } from 'vitest'
import apiClient from '@/lib/api-client'
import {
  fetchMotorPolicyDetails,
  motorPolicyDetailsUrl,
} from '@/utils/motor-policy-details'

vi.mock('@/lib/api-client', () => ({
  default: {
    get: vi.fn(),
  },
}))

describe('fetchMotorPolicyDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('builds the policy-details URL for a purchase id', () => {
    expect(motorPolicyDetailsUrl('abc-123')).toBe(
      'purchase/motor/abc-123/policy-details',
    )
  })

  it('returns mapped camelCase policy fields from API data', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        success: true,
        data: {
          policyHolderName: 'Jane Doe',
          insurerName: 'Acme Insurance',
          policyCovering: 'Motor Vehicle — KDY184S',
          policyClass: 'Private Comprehensive',
          coverStartDate: '01 Oct, 2026',
          coverEndDate: '30 Sep, 2027',
        },
      },
    })

    const result = await fetchMotorPolicyDetails('purchase-1')

    expect(result).toEqual({
      policyHolderName: 'Jane Doe',
      insurerName: 'Acme Insurance',
      policyCovering: 'Motor Vehicle — KDY184S',
      policyClass: 'Private Comprehensive',
      coverStartDate: '01 Oct, 2026',
      coverEndDate: '30 Sep, 2027',
    })
    expect(apiClient.get).toHaveBeenCalledWith(
      'purchase/motor/purchase-1/policy-details',
    )
  })

  it('throws when purchase id is empty', async () => {
    await expect(fetchMotorPolicyDetails('  ')).rejects.toThrow(
      /Purchase session is missing/,
    )
    expect(apiClient.get).not.toHaveBeenCalled()
  })

  it('throws when API returns no data payload', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        success: false,
        message: 'Purchase not found.',
        data: null,
      },
    })

    await expect(fetchMotorPolicyDetails('missing')).rejects.toThrow(
      'Purchase not found.',
    )
  })
})
