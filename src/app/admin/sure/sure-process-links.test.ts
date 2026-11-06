import { describe, expect, it } from 'vitest'
import {
  sureAbsoluteProcessUrl,
  sureProcessLinkTarget,
} from './sure-process-links'

describe('sureProcessLinkTarget', () => {
  it('keeps pathname and term query for resume deep links', () => {
    expect(
      sureProcessLinkTarget(
        '/dashboard/reports/quotations/motor?term=Q-MTR-2026-000080'
      )
    ).toEqual({
      pathname: '/dashboard/reports/quotations/motor',
      search: '?term=Q-MTR-2026-000080',
    })
  })

  it('returns pathname only when there is no query', () => {
    expect(
      sureProcessLinkTarget('/dashboard/quotations/motor-quotations')
    ).toEqual({
      pathname: '/dashboard/quotations/motor-quotations',
    })
  })
})

describe('sureAbsoluteProcessUrl', () => {
  it('prefixes the current origin', () => {
    expect(
      sureAbsoluteProcessUrl('/dashboard/reports/quotations/motor?term=Q-1')
    ).toBe(`${window.location.origin}/dashboard/reports/quotations/motor?term=Q-1`)
  })
})
