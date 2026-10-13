/**
 * Pure helpers for the admin Claims screens.
 * The API is the source of truth; these only shape dates, words, and JSON
 * the pages already received (UseApiQuery returns the JSON body, which is axios response.data).
 */

export const CLAIM_PRODUCT = 'Motor'
export const CLAIM_NOTE_WORD_LIMIT = 300
export const TAT_WARNING_DAYS = 2

/** Paths under the existing axios client (auth + org header are already sent). */
export const CLAIMS_API = {
  policies: 'claims/policies',
  policy: (certificateId: number | string) => `claims/policies/${certificateId}`,
  types: 'claims/types',
  handlers: 'claims/handlers',
  claims: 'claims',
  claim: (uuid: string) => `claims/${uuid}`,
  status: (uuid: string) => `claims/${uuid}/status`,
  recheck: (uuid: string) => `claims/${uuid}/recheck`,
  documentUpload: (uuid: string, expectedDocumentId: number | string) =>
    `claims/${uuid}/documents/${expectedDocumentId}/files`,
  documentRequest: (uuid: string) => `claims/${uuid}/documents/request`,
  documentReview: (uuid: string, documentId: number | string) =>
    `claims/${uuid}/documents/${documentId}/review`,
  settings: 'claims/settings',
  requirements: 'claims/document-requirements',
  requirement: (id: number | string) => `claims/document-requirements/${id}`,
  templates: 'claims/email-templates',
  template: (type: string) => `claims/email-templates/${encodeURIComponent(type)}`,
  emails: (uuid: string) => `claims/${uuid}/emails`,
  emailPreview: (uuid: string) => `claims/${uuid}/emails/preview`,
} as const

export const POLICY_SEARCH_MODES = [
  { value: 'registration', label: 'Registration' },
  { value: 'policy_number', label: 'Policy number' },
  { value: 'certificate_number', label: 'Certificate number' },
  { value: 'customer', label: 'Customer' },
] as const

export type PolicySearchMode = (typeof POLICY_SEARCH_MODES)[number]['value']

/** Matches App\Enums\Claims\ClaimStatus exactly. */
export const CLAIM_STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  { value: 'registration_hold', label: 'Registration Hold' },
  { value: 'document_pending', label: 'Document Pending' },
  { value: 'claim_notified', label: 'Claim Notified' },
  { value: 'submitted_to_insurer', label: 'Submitted to Insurer' },
  { value: 'approved', label: 'Approved' },
  { value: 'declined', label: 'Declined' },
  { value: 'settled', label: 'Settled' },
  { value: 'reopened', label: 'Claim Reopened' },
] as const

export type TatBadge = 'on_track' | 'due_soon' | 'overdue' | 'closed'
export type GateStatus = 'pass' | 'warning' | 'fail' | 'unknown'

export type GateBanner = {
  key: 'premium' | 'risk_note' | 'debit'
  title: string
  status: GateStatus
  message: string
}

export type ClaimsPagination = {
  current_page?: number
  last_page?: number
  per_page?: number
  total?: number
}

export type ClaimListRow = {
  uuid: string
  claim_number: string
  insurer_claim_number: string | null
  registration_number: string | null
  policy_number: string | null
  status: string
  status_label: string
  tat_badge: TatBadge | null
  tat_due_date: string | null
  claimant_name: string | null
  handler_name: string | null
  loss_date: string | null
}

export type PolicyVehicle = {
  id: string
  label: string
  registrationNumber: string | null
  make: string | null
  model: string | null
  preselected: boolean
  certificateId: string | null
}

export type PolicyDocumentSlot = {
  key: string
  label: string
  mandatory: boolean
  found: boolean
  hint: string | null
  downloadUrl: string | null
  claimTypeIds: string[]
  requirementId: string | null
}

export type PolicySnapshot = {
  certificateId: string
  registration: string | null
  policyNumber: string | null
  certificateNumber: string | null
  customerName: string | null
  customerEmail: string | null
  customerPhone: string | null
  insurerName: string | null
  insurerClaimsEmail: string | null
  coverType: string | null
  issuedDate: string | null
  expiryDate: string | null
  vehicles: PolicyVehicle[]
  selectedVehicleId: string | null
  banners: GateBanner[]
  documents: PolicyDocumentSlot[]
}

export type PolicySearchHit = {
  certificateId: string
  registration: string | null
  policyNumber: string | null
  certificateNumber: string | null
  insuredName: string | null
  insurerName: string | null
  coverTo: string | null
  vehicles: PolicyVehicle[]
}

export type ClaimTypeOption = {
  id: string
  name: string
  defaultTatDays: number
}

