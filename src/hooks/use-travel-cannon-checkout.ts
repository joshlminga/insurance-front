/**
 * Resolve whether this travel purchase uses Cannon insurer-direct M-Pesa checkout.
 * Prefers session flag set at Purchase Cover, but also syncs from purchase summary
 * so resume / admin flows still hit Cannon payment API when the flag was lost.
 */
import { UseApiQuery } from '@/hooks/hooks'
import type { SubmitResponse } from '@/types/types'
import {
  PURCHASE_SESSION_STORAGE_KEY,
  TRAVEL_CANNON_CHECKOUT_KEY,
} from '@/utils/constatnts'
import React from 'react'

type TravelCheckoutSummary = {
  checkout?: {
    provider?: string
    payment_methods?: string[]
  }
  cover?: {
    quote_reference?: string | null
    /** Cannon draft key — required before M-Pesa STK */
    policy_reference?: string | null
    product_name?: string | null
    insurer_name?: string | null
  }
}

const readPurchaseId = (): string | null => {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(PURCHASE_SESSION_STORAGE_KEY)?.trim() || null
}

const readSessionCannonFlag = (): boolean => {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(TRAVEL_CANNON_CHECKOUT_KEY) === '1'
}

export function useTravelCannonCheckout() {
  const [purchaseId] = React.useState(() => readPurchaseId())
  const [sessionCannon, setSessionCannon] = React.useState(() => readSessionCannonFlag())

  const summaryQuery = UseApiQuery<SubmitResponse>({
    url: purchaseId ? `purchase/travel/${purchaseId}/summary` : '',
    queryOptions: {
      // Always load when we have a purchase — needed if session flag was lost
      enabled: Boolean(purchaseId),
      retry: 1,
      staleTime: 30_000,
    },
  })

  const summary = (summaryQuery.data?.data ?? summaryQuery.data) as
    | TravelCheckoutSummary
    | undefined

  const apiCannon = summary?.checkout?.provider === 'cannonke'

  React.useEffect(() => {
    if (!apiCannon) {
      return
    }
    sessionStorage.setItem(TRAVEL_CANNON_CHECKOUT_KEY, '1')
    setSessionCannon(true)
  }, [apiCannon])

  const isCannon = sessionCannon || apiCannon
  const isResolving = Boolean(purchaseId) && !sessionCannon && summaryQuery.isLoading

  return {
    purchaseId,
    isCannon,
    isResolving,
    sessionCannon,
    apiCannon,
    summary,
  }
}
