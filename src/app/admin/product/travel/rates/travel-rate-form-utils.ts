import type { TravelRateGroupFormValues } from "@/types/schema"
import {
  TRAVEL_AS,
  TRAVEL_BILLING,
  TRAVEL_CHARGED,
  TRAVEL_TRIP,
  type TravelAsValue,
  type TravelBillingValue,
  type TravelChargedValue,
  type TravelTripValue,
} from "@/utils/travel-enums"
import { toDateInputValue, toYesNo } from "../products/modals/travel-product-form-utils"

/** Empty day-band row for the nested rates field array. */
export const emptyTravelRateRow = (): TravelRateGroupFormValues["rates"][number] => ({
  id: "",
  min_days: "",
  max_days: "",
  trip: TRAVEL_TRIP.Single,
  premium: "",
  minimum: "",
  loading: "",
  description: "",
  is_active: "true",
})

export const emptyTravelRateGroupFormValues = (): TravelRateGroupFormValues => ({
  plan: TRAVEL_AS.Individual,
  charged: TRAVEL_CHARGED.Once,
  billing: TRAVEL_BILLING.PerPerson,
  min_age: "",
  max_age: "",
  min_member: "",
  max_member: "",
  start_date: "",
  expiry_date: "",
  is_maintenance: "false",
  rates: [emptyTravelRateRow()],
})

/** Empty string / NaN → null so optional API ints stay nullable. */
const toOptionalInt = (value: string | undefined): number | null => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return null
  }
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

const toOptionalNumber = (value: string | undefined): number | null => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return null
  }
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

const toOptionalDate = (value: string | undefined): string | null => {
  if (!value || !String(value).trim()) return null
  return String(value).trim()
}

export type TravelRateGroupPayload = {
  plan: TravelAsValue
  charged: TravelChargedValue
  billing: TravelBillingValue
  min_age: number | null
  max_age: number | null
  min_member: number | null
  max_member: number | null
  start_date: string | null
  expiry_date: string | null
  is_maintenance: boolean
  rates: Array<{
    id?: number
    min_days: number | null
    max_days: number | null
    trip: TravelTripValue
    premium: number | null
    minimum: number | null
    loading: string | null
    description: string | null
    is_active: boolean
  }>
}

/** Turn form strings into the POST/PATCH body the travel rates API expects. */
export const buildTravelRateGroupPayload = (
  values: TravelRateGroupFormValues
): TravelRateGroupPayload => ({
  plan: values.plan,
  charged: values.charged,
  billing: values.billing,
  min_age: toOptionalInt(values.min_age),
  max_age: toOptionalInt(values.max_age),
  min_member: toOptionalInt(values.min_member),
  max_member: toOptionalInt(values.max_member),
  start_date: toOptionalDate(values.start_date),
  expiry_date: toOptionalDate(values.expiry_date),
  is_maintenance: values.is_maintenance === "true",
  rates: values.rates.map((row) => {
    const payload: TravelRateGroupPayload["rates"][number] = {
      min_days: toOptionalInt(row.min_days),
      max_days: toOptionalInt(row.max_days),
      trip: row.trip,
      premium: toOptionalNumber(row.premium),
      minimum: toOptionalNumber(row.minimum),
      loading: row.loading?.trim() ? row.loading.trim() : null,
      description: row.description?.trim() ? row.description.trim() : null,
      is_active: row.is_active === "true",
    }
    // Include id only when editing an existing rate band (API syncs by id).
    const rateId = toOptionalInt(row.id)
    if (rateId !== null && rateId > 0) {
      payload.id = rateId
    }
    return payload
  }),
})

const toPlan = (value: unknown): TravelAsValue => {
  const plans = Object.values(TRAVEL_AS) as TravelAsValue[]
  return plans.includes(value as TravelAsValue)
    ? (value as TravelAsValue)
    : TRAVEL_AS.Individual
}

const toCharged = (value: unknown): TravelChargedValue => {
  const options = Object.values(TRAVEL_CHARGED) as TravelChargedValue[]
  return options.includes(value as TravelChargedValue)
    ? (value as TravelChargedValue)
    : TRAVEL_CHARGED.Once
}

const toBilling = (value: unknown): TravelBillingValue => {
  const options = Object.values(TRAVEL_BILLING) as TravelBillingValue[]
  return options.includes(value as TravelBillingValue)
    ? (value as TravelBillingValue)
    : TRAVEL_BILLING.PerPerson
}

const toTrip = (value: unknown): TravelTripValue => {
  const options = Object.values(TRAVEL_TRIP) as TravelTripValue[]
  return options.includes(value as TravelTripValue)
    ? (value as TravelTripValue)
    : TRAVEL_TRIP.Single
}

/** Map a GET group (or list row) into form values for the edit modal. */
export const mapTravelRateGroupToFormValues = (
  group: Record<string, unknown>
): TravelRateGroupFormValues => {
  const ratesRaw = Array.isArray(group.rates) ? group.rates : []
  const rates =
    ratesRaw.length > 0
      ? ratesRaw.map((raw) => {
          const row = raw as Record<string, unknown>
          return {
            id: row.id != null ? String(row.id) : "",
            min_days: row.min_days != null ? String(row.min_days) : "",
            max_days: row.max_days != null ? String(row.max_days) : "",
            trip: toTrip(row.trip),
            premium: row.premium != null ? String(row.premium) : "",
            minimum: row.minimum != null ? String(row.minimum) : "",
            loading: typeof row.loading === "string" ? row.loading : "",
            description: typeof row.description === "string" ? row.description : "",
            is_active: toYesNo(row.is_active),
          }
        })
      : [emptyTravelRateRow()]

  return {
    plan: toPlan(group.plan),
    charged: toCharged(group.charged),
    billing: toBilling(group.billing),
    min_age: group.min_age != null ? String(group.min_age) : "",
    max_age: group.max_age != null ? String(group.max_age) : "",
    min_member: group.min_member != null ? String(group.min_member) : "",
    max_member: group.max_member != null ? String(group.max_member) : "",
    start_date: toDateInputValue(group.start_date),
    expiry_date: toDateInputValue(group.expiry_date),
    is_maintenance: toYesNo(group.is_maintenance),
    rates,
  }
}
