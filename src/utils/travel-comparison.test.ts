import { describe, expect, it } from 'vitest'
import { MAX_COMPARISONS } from '@/utils/constatnts'
import {
  buildTravelComparisonRequest,
  nextTravelQuoteSelection,
} from '@/utils/travel-comparison'

describe('buildTravelComparisonRequest', () => {
  it('maps selected quotes to product_id/rate_id and is_download', () => {
    const selected = [
      { product_id: 10, rate_id: 123, insurerName: 'A' },
      { product_id: 28, rate_id: 250, insurerName: 'B' },
    ]

    expect(buildTravelComparisonRequest(selected, false)).toEqual({
      is_download: false,
      products: [
        { product_id: 10, rate_id: 123 },
        { product_id: 28, rate_id: 250 },
      ],
    })

    expect(buildTravelComparisonRequest(selected, true).is_download).toBe(true)
  })
})

describe('nextTravelQuoteSelection', () => {
  it('adds a quote when under the max', () => {
    const { next, error } = nextTravelQuoteSelection([], {
      product_id: 1,
      rate_id: 11,
    })
    expect(error).toBeUndefined()
    expect(next).toEqual([{ product_id: 1, rate_id: 11 }])
  })

  it('removes a quote when already selected', () => {
    const prev = [
      { product_id: 1, rate_id: 11 },
      { product_id: 2, rate_id: 22 },
    ]
    const { next, error } = nextTravelQuoteSelection(prev, {
      product_id: 1,
      rate_id: 11,
    })
    expect(error).toBeUndefined()
    expect(next).toEqual([{ product_id: 2, rate_id: 22 }])
  })

  it(`blocks adding beyond MAX_COMPARISONS (${MAX_COMPARISONS})`, () => {
    const prev = [
      { product_id: 1, rate_id: 11 },
      { product_id: 2, rate_id: 22 },
      { product_id: 3, rate_id: 33 },
    ]
    const { next, error } = nextTravelQuoteSelection(prev, {
      product_id: 4,
      rate_id: 44,
    })
    expect(next).toEqual(prev)
    expect(error).toContain(String(MAX_COMPARISONS))
  })
})
