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
  documents: (uuid: string) => `claims/${uuid}/documents`,
  documentRequest: (uuid: string) => `claims/${uuid}/documents/request`,
  documentReview: (uuid: string, documentId: number | string) =>
    `claims/${uuid}/documents/${documentId}/review`,
  requirements: 'claims/document-requirements',
  requirement: (id: number | string) => `claims/document-requirements/${id}`,
  templates: 'claims/email-templates',
  template: (type: string) => `claims/email-templates/${encodeURIComponent(type)}`,
  insurers: 'claims/insurers',
  insurerEmail: (organizationId: number | string) => `claims/insurers/${organizationId}`,
  emails: (uuid: string) => `claims/${uuid}/emails`,
  emailPreview: (uuid: string) => `claims/${uuid}/emails/preview`,
  emailSend: (uuid: string) => `claims/${uuid}/emails/send`,
} as const

export const POLICY_SEARCH_MODES = [
  { value: 'registration', label: 'Registration' },
  { value: 'policy_number', label: 'Policy number' },
  { value: 'certificate_number', label: 'Certificate number' },
  { value: 'customer', label: 'Customer' },
] as const

export type PolicySearchMode = (typeof POLICY_SEARCH_MODES)[number]['value']

export const CLAIM_STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  { value: 'registration_hold', label: 'Registration Hold' },
  { value: 'document_pending', label: 'Document Pending' },
  { value: 'claim_notified', label: 'Claim Notified' },
  { value: 'submitted_to_insurer', label: 'Submitted to Insurer' },
  { value: 'approved', label: 'Approved' },
  { value: 'settled', label: 'Settled' },
  { value: 'closed', label: 'Closed' },
  { value: 'rejected', label: 'Rejected' },
] as const

export type TatBadge = 'on_track' | 'due_soon' | 'overdue'
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
  registration: string | null
  policy_number: string | null
  status: string
  status_label: string
  tat_badge: TatBadge | null
  tat_due_date: string | null
  claimant_name: string | null
  handler_name: string | null
  date_of_loss: string | null
}

export type PolicyVehicle = {
  id: string
  label: string
}

export type PolicyDocumentSlot = {
  key: string
  label: string
  mandatory: boolean
  found: boolean
  hint: string | null
  downloadUrl: string | null
  claimTypeIds: string[]
}

