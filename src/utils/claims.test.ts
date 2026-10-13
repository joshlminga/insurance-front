import { describe, expect, it } from 'vitest'
import {
  CLAIM_NOTE_WORD_LIMIT,
  confirmationMessage,
  countWords,
  displayTatBadge,
  earliestClaimNotificationDate,
  formatClaimDisplayDate,
  normalizeClaimRow,
  normalizePolicy,
  normalizePolicyHit,
  normalizeRegistration,
  readCreatedClaim,
  readGateBanners,
  resolveTatBadge,
  todayInNairobi,
} from '@/utils/claims'

describe('normalizeRegistration', () => {
  it('uppercases and removes spaces and dashes', () => {
    expect(normalizeRegistration(' kdd 123-a ')).toBe('KDD123A')
  })
})

describe('formatClaimDisplayDate', () => {
  it('formats ISO dates as DD/Month Name/YYYY', () => {
    expect(formatClaimDisplayDate('2026-10-13')).toBe('13/October/2026')
    expect(formatClaimDisplayDate('2026-01-03T00:00:00Z')).toBe('03/January/2026')
    expect(formatClaimDisplayDate(null)).toBe('—')
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

describe('displayTatBadge', () => {
  it('keeps the nested API tat.badge including closed', () => {
    expect(displayTatBadge({ tatBadge: 'closed' })).toBe('closed')
    expect(displayTatBadge({ tatBadge: 'on_track' })).toBe('on_track')
  })
})

describe('todayInNairobi', () => {
  it('uses the Nairobi calendar date', () => {
    expect(todayInNairobi(new Date('2026-10-02T22:00:00Z'))).toBe('2026-10-03')
  })
})

describe('readGateBanners', () => {
  it('maps premium / risk_note / debit_note from the API gate shape', () => {
    const banners = readGateBanners({
      premium: {
        status: 'partial',
        label: '1 of 2 instalments paid',
        warning: '1 of 2 instalments paid',
        reason: null,
      },
      risk_note: {
        passed: true,
        status: 'active',
        label: 'Active',
        reason: null,
      },
      debit_note: {
        passed: true,
        status: 'approved',
        label: 'Approved',
        reason: null,
      },
    })

    expect(banners.find((banner) => banner.key === 'premium')?.status).toBe('warning')
    expect(banners.find((banner) => banner.key === 'premium')?.message).toMatch(/instalments/i)
    expect(banners.find((banner) => banner.key === 'risk_note')?.status).toBe('pass')
    expect(banners.find((banner) => banner.key === 'debit')?.status).toBe('pass')
  })

  it('keeps debit about the issued cover and drops finance sync text', () => {
    const banners = readGateBanners({
      premium: { status: 'paid', label: 'Paid', warning: null, reason: null },
      risk_note: { passed: false, status: 'expired', label: 'Expired', reason: 'Cover is expired' },
      debit_note: { passed: true, status: 'approved', label: 'sync_status is false', reason: null },
    })

    expect(banners.find((banner) => banner.key === 'debit')?.message).toMatch(/issued/i)
    expect(banners.find((banner) => banner.key === 'debit')?.message).not.toMatch(/sync/i)
    expect(banners.find((banner) => banner.key === 'risk_note')?.status).toBe('fail')
  })
})

describe('normalizePolicyHit', () => {
  it('reads insured_name, cover_to, and vehicles[]', () => {
    const hit = normalizePolicyHit({
      certificate_id: 12,
      policy_number: 'POL-1',
      certificate_number: 'CERT-1',
      insured_name: 'Jane Doe',
      insurer_name: 'Acme',
      cover_to: '2027-01-01',
      vehicles: [
        {
          vehicle_id: 9,
          registration_number: 'KDD123A',
          make: 'Toyota',
          model: 'Axio',
          preselected: true,
        },
      ],
    })

    expect(hit?.insuredName).toBe('Jane Doe')
    expect(hit?.coverTo).toBe('2027-01-01')
    expect(hit?.registration).toBe('KDD123A')
    expect(hit?.vehicles[0]?.id).toBe('9')
  })
})

describe('normalizePolicy', () => {
  it('reads data.gate, data.policy, data.vehicles, and data.documents', () => {
    const policy = normalizePolicy({
      data: {
        certificate_id: 12,
        gate: {
          premium: { status: 'unpaid', label: 'Nothing paid', reason: 'Nothing has been paid' },
          risk_note: { passed: true, status: 'active', label: 'Active', reason: null },
          debit_note: { passed: true, status: 'approved', label: 'Approved', reason: null },
        },
        policy: {
          certificate_id: 12,
          policy_number: 'POL-1',
          certificate_number: 'CERT-1',
          insured_name: 'Jane Doe',
          insured_email: 'jane@example.com',
          insured_phone: '0712345678',
          organization_name: 'LOLC',
          insurer_name: 'Acme',
          insurer_email: 'claims@acme.test',
          cover_from: '2026-01-01',
          cover_to: '2027-01-01',
          registration_number: 'KDD123A',
        },
        vehicles: [
          { vehicle_id: 9, registration_number: 'KDD123A', make: 'Toyota', model: 'Axio', preselected: true },
        ],
        selected_vehicle_id: 9,
        documents: [
          {
            key: 'identity_card',
            label: 'National ID',
            is_mandatory: true,
            state: 'pending',
            missing_message: 'Not found on policy — please upload',
          },
        ],
      },
    })

    expect(policy?.customerName).toBe('Jane Doe')
    expect(policy?.customerEmail).toBe('jane@example.com')
    expect(policy?.organizationName).toBe('LOLC')
    expect(policy?.insurerName).toBe('Acme')
    expect(policy?.expiryDate).toBe('2027-01-01')
    expect(policy?.selectedVehicleId).toBe('9')
    expect(policy?.banners.find((banner) => banner.key === 'premium')?.status).toBe('fail')
    expect(policy?.documents[0]?.key).toBe('identity_card')
    expect(policy?.documents[0]?.found).toBe(false)
  })
})

describe('earliestClaimNotificationDate', () => {
  it('is at least 1 day after loss, and never before today', () => {
    expect(earliestClaimNotificationDate('2026-10-01', '2026-10-03')).toBe('2026-10-03')
    expect(earliestClaimNotificationDate('2026-10-02', '2026-10-03')).toBe('2026-10-03')
    expect(earliestClaimNotificationDate('2026-10-03', '2026-10-03')).toBe('2026-10-04')
  })
})

describe('normalizeClaimRow', () => {
  it('reads registration_number and nested tat.badge', () => {
    const row = normalizeClaimRow({
      uuid: 'abc',
      claim_number: 'CLM-1',
      registration_number: 'KDD123A',
      policy_number: 'POL-1',
      status: 'claim_notified',
      status_label: 'Claim Notified / Logged',
      tat: { due_date: '2026-10-20', days_remaining: 17, badge: 'on_track' },
    })

    expect(row?.registration_number).toBe('KDD123A')
    expect(row?.tat_badge).toBe('on_track')
    expect(row?.tat_due_date).toBe('2026-10-20')
  })
})

describe('readCreatedClaim', () => {
  it('reads data.claim_number and data.claim.uuid', () => {
    expect(readCreatedClaim({
      data: {
        claim_number: 'CLM-99',
        claim: { uuid: 'claim-uuid', claim_number: 'CLM-99' },
      },
    })).toEqual({ claimNumber: 'CLM-99', uuid: 'claim-uuid' })
  })
})

describe('confirmationMessage', () => {
  it('reads requires_confirmation and warnings for confirm_warnings resubmit', () => {
    const message = confirmationMessage({
      response: {
        data: {
          message: 'Warnings apply',
          data: {
            requires_confirmation: true,
            warnings: ['Mandatory documents are still outstanding'],
          },
        },
      },
    })
    expect(message).toMatch(/outstanding/i)
  })
})
