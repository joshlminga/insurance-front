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

  it('maps snake_case success data and sends registration + chassis when present', async () => {
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
        certificate_number: 'A12831355',
        vehicle_registration_number: 'KDY184S',
        chassis_number: 'CHS123',
      },
    })
  })

  it('sends registration only when chassis is blank', async () => {
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
        certificate_number: 'A1',
        vehicle_registration_number: 'KAA111A',
      },
    })
  })

  it('sends chassis only when registration is blank', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        success: true,
        data: {
          certificate_number: 'A1',
          chassis_number: 'CHS999',
        },
      },
    })

    await validateInsuranceCertificate({
      certificateNumber: 'A1',
      chassisNumber: 'CHS999',
    })

    expect(apiClient.get).toHaveBeenCalledWith(DMVIC_VALIDATE_INSURANCE_URL, {
      params: {
        certificate_number: 'A1',
        chassis_number: 'CHS999',
      },
    })
  })

  it('throws when certificate or both vehicle ids are missing', async () => {
    await expect(
      validateInsuranceCertificate({
        vehicleRegistrationNumber: '',
        certificateNumber: 'A1',
      }),
    ).rejects.toThrow(/registration or chassis/i)

    await expect(
      validateInsuranceCertificate({
        vehicleRegistrationNumber: 'KAA111A',
        certificateNumber: '',
      }),
    ).rejects.toThrow(/required to verify/i)
  })

  it('maps missing API keys to empty strings', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        success: true,
        data: {
          certificate_number: 'A12831355',
        },
      },
    })

    const result = await validateInsuranceCertificate({
      vehicleRegistrationNumber: 'KDY184S',
      certificateNumber: 'A12831355',
    })

    expect(result).toEqual({
      certificateNumber: 'A12831355',
      insurancePolicyNumber: '',
      validFrom: '',
      validTill: '',
      registrationNumber: '',
      insuredBy: '',
      chassisNumber: '',
    })
  })
})
