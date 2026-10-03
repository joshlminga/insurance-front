import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  TRAVEL_POLICY_SCHEDULE_READY_MS,
  extractTravelDocumentErrorMessage,
  formatTravelPolicyScheduleWait,
  isTravelPolicyScheduleReady,
  rememberTravelPaidAt,
  resolveTravelPaidAtMs,
  travelPolicyScheduleReadyInMs,
} from '@/utils/travel-success-documents'

describe('travel policy schedule readiness', () => {
  afterEach(() => {
    sessionStorage.clear()
    vi.restoreAllMocks()
  })

  it('is not ready before 5 minutes', () => {
    const paidAt = 1_000_000
    expect(isTravelPolicyScheduleReady(paidAt, paidAt + TRAVEL_POLICY_SCHEDULE_READY_MS - 1)).toBe(
      false,
    )
  })

  it('is ready at and after 5 minutes', () => {
    const paidAt = 1_000_000
    expect(isTravelPolicyScheduleReady(paidAt, paidAt + TRAVEL_POLICY_SCHEDULE_READY_MS)).toBe(
      true,
    )
    expect(
      isTravelPolicyScheduleReady(paidAt, paidAt + TRAVEL_POLICY_SCHEDULE_READY_MS + 5_000),
    ).toBe(true)
  })

  it('computes remaining ms and wait copy', () => {
    const paidAt = 0
    expect(travelPolicyScheduleReadyInMs(paidAt, 30_000)).toBe(
      TRAVEL_POLICY_SCHEDULE_READY_MS - 30_000,
    )
    expect(formatTravelPolicyScheduleWait(90_000)).toBe('Ready in 1m 30s')
    expect(formatTravelPolicyScheduleWait(45_000)).toBe('Ready in 45s')
    expect(formatTravelPolicyScheduleWait(0)).toBe('Ready to download')
  })

  it('remembers paid_at in sessionStorage for a purchase', () => {
    const first = rememberTravelPaidAt('42', 1000)
    const second = rememberTravelPaidAt('42', 9999)
    expect(first).toBe(1000)
    expect(second).toBe(1000)
  })

  it('prefers summary paid_at when valid', () => {
    const iso = '2026-10-03T12:00:00.000Z'
    const resolved = resolveTravelPaidAtMs('7', iso, 9999)
    expect(resolved).toBe(Date.parse(iso))
    expect(sessionStorage.getItem('travel_paid_at_7')).toBe(String(Date.parse(iso)))
  })
})

describe('extractTravelDocumentErrorMessage', () => {
  it('reads message from a JSON blob (422)', async () => {
    const blob = new Blob(
      [JSON.stringify({ message: 'Policy schedule is available 5 minutes after payment.' })],
      { type: 'application/json' },
    )
    const message = await extractTravelDocumentErrorMessage({
      response: { data: blob, status: 422 },
    })
    expect(message).toBe('Policy schedule is available 5 minutes after payment.')
  })

  it('falls back to response.message string', async () => {
    const message = await extractTravelDocumentErrorMessage({
      response: { data: { message: 'Purchase not paid.' } },
    })
    expect(message).toBe('Purchase not paid.')
  })
})
