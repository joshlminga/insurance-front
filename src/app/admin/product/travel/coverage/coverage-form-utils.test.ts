import { describe, expect, it } from "vitest"
import { TravelCoverageSchema } from "@/types/form-schema"
import {
  buildTravelCoveragePayload,
  emptyTravelCoverageFormValues,
  getTravelCoverageSeedLabels,
  mapTravelCoverageToFormValues,
} from "./coverage-form-utils"

const apiCoverage = {
  id: 7,
  name: "WORLDWIDE (NO USA&CANADA)",
  description: "Worldwide excluding USA and Canada",
  is_active: true,
  continents: [
    { id: 1, zone_id: 10, name: "Africa" },
    { id: 2, zone_id: 11, name: "Europe" },
  ],
  included_countries: [{ id: 50, zone_id: 20, name: "Kenya" }],
  exclude_countries: [
    { id: 80, zone_id: 21, name: "United States" },
    { id: 81, zone_id: 22, name: "Canada" },
  ],
}

describe("mapTravelCoverageToFormValues", () => {
  it("pulls taxonomy ids (not zone_id) into string arrays for multi-select", () => {
    expect(mapTravelCoverageToFormValues(apiCoverage)).toEqual({
      name: "WORLDWIDE (NO USA&CANADA)",
      description: "Worldwide excluding USA and Canada",
      continents: ["1", "2"],
      included_countries: ["50"],
      exclude_countries: ["80", "81"],
    })
  })
})

describe("getTravelCoverageSeedLabels", () => {
  it("keeps id+name so edit screens can show selected options", () => {
    expect(getTravelCoverageSeedLabels(apiCoverage).continents).toEqual([
      { id: 1, name: "Africa" },
      { id: 2, name: "Europe" },
    ])
  })
})

describe("buildTravelCoveragePayload", () => {
  it("converts string ids to numbers and empty description to null", () => {
    const form = TravelCoverageSchema.parse({
      ...emptyTravelCoverageFormValues(),
      name: "Schengen",
      description: "  ",
      continents: ["3", "4"],
      included_countries: ["9"],
      exclude_countries: ["12"],
    })

    expect(buildTravelCoveragePayload(form)).toEqual({
      name: "Schengen",
      description: null,
      continents: [3, 4],
      included_countries: [9],
      exclude_countries: [12],
    })
  })
})

describe("TravelCoverageSchema", () => {
  it("rejects exclude countries that also appear in included", () => {
    const result = TravelCoverageSchema.safeParse({
      name: "Overlap",
      description: "",
      continents: ["1"],
      included_countries: ["5"],
      exclude_countries: ["5", "6"],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("exclude_countries"))).toBe(
        true
      )
    }
  })

  it("requires at least one continent", () => {
    const result = TravelCoverageSchema.safeParse({
      name: "Empty continents",
      continents: [],
      included_countries: [],
      exclude_countries: [],
    })
    expect(result.success).toBe(false)
  })
})