export type ClaimDocumentSlot = {
  id: string
  label: string
  state: string
  mandatory: boolean
  requestNote: string | null
  downloadUrl: string | null
  fileName: string | null
  slotKey: string | null
}

export type ClaimHistoryItem = {
  id: string
  fromStatus: string | null
  toStatus: string
  reason: string | null
  at: string | null
  userName: string | null
}

export type ClaimDetail = ClaimListRow & {
  handlerId: string
  handlerEmail: string | null
  customerEmail: string | null
  customerPhone: string | null
  insurerClaimsEmail: string | null
  category: string
  claimTypeName: string | null
  claimedAmount: string
  tatDays: string
  notifiedToOrganizationDate: string | null
  notifiedToInsurerDate: string | null
  note: string | null
  certificateNumber: string | null
  allowedNextStatuses: { value: string; label: string }[]
  documents: ClaimDocumentSlot[]
  history: ClaimHistoryItem[]
  emails: ClaimEmailLog[]
  banners: GateBanner[]
}

export type ClaimEmailLog = {
  id: string
  subject: string
  recipients: string
  status: string
  at: string | null
}

export type ClaimEmailTemplate = {
  type: string
  label: string
  subject: string
  body: string
  placeholders: string[]
}

export type ClaimDocumentRequirement = {
  id: string
  label: string
  description: string
  mandatory: boolean
  allowsMultiple: boolean
  claimTypeIds: string[]
}

export type InsurerClaimsContact = {
  organizationId: string
  name: string
  claimsEmail: string
}

export type EmailPreview = {
  subject: string
  body: string
  warnings: string[]
}

type JsonBody = {
  data?: unknown
  pagination?: ClaimsPagination
  message?: unknown
  requires_confirmation?: unknown
}

const BANNER_COPY: Record<GateBanner['key'], Record<GateStatus, string>> = {
  premium: {
    pass: 'Premium is fully paid.',
    warning: 'Some instalments are still unpaid. You can still register this claim.',
    fail: 'No premium has been paid. This claim will be saved as Registration Hold.',
    unknown: 'Policy check did not return the premium result.',
  },
  risk_note: {
    pass: 'Risk note is active and still in force.',
    warning: 'Check the risk note before you rely on this cover.',
    fail: 'Risk note is not active. This claim will be saved as Registration Hold.',
    unknown: 'Policy check did not return the risk note result.',
  },
  debit: {
    pass: 'Debit note is approved because this cover was issued.',
    warning: 'Debit note is approved because this cover was issued.',
    fail: 'There is no issued certificate, so this cover cannot be claimed.',
    unknown: 'Policy check did not return the debit note result.',
  },
}

const FALLBACK_SLOTS: PolicyDocumentSlot[] = [
  { key: 'motor_certificate', label: 'Motor certificate', mandatory: true, found: false, hint: null, downloadUrl: null, claimTypeIds: [], requirementId: null },
  { key: 'identity_card', label: 'National ID', mandatory: true, found: false, hint: null, downloadUrl: null, claimTypeIds: [], requirementId: null },
  { key: 'vehicle_logbook', label: 'Logbook', mandatory: true, found: false, hint: null, downloadUrl: null, claimTypeIds: [], requirementId: null },
  {
    key: 'driving_licence',
    label: 'Driving licence',
    mandatory: false,
    found: false,
    hint: 'Not found on policy — please upload',
    downloadUrl: null,
    claimTypeIds: [],
    requirementId: null,
  },
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function pickString(record: Record<string, unknown> | null, keys: string[]): string | null {
  if (!record) return null
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  }
  return null
}

function pickNumber(record: Record<string, unknown> | null, keys: string[]): number | null {
  const text = pickString(record, keys)
  if (!text) return null
  const amount = Number(text)
  return Number.isFinite(amount) ? amount : null
}

function pickBool(record: Record<string, unknown>, keys: string[], fallback = false): boolean {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'boolean') return value
    if (value === 1 || value === '1' || value === 'true') return true
    if (value === 0 || value === '0' || value === 'false') return false
  }
  return fallback
}

function personName(record: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (isRecord(value)) {
      const name = pickString(value, ['name', 'full_name'])
      if (name) return name
    }
  }
  return null
}

function emailFrom(record: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.includes('@')) return value.trim()
    if (isRecord(value)) {
      const email = pickString(value, ['email', 'claims_email', 'insurer_email'])
      if (email?.includes('@')) return email
    }
  }
  return null
}

function dateOnly(value: string | null): string | null {
  if (!value) return null
  return value.slice(0, 10)
}

