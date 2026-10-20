import type { TravelCoverageFormValues } from "@/types/schema"

/** One zone object from list/show: { id, zone_id, name } */
type CoverageZone = {
  id?: number | string
  zone_id?: number | string
  name?: string | null
}

export type TravelCoveragePayload = {
  name: string
  description: string | null
  continents: number[]
  included_countries: number[]
  exclude_countries: number[]
}

/** Labels for seedItems so edit multi-selects still show names not in the current search page. */
export type TravelCoverageSeedLabels = {
  continents: Array<{ id: number | string; name: string }>
  included_countries: Array<{ id: number | string; name: string }>
  exclude_countries: Array<{ id: number | string; name: string }>
}

const toIdStrings = (zones: unknown): string[] => {
  if (!Array.isArray(zones)) return []
  return zones
    .map((zone) => {
      const row = zone as CoverageZone
      // API uses taxonomy id in `id` (zone_id is the pivot row id)
      return row?.id != null ? String(row.id) : ""
    })
    .filter((id) => id !== "")
}

const toSeedItems = (zones: unknown): Array<{ id: number | string; name: string }> => {
  if (!Array.isArray(zones)) return []
  return zones
    .map((zone) => {
      const row = zone as CoverageZone
      if (row?.id == null) return null
      return {
        id: row.id,
        name: String(row.name ?? ""),
      }
    })
    .filter((item): item is { id: number | string; name: string } => item !== null)
}

const toNumberIds = (ids: string[]): number[] =>
  ids.map((id) => Number(id)).filter((n) => Number.isInteger(n) && n > 0)

export const emptyTravelCoverageFormValues = (): TravelCoverageFormValues => ({
  name: "",
  description: "",
  continents: [],
  included_countries: [],
  exclude_countries: [],
})

/** Map a coverage list/show row into react-hook-form string ids. */
export const mapTravelCoverageToFormValues = (
  coverage: Record<string, unknown>
): TravelCoverageFormValues => ({
  name: String(coverage.name ?? ""),
  description: String(coverage.description ?? ""),
  continents: toIdStrings(coverage.continents),
  included_countries: toIdStrings(coverage.included_countries),
  exclude_countries: toIdStrings(coverage.exclude_countries),
})

export const getTravelCoverageSeedLabels = (
  coverage: Record<string, unknown>
): TravelCoverageSeedLabels => ({
  continents: toSeedItems(coverage.continents),
  included_countries: toSeedItems(coverage.included_countries),
  exclude_countries: toSeedItems(coverage.exclude_countries),
})

/** Turn form strings into the JSON body for POST/PATCH travel/coverage. */
export const buildTravelCoveragePayload = (
  values: TravelCoverageFormValues
): TravelCoveragePayload => {
  const description = values.description?.trim() ?? ""
  return {
    name: values.name.trim(),
    description: description === "" ? null : description,
    continents: toNumberIds(values.continents),
    included_countries: toNumberIds(values.included_countries ?? []),
    exclude_countries: toNumberIds(values.exclude_countries ?? []),
  }
}
