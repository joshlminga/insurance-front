import { beforeEach, describe, expect, it, vi } from "vitest"
import apiClient from "@/lib/api-client"
import {
  lookupDoubleInsurance,
  validateDoubleInsurancePreflight,
} from "@/utils/dmvic-double-insurance"

vi.mock("@/lib/api-client", () => ({
  default: {
    get: vi.fn(),
  },
}))

describe("validateDoubleInsurancePreflight", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns clear when API reports clear=true", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        success: true,
        message: "No overlapping cover found for the selected dates.",
        data: {
          clear: true,
          covers: [],
          suggested_cover_start_date: null,
        },
      },
    })

    const result = await validateDoubleInsurancePreflight({
      coverStartDate: "2026-09-15",
      vehicleRegistrationNumber: "KDY184S",
    })

    expect(result).toEqual({ clear: true })
    expect(apiClient.get).toHaveBeenCalledWith(
      "dmvic/validate/double-insurance",
      expect.objectContaining({
        params: expect.objectContaining({
          policystartdate: "2026-09-15",
          vehicle_registration_number: "KDY184S",
        }),
      }),
    )
  })

  it("returns blocked with message on 422 overlapping covers (no actionable suggested start)", async () => {
    vi.mocked(apiClient.get).mockRejectedValue({
      response: {
        status: 422,
        data: {
          success: false,
          message: "The given data was invalid.",
          data: {
            clear: false,
            suggested_cover_start_date: null,
            latest_cover_expiry_date: "01/01/2027 23:59",
            covers: [{ certificate_number: "A12831355" }],
          },
          errors: {
            cover_start_date: [
              "Within the selected date range we found an active policy up to 01/01/2027. Please try different dates.",
            ],
          },
        },
      },
    })

    const result = await validateDoubleInsurancePreflight({
      coverStartDate: "2026-09-15",
      vehicleRegistrationNumber: "KDY184S",
    })

    expect(result).toEqual({
      clear: false,
      suggestedCoverStartDate: null,
      message:
        "Within the selected date range we found an active policy up to 01/01/2027. Please try different dates.",
    })
  })

  it("throws when registration and chassis are both missing", async () => {
    await expect(
      validateDoubleInsurancePreflight({
        coverStartDate: "2026-09-15",
      }),
    ).rejects.toThrow(/registration or chassis/i)

    expect(apiClient.get).not.toHaveBeenCalled()
  })
})

describe("lookupDoubleInsurance", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns clear when the API has no covers", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        success: true,
        message: "No overlapping cover found for the selected dates.",
        data: {
          clear: true,
          covers: [],
        },
      },
    })

    const result = await lookupDoubleInsurance({
      coverStartDate: "2026-09-15",
      coverEndDate: "2027-09-14",
      vehicleRegistrationNumber: "KDY184S",
    })

    expect(result).toEqual({
      registration: "KDY184S",
      startDate: "2026-09-15",
      endDate: "2027-09-14",
      clear: true,
      covers: [],
    })
    expect(apiClient.get).toHaveBeenCalledWith("dmvic/validate/double-insurance", {
      params: {
        policystartdate: "2026-09-15",
        policyenddate: "2027-09-14",
        vehicle_registration_number: "KDY184S",
      },
    })
  })

  it("returns cover rows when DMVIC responds 422 for an overlap", async () => {
    vi.mocked(apiClient.get).mockRejectedValue({
      response: {
        status: 422,
        data: {
          success: false,
          message: "The given data was invalid.",
          data: {
            clear: false,
            covers: [
              {
                certificate_number: "A12831355",
                cover_expiry_date: "01/01/2027 23:59",
                insurance_name: "Example Insurer",
                chassis_number: "CHASSIS1",
                vehicle_registration_number: "KDY184S",
              },
            ],
          },
        },
      },
    })

    const result = await lookupDoubleInsurance({
      coverStartDate: "2026-09-15",
      coverEndDate: "2027-09-14",
      vehicleRegistrationNumber: " KDY184S ",
    })

    expect(result.clear).toBe(false)
    expect(result.covers).toEqual([
      {
        certificateNumber: "A12831355",
        coverExpiryDate: "01/01/2027 23:59",
        insuranceName: "Example Insurer",
        chassisNumber: "CHASSIS1",
        vehicleRegistrationNumber: "KDY184S",
      },
    ])
  })

  it("throws when the failure is not an overlapping cover", async () => {
    const failure = Object.assign(new Error("Request failed with status code 400"), {
      response: {
        status: 400,
        data: {
          success: false,
          message: "DMVIC validate insurance request failed.",
          data: {
            clear: false,
            covers: [],
          },
        },
      },
    })
    vi.mocked(apiClient.get).mockRejectedValue(failure)

    await expect(
      lookupDoubleInsurance({
        coverStartDate: "2026-09-15",
        coverEndDate: "2027-09-14",
        vehicleRegistrationNumber: "KDY184S",
      }),
    ).rejects.toThrow(/status code 400/)
  })

  it("throws on a validation error that is not an overlap", async () => {
    vi.mocked(apiClient.get).mockRejectedValue({
      response: {
        status: 422,
        data: {
          message: "The given data was invalid.",
          errors: {
            policystartdate: ["The policystartdate field is required."],
          },
        },
      },
      message: "Request failed with status code 422",
    })

    await expect(
      lookupDoubleInsurance({
        coverStartDate: "2026-09-15",
        coverEndDate: "2027-09-14",
        vehicleRegistrationNumber: "KDY184S",
      }),
    ).rejects.toThrow(/status code 422/)
  })
})