/** Uppercase and drop spaces/dashes so "kdd 123a" matches "KDD123A". */
export function normalizeRegistration(value: string): string {
  return value.toUpperCase().replace(/[\s-]+/g, '')
}

/** Words are split on whitespace. Empty text is 0. The claim note allows 300. */
export function countWords(value: string): number {
  const trimmed = value.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

/** Add calendar days to a YYYY-MM-DD date without shifting across time zones. */
export function addCalendarDays(isoDate: string, days: number): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate)
  if (!match) return null
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/** Today's date in Africa/Nairobi, as YYYY-MM-DD. */
export function todayInNairobi(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

export function humanizeStatus(status: string | null | undefined): string {
  if (!status) return '—'
  if (status.includes(' ')) return status
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function isClosedStatus(status: string | null | undefined): boolean {
  const value = (status ?? '').toLowerCase()
  return value === 'settled' || value === 'declined' || value.includes('closed')
}

export function isHoldStatus(status: string | null | undefined): boolean {
  return (status ?? '').toLowerCase().includes('hold')
}

/**
 * TAT badge from a due date.
 * Overdue = before today. Due soon = today through today + warning days (default 2).
 * Closed and Registration Hold claims do not show a countdown.
 */
export function resolveTatBadge(input: {
  dueDate?: string | null
  today: string
  warningDays?: number
  closed?: boolean
  onHold?: boolean
}): TatBadge | null {
  if (input.closed || input.onHold) return null
  const due = dateOnly(input.dueDate ?? null)
  const today = dateOnly(input.today)
  if (!due || !today) return null
  if (today > due) return 'overdue'
  const horizon = addCalendarDays(today, input.warningDays ?? TAT_WARNING_DAYS)
  if (horizon && due <= horizon) return 'due_soon'
  return 'on_track'
}

export function tatBadgeLabel(badge: TatBadge | string | null | undefined): string {
  if (badge === 'on_track') return 'On track'
  if (badge === 'due_soon') return 'Due soon'
  if (badge === 'overdue') return 'Overdue'
  if (badge === 'closed') return 'Closed'
  return badge ? humanizeStatus(badge) : ''
}

/** Prefer the API badge. If it is missing, work it out from the due date. */
export function displayTatBadge(input: {
  tatBadge?: string | null
  tatDueDate?: string | null
  status?: string | null
  today?: string
}): TatBadge | null {
  const api = (input.tatBadge ?? '').trim().toLowerCase().replace(/\s+/g, '_')
  if (api === 'on_track' || api === 'due_soon' || api === 'overdue' || api === 'closed') {
    return api
  }
  return resolveTatBadge({
    dueDate: input.tatDueDate,
    today: input.today ?? todayInNairobi(),
    closed: isClosedStatus(input.status),
    onHold: isHoldStatus(input.status),
  })
}

function premiumBannerStatus(status: string): GateStatus {
  if (status === 'paid') return 'pass'
  if (status === 'partial') return 'warning'
  if (status === 'unpaid') return 'fail'
  return 'unknown'
}

function riskBannerStatus(passed: boolean | null, status: string): GateStatus {
  if (passed === true) return 'pass'
  if (passed === false) return 'fail'
  if (status === 'active') return 'pass'
  if (!status) return 'unknown'
  return 'fail'
}

function debitBannerStatus(status: string, passed: boolean | null): GateStatus {
  if (status === 'approved' || passed === true) return 'pass'
  if (status === 'not_approved' || passed === false) return 'fail'
  return 'unknown'
}

function bannerMessage(key: GateBanner['key'], status: GateStatus, raw: string): string {
  if (!raw || /sync_status|finance sync|sync status/i.test(raw)) {
    return BANNER_COPY[key][status]
  }
  return raw
}

/**
 * Map API `gate` (premium / risk_note / debit_note) to the three UI banners.
 * Debit is about the certificate existing — never finance sync.
 */
export function readGateBanners(source: unknown): GateBanner[] {
  const record = isRecord(source) ? source : null
  if (!record) {
    return [
      { key: 'premium', title: 'Premium', status: 'unknown', message: BANNER_COPY.premium.unknown },
      { key: 'risk_note', title: 'Risk note', status: 'unknown', message: BANNER_COPY.risk_note.unknown },
      { key: 'debit', title: 'Debit note', status: 'unknown', message: BANNER_COPY.debit.unknown },
    ]
  }

  const premium = isRecord(record.premium) ? record.premium : null
  const risk = isRecord(record.risk_note) ? record.risk_note : isRecord(record.risk) ? record.risk : null
  const debit = isRecord(record.debit_note) ? record.debit_note : isRecord(record.debit) ? record.debit : null

  const premiumStatus = premium
    ? premiumBannerStatus((pickString(premium, ['status']) ?? '').toLowerCase())
    : 'unknown'
  const premiumMessage = premium
    ? (pickString(premium, ['warning', 'reason', 'label']) ?? '')
    : ''

  const riskPassed = risk && typeof risk.passed === 'boolean' ? risk.passed : null
  const riskStatus = risk
    ? riskBannerStatus(riskPassed, (pickString(risk, ['status']) ?? '').toLowerCase())
    : 'unknown'
  const riskMessage = risk
    ? (pickString(risk, ['reason', 'label']) ?? '')
    : ''

  const debitPassed = debit && typeof debit.passed === 'boolean' ? debit.passed : null
  const debitStatus = debit
    ? debitBannerStatus((pickString(debit, ['status']) ?? '').toLowerCase(), debitPassed)
    : 'unknown'
  const debitMessage = debit
    ? (pickString(debit, ['reason', 'label']) ?? '')
    : ''

  return [
    {
      key: 'premium',
      title: 'Premium',
      status: premiumStatus,
      message: bannerMessage('premium', premiumStatus, premiumMessage),
    },
    {
      key: 'risk_note',
      title: 'Risk note',
      status: riskStatus,
      message: bannerMessage('risk_note', riskStatus, riskMessage),
    },
    {
      key: 'debit',
      title: 'Debit note',
      status: debitStatus,
      message: bannerMessage('debit', debitStatus, debitMessage),
    },
  ]
}

export function readRecord(body: JsonBody | null | undefined, nestedKeys: string[]): Record<string, unknown> | null {
  const data = body?.data
  if (!isRecord(data)) return null
  for (const key of nestedKeys) {
    const nested = data[key]
    if (isRecord(nested)) return nested
  }
  return data
}

export function readPaginated<T>(body: JsonBody | null | undefined, nestedKeys: string[]): {
  rows: T[]
  pagination: ClaimsPagination
} {
  const top = body?.pagination ?? {}
  const data = body?.data
  if (Array.isArray(data)) {
    return { rows: data as T[], pagination: top }
  }
  if (isRecord(data)) {
    for (const key of nestedKeys) {
      if (Array.isArray(data[key])) {
        const nestedPagination = isRecord(data.pagination) ? data.pagination as ClaimsPagination : top
        return { rows: data[key] as T[], pagination: nestedPagination }
      }
    }
  }
  return { rows: [], pagination: top }
}

function idList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((item) => {
    if (typeof item === 'number' || typeof item === 'string') return String(item)
    if (isRecord(item)) return pickString(item, ['id', 'value']) ?? ''
    return ''
  }).filter(Boolean)
}

function readSlots(record: Record<string, unknown> | null): PolicyDocumentSlot[] {
  if (!record) return []
  const raw = record.documents ?? record.document_slots ?? record.document_requirements
  if (!Array.isArray(raw)) return []
  return raw.filter(isRecord).map((slot) => {
    const state = (pickString(slot, ['state']) ?? '').toLowerCase()
    const found = state === 'linked' || pickBool(slot, ['found', 'on_policy', 'linked'])
    return {
      key: pickString(slot, ['key', 'slot_key', 'code']) ?? pickString(slot, ['label']) ?? 'document',
      label: pickString(slot, ['label', 'name']) ?? 'Document',
      mandatory: pickBool(slot, ['is_mandatory', 'mandatory']),
      found,
      hint: pickString(slot, ['missing_message', 'hint', 'note', 'description']),
      downloadUrl: pickString(slot, ['download_url', 'url', 'template_url']),
      claimTypeIds: idList(slot.applicable_claim_type_ids ?? slot.claim_type_ids ?? slot.claim_types),
      requirementId: pickString(slot, ['requirement_id']),
    }
  })
}

function extrasForType(typeName: string): PolicyDocumentSlot[] {
  const name = typeName.trim().toLowerCase()
  const slots: PolicyDocumentSlot[] = []
  const repairNames = ['accident damage', 'own damage', 'windscreen', 'third party property', 'third party property damage']
  if (repairNames.includes(name)) {
    slots.push({
      key: 'repair_estimate',
      label: 'Repair estimate',
      mandatory: true,
      found: false,
      hint: null,
      downloadUrl: null,
      claimTypeIds: [],
      requirementId: null,
    })
  }
  if (name === 'total loss') {
    slots.push({
      key: 'valuation_report',
      label: 'Valuation report',
      mandatory: true,
      found: false,
      hint: null,
      downloadUrl: null,
      claimTypeIds: [],
      requirementId: null,
    })
  }
  slots.push({
    key: 'claims_journey',
    label: 'Claims journey',
    mandatory: false,
    found: false,
    hint: 'Optional',
    downloadUrl: null,
    claimTypeIds: [],
    requirementId: null,
  })
  return slots
}

/** Upload slots for the register form. API slots win; known motor slots fill any gaps. */
export function slotsForClaimType(
  apiSlots: PolicyDocumentSlot[],
  typeName: string,
  typeId: string | null,
): PolicyDocumentSlot[] {
  const base = (apiSlots.length > 0 ? apiSlots : FALLBACK_SLOTS).filter((slot) => {
    if (!slot.claimTypeIds.length || !typeId) return true
    return slot.claimTypeIds.includes(String(typeId))
  })
  const keys = new Set(base.map((slot) => slot.key))
  const labels = new Set(base.map((slot) => slot.label.toLowerCase()))
  const extras = extrasForType(typeName).filter(
    (slot) => !keys.has(slot.key) && !labels.has(slot.label.toLowerCase()),
  )
  return [...base, ...extras]
}

function readVehicles(record: Record<string, unknown>): PolicyVehicle[] {
  const raw = record.vehicles ?? record.vehicle
  const list = Array.isArray(raw) ? raw : raw ? [raw] : []
  return list.filter(isRecord).map((vehicle) => {
    const id = pickString(vehicle, ['vehicle_id', 'id']) ?? ''
    const registrationNumber = pickString(vehicle, ['registration_number', 'registration'])
    const make = pickString(vehicle, ['make'])
    const model = pickString(vehicle, ['model'])
    const label = [registrationNumber, make, model].filter(Boolean).join(' · ') || `Vehicle ${id}`
    return {
      id,
      label,
      registrationNumber,
      make,
      model,
      preselected: pickBool(vehicle, ['preselected']),
      certificateId: pickString(vehicle, ['certificate_id']),
    }
  }).filter((vehicle) => vehicle.id)
}

export function normalizePolicyHit(raw: unknown): PolicySearchHit | null {
  if (!isRecord(raw)) return null
  const certificateId = pickString(raw, ['certificate_id', 'id'])
  if (!certificateId) return null
  const vehicles = readVehicles(raw)
  const preselected = vehicles.find((vehicle) => vehicle.preselected)
  return {
    certificateId,
    registration: preselected?.registrationNumber
      ?? vehicles[0]?.registrationNumber
      ?? pickString(raw, ['registration_number', 'registration']),
    policyNumber: pickString(raw, ['policy_number']),
    certificateNumber: pickString(raw, ['certificate_number']),
    insuredName: personName(raw, ['insured_name', 'customer_name', 'customer']),
    insurerName: personName(raw, ['insurer_name', 'insurer']),
    coverTo: dateOnly(pickString(raw, ['cover_to', 'expiry_date'])),
    vehicles,
  }
}

/** Policy detail: top-level data has gate, policy, vehicles, selected_vehicle_id, documents. */
export function normalizePolicy(body: JsonBody | null | undefined): PolicySnapshot | null {
  const data = isRecord(body?.data) ? body.data : null
  if (!data) return null

  const policy = isRecord(data.policy) ? data.policy : data
  const certificateId = pickString(data, ['certificate_id'])
    ?? pickString(policy, ['certificate_id', 'id'])
  if (!certificateId) return null

  const vehicles = readVehicles(data).length ? readVehicles(data) : readVehicles(policy)
  const selected = pickString(data, ['selected_vehicle_id'])
    ?? pickString(policy, ['vehicle_id', 'selected_vehicle_id'])
  const gate = data.gate ?? policy.gate ?? data.gate_result

  return {
    certificateId,
    registration: pickString(policy, ['registration_number', 'registration']),
    policyNumber: pickString(policy, ['policy_number']),
    certificateNumber: pickString(policy, ['certificate_number']),
    customerName: personName(policy, ['insured_name', 'customer_name', 'customer']),
    customerEmail: emailFrom(policy, ['insured_email', 'customer_email', 'customer'])
      ?? pickString(policy, ['insured_email']),
    customerPhone: pickString(policy, ['insured_phone', 'customer_phone', 'phone']),
    insurerName: personName(policy, ['insurer_name', 'insurer']),
    insurerClaimsEmail: emailFrom(policy, ['insurer_email', 'insurer_claims_email', 'claims_email', 'insurer']),
    coverType: pickString(policy, ['cover_type', 'cover']),
    issuedDate: dateOnly(pickString(policy, ['cover_from', 'issued_date', 'start_date'])),
    expiryDate: dateOnly(pickString(policy, ['cover_to', 'expiry_date', 'end_date'])),
    vehicles,
    selectedVehicleId: selected
      ?? vehicles.find((vehicle) => vehicle.preselected)?.id
      ?? (vehicles.length === 1 ? vehicles[0].id : null),
    banners: readGateBanners(gate),
    documents: readSlots(data).length ? readSlots(data) : readSlots(policy),
  }
}

function tatFrom(record: Record<string, unknown>, status: string): { badge: TatBadge | null; due: string | null } {
  const tat = isRecord(record.tat) ? record.tat : null
  const due = dateOnly(
    pickString(record, ['tat_due_date', 'expected_due_date'])
      ?? (tat ? pickString(tat, ['due_date', 'due']) : null),
  )
  const badgeRaw = pickString(record, ['tat_badge']) ?? (tat ? pickString(tat, ['badge']) : null)
  return {
    due,
    badge: displayTatBadge({ tatBadge: badgeRaw, tatDueDate: due, status }),
  }
}

export function normalizeClaimRow(raw: unknown): ClaimListRow | null {
  if (!isRecord(raw)) return null
  const uuid = pickString(raw, ['uuid'])
  if (!uuid) return null
  const handler = isRecord(raw.handler) ? raw.handler : null
  const claimant = isRecord(raw.claimant) ? raw.claimant : null
  const status = pickString(raw, ['status']) ?? ''
  const tat = tatFrom(raw, status)
  return {
    uuid,
    claim_number: pickString(raw, ['claim_number']) ?? '—',
    insurer_claim_number: pickString(raw, ['insurer_claim_number']),
    registration_number: pickString(raw, ['registration_number', 'registration']),
    policy_number: pickString(raw, ['policy_number']),
    status,
    status_label: pickString(raw, ['status_label']) ?? humanizeStatus(status),
    tat_badge: tat.badge,
    tat_due_date: tat.due,
    claimant_name: claimant
      ? pickString(claimant, ['name'])
      : personName(raw, ['claimant_name', 'claimant']),
    handler_name: handler ? pickString(handler, ['name', 'full_name']) : pickString(raw, ['handler_name']),
    loss_date: dateOnly(pickString(raw, ['loss_date', 'date_of_loss'])),
  }
}

function readStatusOptions(value: unknown): { value: string; label: string }[] {
  if (!Array.isArray(value)) return []
  return value.map((item) => {
    if (typeof item === 'string') return { value: item, label: humanizeStatus(item) }
    if (!isRecord(item)) return { value: '', label: '' }
    const statusValue = pickString(item, ['value', 'status', 'name']) ?? ''
    const label = pickString(item, ['label', 'status_label']) ?? humanizeStatus(statusValue)
    return { value: statusValue, label }
  }).filter((item) => item.value)
}

function readClaimDocuments(record: Record<string, unknown>): ClaimDocumentSlot[] {
  const raw = record.documents ?? record.expected_documents
  if (!Array.isArray(raw)) return []
  return raw.filter(isRecord).map((slot, index) => {
    const files = Array.isArray(slot.files) ? slot.files.filter(isRecord) : []
    const current = files.find((file) => file.is_current === true) ?? (files.length ? files[files.length - 1] : null)
    return {
      id: pickString(slot, ['id']) ?? String(index),
      label: pickString(slot, ['label', 'name']) ?? 'Document',
      state: pickString(slot, ['state', 'status']) ?? 'pending',
      mandatory: pickBool(slot, ['is_mandatory', 'mandatory']),
      requestNote: pickString(slot, ['request_note', 'note']),
      downloadUrl: current
        ? pickString(current, ['download_url', 'url'])
        : pickString(slot, ['download_url', 'url']),
      fileName: current ? pickString(current, ['original_name', 'name', 'file_name']) : null,
      slotKey: pickString(slot, ['slot_key', 'key']),
    }
  })
}

function readHistory(record: Record<string, unknown>): ClaimHistoryItem[] {
  const raw = record.status_history ?? record.histories ?? record.status_histories
  if (!Array.isArray(raw)) return []
  return raw.filter(isRecord).map((item, index) => {
    const user = isRecord(item.user) ? item.user : null
    return {
      id: pickString(item, ['id']) ?? String(index),
      fromStatus: pickString(item, ['from_status', 'from']),
      toStatus: pickString(item, ['to_status', 'to', 'status']) ?? '—',
      reason: pickString(item, ['reason']),
      at: pickString(item, ['created_at', 'at']),
      userName: user ? pickString(user, ['name', 'full_name']) : pickString(item, ['user_name']),
    }
  })
}

function readEmailsFromRecord(record: Record<string, unknown>): ClaimEmailLog[] {
  const raw = record.emails ?? record.email_logs
  if (!Array.isArray(raw)) return []
  return raw.filter(isRecord).map((row, index) => {
    const to = row.to ?? row.recipients
    const recipientText = Array.isArray(to)
      ? to.map((item) => (typeof item === 'string' ? item : '')).filter(Boolean).join(', ')
      : pickString(row, ['recipients', 'to']) ?? ''
    return {
      id: pickString(row, ['id']) ?? String(index),
      subject: pickString(row, ['subject']) ?? '(no subject)',
      recipients: recipientText,
      status: pickString(row, ['status']) ?? '',
      at: pickString(row, ['created_at', 'sent_at']),
    }
  })
}

export function normalizeClaimDetail(body: JsonBody | null | undefined): ClaimDetail | null {
  const record = readRecord(body, ['claim'])
  const row = normalizeClaimRow(record)
  if (!record || !row) return null
  const snapshot = isRecord(record.policy) ? record.policy : isRecord(record.policy_snapshot) ? record.policy_snapshot : null
  const handler = isRecord(record.handler) ? record.handler : null
  const claimant = isRecord(record.claimant) ? record.claimant : null
  const vehicle = isRecord(record.vehicle) ? record.vehicle : null
  return {
    ...row,
    registration_number: row.registration_number
      ?? pickString(vehicle, ['registration_number', 'registration'])
      ?? pickString(snapshot, ['registration_number', 'registration']),
    policy_number: row.policy_number ?? pickString(snapshot, ['policy_number']),
    certificateNumber: pickString(record, ['certificate_number']) ?? pickString(snapshot, ['certificate_number']),
    handlerId: pickString(handler, ['id']) ?? pickString(record, ['handler_id']) ?? '',
    handlerEmail: handler ? pickString(handler, ['email']) : emailFrom(record, ['handler_email', 'handler']),
    customerEmail: claimant
      ? pickString(claimant, ['email'])
      : emailFrom(record, ['customer_email', 'claimant_email', 'claimant']),
    customerPhone: claimant
      ? pickString(claimant, ['phone'])
      : pickString(record, ['claimant_phone', 'customer_phone']),
    insurerClaimsEmail: pickString(record, ['insurer_email'])
      ?? emailFrom(record, ['insurer_claims_email', 'claims_email', 'insurer']),
    category: pickString(record, ['category_label', 'category']) ?? 'General',
    claimTypeName: personName(record, ['claim_type']) ?? pickString(
      isRecord(record.claim_type) ? record.claim_type : null,
      ['name'],
    ),
    claimedAmount: pickString(record, ['claimed_amount']) ?? '',
    tatDays: pickString(record, ['tat_days']) ?? '',
    notifiedToOrganizationDate: dateOnly(pickString(record, ['notified_to_organization_date'])),
    notifiedToInsurerDate: dateOnly(pickString(record, ['notified_to_insurer_date'])),
    note: pickString(record, ['note']),
    allowedNextStatuses: readStatusOptions(record.allowed_next_statuses ?? record.next_statuses),
    documents: readClaimDocuments(record),
    history: readHistory(record),
    emails: readEmailsFromRecord(record),
    banners: readGateBanners(record.gate ?? record.gate_result),
    claimant_name: row.claimant_name
      ?? (claimant ? pickString(claimant, ['name']) : null),
    loss_date: row.loss_date ?? dateOnly(pickString(record, ['loss_date'])),
  }
}

export function normalizeClaimTypes(body: JsonBody | null | undefined): ClaimTypeOption[] {
  const { rows } = readPaginated<unknown>(body, ['types', 'claim_types'])
  return rows.filter(isRecord).map((row) => ({
    id: pickString(row, ['id']) ?? '',
    name: pickString(row, ['name', 'label']) ?? 'Type',
    defaultTatDays: pickNumber(row, ['default_tat_days', 'tat_days']) ?? 14,
  })).filter((row) => row.id)
}

export function readCreatedClaim(body: JsonBody | null | undefined): { claimNumber: string | null; uuid: string | null } {
  const data = isRecord(body?.data) ? body.data : null
  const claim = data && isRecord(data.claim) ? data.claim : data
  return {
    claimNumber: pickString(data, ['claim_number']) ?? pickString(claim, ['claim_number']),
    uuid: pickString(claim, ['uuid']),
  }
}

export function readCreatedTypeId(body: JsonBody | null | undefined): string | null {
  const record = readRecord(body, ['claim_type', 'type'])
  return pickString(record, ['id'])
}

/** 422 with data.requires_confirmation (+ warnings) means resubmit with confirm_warnings: true. */
export function confirmationMessage(error: unknown): string | null {
  const response = (error as { response?: { data?: unknown } })?.response?.data
  if (!isRecord(response)) return null
  const nested = isRecord(response.data) ? response.data : null
  const flagged = response.requires_confirmation === true || nested?.requires_confirmation === true
  if (!flagged) return null

  const warnings = Array.isArray(nested?.warnings)
    ? nested.warnings.filter((item): item is string => typeof item === 'string')
    : Array.isArray(response.warnings)
      ? response.warnings.filter((item): item is string => typeof item === 'string')
      : []

  if (warnings.length) return warnings.join('\n')

  return pickString(response, ['message'])
    ?? (nested ? pickString(nested, ['message']) : null)
    ?? 'Confirm to continue with this status.'
}

export function normalizeEmailLogs(body: JsonBody | null | undefined): ClaimEmailLog[] {
  const { rows } = readPaginated<unknown>(body, ['emails', 'logs'])
  return rows.filter(isRecord).map((row, index) => {
    const recipients = row.to ?? row.recipients
    const recipientText = Array.isArray(recipients)
      ? recipients.map((item) => (typeof item === 'string' ? item : '')).filter(Boolean).join(', ')
      : pickString(row, ['recipients', 'to']) ?? ''
    return {
      id: pickString(row, ['id']) ?? String(index),
      subject: pickString(row, ['subject']) ?? '(no subject)',
      recipients: recipientText,
      status: pickString(row, ['status']) ?? '',
      at: pickString(row, ['created_at', 'sent_at']),
    }
  })
}

export function normalizeTemplates(body: JsonBody | null | undefined): ClaimEmailTemplate[] {
  const { rows } = readPaginated<unknown>(body, ['email_templates', 'templates'])
  return rows.filter(isRecord).map((row) => {
    const type = pickString(row, ['type', 'key', 'id']) ?? ''
    return {
      type,
      label: pickString(row, ['label', 'name']) ?? humanizeStatus(type),
      subject: pickString(row, ['subject']) ?? '',
      body: pickString(row, ['body']) ?? '',
      placeholders: Array.isArray(row.placeholders)
        ? row.placeholders.filter((item): item is string => typeof item === 'string')
        : [],
    }
  }).filter((row) => row.type)
}

export function readEmailPreview(body: JsonBody | null | undefined): EmailPreview | null {
  const record = readRecord(body, ['preview', 'email'])
  if (!record) return null
  const subject = pickString(record, ['subject'])
  const message = pickString(record, ['body', 'html', 'message'])
  if (!subject && !message) return null
  const warnings = Array.isArray(record.warnings)
    ? record.warnings.filter((item): item is string => typeof item === 'string')
    : []
  return { subject: subject ?? '', body: message ?? '', warnings }
}

export function normalizeRequirements(body: JsonBody | null | undefined): ClaimDocumentRequirement[] {
  const { rows } = readPaginated<unknown>(body, ['document_requirements', 'requirements'])
  return rows.filter(isRecord).map((row) => ({
    id: pickString(row, ['id']) ?? '',
    label: pickString(row, ['label', 'name']) ?? 'Document',
    description: pickString(row, ['description']) ?? '',
    mandatory: pickBool(row, ['is_mandatory', 'mandatory']),
    allowsMultiple: pickBool(row, ['allows_multiple', 'multiple', 'multiple_files']),
    claimTypeIds: idList(row.applicable_claim_type_ids ?? row.claim_type_ids ?? row.claim_types),
  })).filter((row) => row.id)
}

export function normalizeSettingsInsurer(body: JsonBody | null | undefined): InsurerClaimsContact | null {
  const record = readRecord(body, [])
  if (!record) return null
  const organizationId = pickString(record, ['insurer_organization_id'])
  if (!organizationId) return null
  return {
    organizationId,
    name: pickString(record, ['insurer_name', 'name']) ?? 'Insurer',
    claimsEmail: pickString(record, ['claims_email', 'email']) ?? '',
  }
}

export function normalizeInsurers(body: JsonBody | null | undefined): InsurerClaimsContact[] {
  const { rows } = readPaginated<unknown>(body, ['insurers', 'organizations'])
  return rows.filter(isRecord).map((row) => ({
    organizationId: pickString(row, ['organization_location_id', 'organization_id', 'id']) ?? '',
    name: pickString(row, ['organization_name', 'name']) ?? 'Insurer',
    claimsEmail: pickString(row, ['claims_email', 'email']) ?? '',
  })).filter((row) => row.organizationId)
}

export function formatClaimAmount(value: string | null | undefined): string {
  if (!value) return '—'
  const amount = Number(value)
  if (!Number.isFinite(amount)) return value
  return amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