export type PolicySnapshot = {
  certificateId: string
  registration: string | null
  policyNumber: string | null
  certificateNumber: string | null
  customerName: string | null
  customerEmail: string | null
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
  customerName: string | null
  insurerName: string | null
  expiryDate: string | null
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
  insurerClaimsEmail: string | null
  category: string
  claimTypeName: string | null
  claimedAmount: string
  expectedTatDays: string
  dateNotifiedToOrganization: string | null
  dateNotifiedToInsurer: string | null
  note: string | null
  certificateNumber: string | null
  allowedNextStatuses: { value: string; label: string }[]
  documents: ClaimDocumentSlot[]
  history: ClaimHistoryItem[]
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
  { key: 'certificate', label: 'Motor certificate', mandatory: true, found: false, hint: null, downloadUrl: null, claimTypeIds: [] },
  { key: 'id_document', label: 'National ID', mandatory: true, found: false, hint: null, downloadUrl: null, claimTypeIds: [] },
  { key: 'logbook', label: 'Logbook', mandatory: true, found: false, hint: null, downloadUrl: null, claimTypeIds: [] },
  {
    key: 'driving_licence',
    label: 'Driving licence',
    mandatory: false,
    found: false,
    hint: 'Not found on policy — please upload',
    downloadUrl: null,
    claimTypeIds: [],
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
      const email = pickString(value, ['email', 'claims_email'])
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
  return value.includes('closed') || value.includes('settled') || value.includes('reject')
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
  if (api === 'on_track' || api === 'due_soon' || api === 'overdue') return api
  return resolveTatBadge({
    dueDate: input.tatDueDate,
    today: input.today ?? todayInNairobi(),
    closed: isClosedStatus(input.status),
    onHold: isHoldStatus(input.status),
  })
}

function bannerStatus(value: unknown): GateStatus {
  if (value === true) return 'pass'
  if (value === false) return 'fail'
  const text = String(value ?? '').trim().toLowerCase()
  if (!text) return 'unknown'
  if (['pass', 'ok', 'approved', 'paid', 'success', 'confirmed', 'true', '1'].includes(text)) return 'pass'
  if (['warning', 'partial', 'partially_paid', 'partial_premium'].includes(text)) return 'warning'
  if (['unknown', 'pending'].includes(text)) return 'unknown'
  return 'fail'
}

function bannerMessage(key: GateBanner['key'], status: GateStatus, raw: string): string {
  if (!raw || /sync_status|finance sync|sync status/i.test(raw)) {
    return BANNER_COPY[key][status]
  }
  return raw
}

/** Three registration banners. Debit is about the certificate existing, never finance sync. */
export function readGateBanners(source: unknown): GateBanner[] {
  const record = isRecord(source) ? source : null
  const specs: Array<{ key: GateBanner['key']; title: string; aliases: string[] }> = [
    { key: 'premium', title: 'Premium', aliases: ['premium'] },
    { key: 'risk_note', title: 'Risk note', aliases: ['risk_note', 'risk'] },
    { key: 'debit', title: 'Debit note', aliases: ['debit', 'debit_note'] },
  ]

  return specs.map((spec) => {
    const raw = spec.aliases.map((alias) => record?.[alias]).find((value) => value != null)
    if (typeof raw === 'string' || typeof raw === 'boolean') {
      const status = bannerStatus(raw)
      return { key: spec.key, title: spec.title, status, message: BANNER_COPY[spec.key][status] }
    }
    if (isRecord(raw)) {
      const status = bannerStatus(raw.status ?? raw.result ?? raw.state)
      const message = pickString(raw, ['message', 'detail', 'label']) ?? ''
      return { key: spec.key, title: spec.title, status, message: bannerMessage(spec.key, status, message) }
    }
    return {
      key: spec.key,
      title: spec.title,
      status: 'unknown',
      message: BANNER_COPY[spec.key].unknown,
    }
  })
}

function bannersFromRecord(record: Record<string, unknown> | null): GateBanner[] {
  if (!record) return readGateBanners(null)
  const snapshot = isRecord(record.policy_snapshot) ? record.policy_snapshot : null
  const gate = isRecord(record.gate) ? record.gate : isRecord(record.gate_result) ? record.gate_result : null
  const source = record.banners ?? snapshot?.banners ?? gate?.banners ?? gate ?? snapshot?.gate
  return readGateBanners(source)
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
  return raw.filter(isRecord).map((slot) => ({
    key: pickString(slot, ['key', 'code', 'id']) ?? pickString(slot, ['label']) ?? 'document',
    label: pickString(slot, ['label', 'name']) ?? 'Document',
    mandatory: pickBool(slot, ['mandatory', 'is_mandatory']),
    found: pickBool(slot, ['found', 'on_policy', 'linked']),
    hint: pickString(slot, ['hint', 'note']),
    downloadUrl: pickString(slot, ['download_url', 'url']),
    claimTypeIds: idList(slot.claim_type_ids ?? slot.claim_types),
  }))
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
    const id = pickString(vehicle, ['id', 'vehicle_id']) ?? ''
    const registration = pickString(vehicle, ['registration', 'registration_number'])
    const make = pickString(vehicle, ['make'])
    const model = pickString(vehicle, ['model'])
    const label = [registration, make, model].filter(Boolean).join(' · ') || `Vehicle ${id}`
    return { id, label }
  }).filter((vehicle) => vehicle.id)
}

