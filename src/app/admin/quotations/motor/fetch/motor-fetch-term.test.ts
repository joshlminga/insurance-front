import { describe, expect, it } from 'vitest'
import { motorFetchTermFromSearchParams } from './motor-fetch-term'

describe('motorFetchTermFromSearchParams', () => {
  it('returns trimmed term from the query string', () => {
    expect(
      motorFetchTermFromSearchParams(
        new URLSearchParams('term=Q-MTR-2026-000001'),
      ),
    ).toBe('Q-MTR-2026-000001')
  })

  it('trims surrounding whitespace', () => {
    expect(
      motorFetchTermFromSearchParams(new URLSearchParams('term=%20Q-ABC%20')),
    ).toBe('Q-ABC')
  })

  it('returns empty string when term is missing', () => {
    expect(motorFetchTermFromSearchParams(new URLSearchParams())).toBe('')
  })
})
