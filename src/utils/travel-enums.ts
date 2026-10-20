/**
 * Frontend mirrors of Laravel Ace travel enums.
 * Keep string values in sync with:
 * - App\Enums\Ace\TravelBound
 * - App\Enums\Ace\TravelPlan (Travel As)
 * - App\Enums\Ace\TravelTrip
 * - App\Enums\Ace\Travel\TravelBenefitType
 * - App\Enums\Ace\Travel\TravelBenefitShowIn
 */

export const TRAVEL_BOUND = {
  Inbound: 'Inbound',
  Outbound: 'Outbound',
} as const

export type TravelBoundValue = (typeof TRAVEL_BOUND)[keyof typeof TRAVEL_BOUND]

export const TRAVEL_BOUND_OPTIONS: Array<{
  value: TravelBoundValue
  label: string
  summary: string
}> = [
  {
    value: TRAVEL_BOUND.Outbound,
    label: 'Outbound',
    summary: 'Residents leaving home to travel internationally',
  },
  {
    value: TRAVEL_BOUND.Inbound,
    label: 'Inbound',
    summary: 'Visitors traveling into a destination country',
  },
]

/** "Travel As" — mirrors TravelPlan enum */
export const TRAVEL_AS = {
  Individual: 'Individual',
  Family: 'Family',
  Group: 'Group',
  Student: 'Student',
  Corporate: 'Corporate',
} as const

export type TravelAsValue = (typeof TRAVEL_AS)[keyof typeof TRAVEL_AS]

export const TRAVEL_AS_OPTIONS: Array<{
  value: TravelAsValue
  label: string
}> = [
  { value: TRAVEL_AS.Individual, label: 'Individual' },
  { value: TRAVEL_AS.Family, label: 'Family' },
  { value: TRAVEL_AS.Group, label: 'Group' },
  { value: TRAVEL_AS.Student, label: 'Student' },
  { value: TRAVEL_AS.Corporate, label: 'Corporate' },
]

export const TRAVEL_TRIP = {
  Single: 'Single',
  Multi: 'Multi',
  Annual: 'Annual',
} as const

export type TravelTripValue = (typeof TRAVEL_TRIP)[keyof typeof TRAVEL_TRIP]

export const TRAVEL_TRIP_OPTIONS: Array<{
  value: TravelTripValue
  label: string
}> = [
  { value: TRAVEL_TRIP.Single, label: 'Single' },
  { value: TRAVEL_TRIP.Multi, label: 'Multi' },
  { value: TRAVEL_TRIP.Annual, label: 'Annual' },
]

/** Mirrors App\Enums\Ace\TravelCharged */
export const TRAVEL_CHARGED = {
  Once: 'Once',
  Daily: 'Daily',
} as const

export type TravelChargedValue = (typeof TRAVEL_CHARGED)[keyof typeof TRAVEL_CHARGED]

export const TRAVEL_CHARGED_OPTIONS: Array<{
  value: TravelChargedValue
  label: string
}> = [
  { value: TRAVEL_CHARGED.Once, label: 'Once' },
  { value: TRAVEL_CHARGED.Daily, label: 'Daily' },
]

/** Mirrors App\Enums\Ace\TravelBillingFormat */
export const TRAVEL_BILLING = {
  PerPerson: 'Per Person',
  PerFamilyGroup: 'Per Family/Group',
} as const

export type TravelBillingValue = (typeof TRAVEL_BILLING)[keyof typeof TRAVEL_BILLING]

export const TRAVEL_BILLING_OPTIONS: Array<{
  value: TravelBillingValue
  label: string
}> = [
  { value: TRAVEL_BILLING.PerPerson, label: 'Per Person' },
  { value: TRAVEL_BILLING.PerFamilyGroup, label: 'Per Family/Group' },
]

/**
 * Common benefit taxonomy type — mirrors TravelBenefitType.
 * API field: `type` (only benefittravel_benefit today).
 */
export const TRAVEL_BENEFIT_TYPE = {
  Benefits: 'benefittravel_benefit',
} as const

export type TravelBenefitTypeValue =
  (typeof TRAVEL_BENEFIT_TYPE)[keyof typeof TRAVEL_BENEFIT_TYPE]

export const TRAVEL_BENEFIT_TYPE_OPTIONS: Array<{
  value: TravelBenefitTypeValue
  label: string
}> = [{ value: TRAVEL_BENEFIT_TYPE.Benefits, label: 'Benefits' }]

/**
 * Where a common benefit appears — mirrors TravelBenefitShowIn.
 * API field: `group` (all / comparison / single).
 */
export const TRAVEL_BENEFIT_SHOW_IN = {
  All: 'all',
  Comparison: 'comparison',
  Single: 'single',
} as const

export type TravelBenefitShowInValue =
  (typeof TRAVEL_BENEFIT_SHOW_IN)[keyof typeof TRAVEL_BENEFIT_SHOW_IN]

export const TRAVEL_BENEFIT_SHOW_IN_OPTIONS: Array<{
  value: TravelBenefitShowInValue
  label: string
}> = [
  { value: TRAVEL_BENEFIT_SHOW_IN.All, label: 'All' },
  { value: TRAVEL_BENEFIT_SHOW_IN.Comparison, label: 'Comparison' },
  { value: TRAVEL_BENEFIT_SHOW_IN.Single, label: 'Single' },
]

/** Human label for a Show In / group value (table cells, etc.). */
export const travelBenefitShowInLabel = (
  group: string | null | undefined
): string => {
  const match = TRAVEL_BENEFIT_SHOW_IN_OPTIONS.find((o) => o.value === group)
  return match?.label ?? (group?.trim() || '—')
}

/** Human label for a Benefit Type value. */
export const travelBenefitTypeLabel = (
  type: string | null | undefined
): string => {
  const match = TRAVEL_BENEFIT_TYPE_OPTIONS.find((o) => o.value === type)
  return match?.label ?? (type?.trim() || '—')
}

/** sessionStorage key for the progressive travel quotation form payload */
export const TRAVEL_QUOTATION_FORM_SESSION_KEY = 'travel_quotation_form'

/** sessionStorage key for quote session id from POST quotation/travel */
export const TRAVEL_QUOTE_SESSION_STORAGE_KEY = 'travel_quote_session_id'