export function normalizePolicyHit(raw: unknown): PolicySearchHit | null {
  if (!isRecord(raw)) return null
  const certificateId = pickString(raw, ['certificate_id', 'id'])
  if (!certificateId) return null
  return {
    certificateId,
    registration: pickString(raw, ['registration', 'registration_number']),
    policyNumber: pickString(raw, ['policy_number']),
    certificateNumber: pickString(raw, ['certificate_number']),
    customerName: personName(raw, ['customer_name', 'customer']),
    insurerName: personName(raw, ['insurer_name', 'insurer']),
    expiryDate: dateOnly(pickString(raw, ['expiry_date'])),
  }
}

export function normalizePolicy(body: JsonBody | null | undefined): PolicySnapshot | null {
  const record = readRecord(body, ['policy', 'certificate'])
  if (!record) return null
  const certificateId = pickString(record, ['certificate_id', 'id'])
  if (!certificateId) return null
  const vehicles = readVehicles(record)
  const selected = pickString(record, ['selected_vehicle_id', 'vehicle_id'])
  return {
    certificateId,
    registration: pickString(record, ['registration', 'registration_number']),
    policyNumber: pickString(record, ['policy_number']),
    certificateNumber: pickString(record, ['certificate_number']),
    customerName: personName(record, ['customer_name', 'customer']),
    customerEmail: emailFrom(record, ['customer_email', 'customer']),
    insurerName: personName(record, ['insurer_name', 'insurer']),
    insurerClaimsEmail: emailFrom(record, ['insurer_claims_email', 'claims_email', 'insurer']),
    coverType: pickString(record, ['cover_type', 'cover']),
    issuedDate: dateOnly(pickString(record, ['issued_date', 'start_date'])),
    expiryDate: dateOnly(pickString(record, ['expiry_date', 'end_date'])),
    vehicles,
    selectedVehicleId: selected ?? (vehicles.length === 1 ? vehicles[0].id : null),
    banners: bannersFromRecord(record),
    documents: readSlots(record),
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
  const status = pickString(raw, ['status']) ?? ''
  const tat = tatFrom(raw, status)
  return {
    uuid,
    claim_number: pickString(raw, ['claim_number']) ?? '—',
    insurer_claim_number: pickString(raw, ['insurer_claim_number']),
    registration: pickString(raw, ['registration', 'registration_number']),
    policy_number: pickString(raw, ['policy_number']),
    status,
    status_label: pickString(raw, ['status_label']) ?? humanizeStatus(status),
    tat_badge: tat.badge,
    tat_due_date: tat.due,
    claimant_name: personName(raw, ['claimant_name', 'claimant']),
    handler_name: handler ? pickString(handler, ['name', 'full_name']) : pickString(raw, ['handler_name']),
    date_of_loss: dateOnly(pickString(raw, ['date_of_loss', 'loss_date'])),
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
    const latest = files.length ? files[files.length - 1] : null
    return {
      id: pickString(slot, ['id']) ?? String(index),
      label: pickString(slot, ['label', 'name']) ?? 'Document',
      state: pickString(slot, ['state', 'status']) ?? 'pending',
      mandatory: pickBool(slot, ['mandatory', 'is_mandatory']),
      requestNote: pickString(slot, ['request_note', 'note']),
      downloadUrl: latest ? pickString(latest, ['download_url', 'url']) : pickString(slot, ['download_url', 'url']),
      fileName: latest ? pickString(latest, ['original_name', 'name', 'file_name']) : null,
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

export function normalizeClaimDetail(body: JsonBody | null | undefined): ClaimDetail | null {
  const record = readRecord(body, ['claim'])
  const row = normalizeClaimRow(record)
  if (!record || !row) return null
  const snapshot = isRecord(record.policy_snapshot)
    ? record.policy_snapshot
    : isRecord(record.policy) ? record.policy : null
  const handler = isRecord(record.handler) ? record.handler : null
  return {
    ...row,
    registration: row.registration ?? pickString(snapshot, ['registration', 'registration_number']),
    policy_number: row.policy_number ?? pickString(snapshot, ['policy_number']),
    certificateNumber: pickString(record, ['certificate_number']) ?? pickString(snapshot, ['certificate_number']),
    handlerId: pickString(handler, ['id']) ?? pickString(record, ['handler_id']) ?? '',
    handlerEmail: emailFrom(record, ['handler_email', 'handler']),
    customerEmail: emailFrom(record, ['customer_email', 'customer']),
    insurerClaimsEmail: emailFrom(record, ['insurer_claims_email', 'claims_email', 'insurer']),
    category: pickString(record, ['category']) ?? 'General',
    claimTypeName: personName(record, ['claim_type_name', 'claim_type']),
    claimedAmount: pickString(record, ['claimed_amount']) ?? '',
    expectedTatDays: pickString(record, ['expected_tat_days', 'tat_days']) ?? '',
    dateNotifiedToOrganization: dateOnly(pickString(record, ['date_notified_to_organization', 'notified_at'])),
    dateNotifiedToInsurer: dateOnly(pickString(record, ['date_notified_to_insurer', 'insurer_notified_at'])),
    note: pickString(record, ['note']),
    allowedNextStatuses: readStatusOptions(record.allowed_next_statuses ?? record.next_statuses),
    documents: readClaimDocuments(record),
    history: readHistory(record),
    banners: bannersFromRecord(record),
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
  const record = readRecord(body, ['claim'])
  return {
    claimNumber: pickString(record, ['claim_number']),
    uuid: pickString(record, ['uuid']),
  }
}

export function readCreatedTypeId(body: JsonBody | null | undefined): string | null {
  const record = readRecord(body, ['claim_type', 'type'])
  return pickString(record, ['id'])
}

export function confirmationMessage(error: unknown): string | null {
  const response = (error as { response?: { data?: unknown } })?.response?.data
  if (!isRecord(response)) return null
  const nested = isRecord(response.data) ? response.data : null
  const flagged = response.requires_confirmation === true || nested?.requires_confirmation === true
  if (!flagged) return null
  return pickString(response, ['message'])
    ?? (nested ? pickString(nested, ['message']) : null)
    ?? 'Confirm to continue with this status.'
}

export function normalizeEmailLogs(body: JsonBody | null | undefined): ClaimEmailLog[] {
  const { rows } = readPaginated<unknown>(body, ['emails', 'logs'])
  return rows.filter(isRecord).map((row, index) => {
    const recipients = row.recipients
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
  return rows.filter(isRecord).map((row) => ({
    type: pickString(row, ['type', 'key', 'id']) ?? '',
    label: pickString(row, ['label', 'name']) ?? humanizeStatus(pickString(row, ['type'])),
    subject: pickString(row, ['subject']) ?? '',
    body: pickString(row, ['body']) ?? '',
    placeholders: Array.isArray(row.placeholders)
      ? row.placeholders.filter((item): item is string => typeof item === 'string')
      : [],
  })).filter((row) => row.type)
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
    mandatory: pickBool(row, ['mandatory', 'is_mandatory']),
    allowsMultiple: pickBool(row, ['allows_multiple', 'multiple', 'multiple_files']),
    claimTypeIds: idList(row.claim_type_ids ?? row.claim_types),
  })).filter((row) => row.id)
}

export function normalizeInsurers(body: JsonBody | null | undefined): InsurerClaimsContact[] {
  const { rows } = readPaginated<unknown>(body, ['insurers', 'organizations'])
  return rows.filter(isRecord).map((row) => ({
    organizationId: pickString(row, ['organization_id', 'id']) ?? '',
    name: pickString(row, ['name', 'organization_name']) ?? 'Insurer',
    claimsEmail: pickString(row, ['claims_email', 'email']) ?? '',
  })).filter((row) => row.organizationId)
}

export function formatClaimAmount(value: string | null | undefined): string {
  if (!value) return '—'
  const amount = Number(value)
  if (!Number.isFinite(amount)) return value
  return amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
