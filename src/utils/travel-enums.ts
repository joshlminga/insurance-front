/**
 * Frontend mirrors of Laravel Ace travel enums.
 * Keep string values in sync with:
 * - App\Enums\Ace\TravelBound
 * - App\Enums\Ace\TravelPlan (Travel As)
 * - App\Enums\Ace\TravelTrip
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
    value: TRAVEL_BOUND.Inbound,
    label: 'Inbound',
    summary: 'Visitors traveling into a destination country',
  },
  {
    value: TRAVEL_BOUND.Outbound,
    label: 'Outbound',
    summary: 'Residents leaving home to travel internationally',
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

/** sessionStorage key for the progressive travel quotation form payload */
export const TRAVEL_QUOTATION_FORM_SESSION_KEY = 'travel_quotation_form'
