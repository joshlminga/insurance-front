import { describe, expect, it } from 'vitest'
import {
  CLAIM_NOTE_WORD_LIMIT,
  countWords,
  normalizeRegistration,
  readGateBanners,
  resolveTatBadge,
  todayInNairobi,
} from '@/utils/claims'

describe('normalizeRegistration', () => {
  it('uppercases and removes spaces and dashes', () => {
    expect(normalizeRegistration(' kdd 123-a ')).toBe('KDD123A')
  })
})

describe('countWords', () => {
  it('counts words and ignores extra spaces', () => {
    expect(countWords('  one   two three ')).toBe(3)
    expect(countWords('')).toBe(0)
  })

  it(`treats ${CLAIM_NOTE_WORD_LIMIT} words as the note limit`, () => {
    const note = Array.from({ length: CLAIM_NOTE_WORD_LIMIT }, () => 'word').join(' ')
    expect(countWords(note)).toBe(CLAIM_NOTE_WORD_LIMIT)
    expect(countWords(`${note} extra`)).toBe(CLAIM_NOTE_WORD_LIMIT + 1)
  })
})

describe('resolveTatBadge', () => {
  it('is overdue when the due date is before today', () => {
    expect(resolveTatBadge({ dueDate: '2026-10-01', today: '2026-10-03' })).toBe('overdue')
  })

  it('is due soon on the due date and inside the warning window', () => {
    expect(resolveTatBadge({ dueDate: '2026-10-03', today: '2026-10-03' })).toBe('due_soon')
    expect(resolveTatBadge({ dueDate: '2026-10-05', today: '2026-10-03', warningDays: 2 })).toBe('due_soon')
  })

  it('is on track when the due date is further out', () => {
    expect(resolveTatBadge({ dueDate: '2026-10-20', today: '2026-10-03' })).toBe('on_track')
  })

  it('hides the badge for closed or held claims', () => {
    expect(resolveTatBadge({ dueDate: '2026-10-01', today: '2026-10-03', closed: true })).toBeNull()
    expect(resolveTatBadge({ dueDate: '2026-10-01', today: '2026-10-03', onHold: true })).toBeNull()
  })
})

describe('todayInNairobi', () => {
  it('uses the Nairobi calendar date', () => {
    expect(todayInNairobi(new Date('2026-10-02T22:00:00Z'))).toBe('2026-10-03')
  })
})

describe('readGateBanners', () => {
  it('keeps debit about the issued cover and drops finance sync text', () => {
    const banners = readGateBanners({
      premium: { status: 'pass', message: 'Paid' },
      risk_note: { status: 'warning', message: 'Expires soon' },
      debit: { status: 'pass', message: 'sync_status is false' },
    })

    expect(banners.find((banner) => banner.key === 'debit')?.message).toMatch(/issued/i)
    expect(banners.find((banner) => banner.key === 'debit')?.message).not.toMatch(/sync/i)
    expect(banners.find((banner) => banner.key === 'premium')?.message).toBe('Paid')
  })
})
