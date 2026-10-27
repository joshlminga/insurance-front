import { beforeEach, describe, expect, it, vi } from 'vitest'
import apiClient from '@/lib/api-client'
import {
  DMVIC_VALIDATE_INSURANCE_URL,
  validateInsuranceCertificate,
} from '@/utils/dmvic-validate-insurance'

vi.mock('@/lib/api-client', () => ({
  default: {
    get: vi.fn(),
  },
}))

describe('validateInsuranceCertificate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('maps snake_case success data and sends chassis when present', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        success: true,
        data: {
          certificate_number: 'A12831355',
          insurance_policy_number: 'POL-99',
          valid_from: '01/01/2026',
          valid_till: '31/12/2026',
          registration_number: 'KDY184S',
          insured_by: 'Acme Insurance',
          chassis_number: 'CHS123',
        },
      },
    })

    const result = await validateInsuranceCertificate({
      vehicleRegistrationNumber: 'KDY184S',
      certificateNumber: 'A12831355',
      chassisNumber: 'CHS123',
    })

    expect(result).toEqual({
      certificateNumber: 'A12831355',
      insurancePolicyNumber: 'POL-99',
      validFrom: '01/01/2026',
      validTill: '31/12/2026',
      registrationNumber: 'KDY184S',
      insuredBy: 'Acme Insurance',
      chassisNumber: 'CHS123',
    })

    expect(apiClient.get).toHaveBeenCalledWith(DMVIC_VALIDATE_INSURANCE_URL, {
      params: {
        vehicle_registration_number: 'KDY184S',
        certificate_number: 'A12831355',
        chassis_number: 'CHS123',
      },
    })
  })

  it('omits chassis when blank and throws when registration/cert missing', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        success: true,
        data: {
          certificate_number: 'A1',
          registration_number: 'KAA111A',
        },
      },
    })

    await validateInsuranceCertificate({
      vehicleRegistrationNumber: 'KAA111A',
      certificateNumber: 'A1',
      chassisNumber: '  ',
    })

    expect(apiClient.get).toHaveBeenCalledWith(DMVIC_VALIDATE_INSURANCE_URL, {
      params: {
        vehicle_registration_number: 'KAA111A',
        certificate_number: 'A1',
      },
    })

    await expect(
      validateInsuranceCertificate({
        vehicleRegistrationNumber: '',
        certificateNumber: 'A1',
      }),
    ).rejects.toThrow(/registration and certificate/i)
  })
})
