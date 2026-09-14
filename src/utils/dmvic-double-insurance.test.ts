import { beforeEach, describe, expect, it, vi } from "vitest"
import apiClient from "@/lib/api-client"
import { validateDoubleInsurancePreflight } from "@/utils/dmvic-double-insurance"

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

  it("returns blocked with suggested start on 422 overlapping covers", async () => {
    vi.mocked(apiClient.get).mockRejectedValue({
      response: {
        status: 422,
        data: {
          success: false,
          message: "The given data was invalid.",
          data: {
            clear: false,
            suggested_cover_start_date: "2027-01-02",
            covers: [{ certificate_number: "A12831355" }],
          },
          errors: {
            cover_start_date: [
              "This vehicle is already covered under an active policy. Please use cover start date 02/01/2027.",
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
      suggestedCoverStartDate: "2027-01-02",
      message:
        "This vehicle is already covered under an active policy. Please use cover start date 02/01/2027.",
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
