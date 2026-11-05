import { describe, expect, it } from 'vitest'
import {
  EMPTY_ASSISTANT,
  mapApiMessages,
  upsertMessages,
  type SureChatMessage,
} from './sure-message-sync'

describe('upsertMessages', () => {
  it('appends new ids and updates existing by id', () => {
    const prev: SureChatMessage[] = [
      { id: 'u1', role: 'user', text: 'Hello' },
    ]
    const next: SureChatMessage[] = [
      { id: 'u1', role: 'user', text: 'Hello' },
      { id: 'a1', role: 'assistant', text: 'Hi there' },
    ]

    expect(upsertMessages(prev, next)).toEqual([
      { id: 'u1', role: 'user', text: 'Hello' },
      { id: 'a1', role: 'assistant', text: 'Hi there' },
    ])
  })

  it('does not wipe a local assistant when merging partial history', () => {
    const prev: SureChatMessage[] = [
      { id: 'u1', role: 'user', text: 'Hello' },
      { id: 'a1', role: 'assistant', text: 'Full reply from POST' },
    ]
    const next: SureChatMessage[] = [
      { id: 'u1', role: 'user', text: 'Hello' },
    ]

    expect(upsertMessages(prev, next)).toEqual(prev)
  })

  it('keeps existing non-empty text when next text is blank', () => {
    const prev: SureChatMessage[] = [
      { id: 'a1', role: 'assistant', text: 'Kept' },
    ]
    const next: SureChatMessage[] = [
      { id: 'a1', role: 'assistant', text: '   ', feedback: 'up' },
    ]

    expect(upsertMessages(prev, next)).toEqual([
      { id: 'a1', role: 'assistant', text: 'Kept', feedback: 'up' },
    ])
  })

  it('keeps live premium offers when history reload has none', () => {
    const offers = {
      quote_code: 'Q-1',
      offers: [{ insurer: 'Demo', total_premium: 160760, currency: 'KES' }],
    }
    const prev: SureChatMessage[] = [
      { id: 'a1', role: 'assistant', text: 'Here are offers', offers },
    ]
    const next: SureChatMessage[] = [
      { id: 'a1', role: 'assistant', text: 'Here are offers' },
    ]

    expect(upsertMessages(prev, next)[0]?.offers).toEqual(offers)
  })

  it('keeps live comparison pdf when history reload has none', () => {
    const comparisonPdf = {
      session_id: 12,
      download_path: 'document/motor/comparison/12',
      products: [
        { product_id: 1, rate_id: 10 },
        { product_id: 2, rate_id: 20 },
      ],
    }
    const prev: SureChatMessage[] = [
      { id: 'a1', role: 'assistant', text: 'Ready', comparisonPdf },
    ]
    const next: SureChatMessage[] = [
      { id: 'a1', role: 'assistant', text: 'Ready' },
    ]

    expect(upsertMessages(prev, next)[0]?.comparisonPdf).toEqual(comparisonPdf)
  })
})

describe('mapApiMessages', () => {
  it('falls back for empty assistant bodies', () => {
    expect(
      mapApiMessages([
        { id: 'a1', role: 'assistant', text: '' },
        { id: 'u1', role: 'user', text: 'Hi' },
      ])
    ).toEqual([
      {
        id: 'a1',
        role: 'assistant',
        text: EMPTY_ASSISTANT,
        attachments: undefined,
        offers: null,
        comparisonPdf: null,
        feedback: null,
      },
      {
        id: 'u1',
        role: 'user',
        text: 'Hi',
        attachments: undefined,
        offers: null,
        comparisonPdf: null,
        feedback: null,
      },
    ])
  })

  it('restores comparison_pdf from api history rows', () => {
    const comparison_pdf = {
      session_id: 9,
      download_path: 'document/motor/comparison/9',
      products: [
        { product_id: 3, rate_id: 30 },
        { product_id: 4, rate_id: 40 },
      ],
    }

    expect(
      mapApiMessages([
        {
          id: 'a1',
          role: 'assistant',
          text: 'Comparison ready',
          comparison_pdf,
        },
      ])[0]?.comparisonPdf
    ).toEqual(comparison_pdf)
  })
})
