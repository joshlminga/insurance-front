import { formatNumber } from "@/lib/format";
import { 
  BenefitGroup, 
  InvalidVehicleRegistrationError,
  ListedBenefitResolved, 
  MotorBenefitOption, 
  MotorUserCoverInvoice,
  VehiclePreview,
} from "@/types/types";
import { FieldValues } from "react-hook-form";
import { BENEFIT_SELECT_NONE } from "./constatnts";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const currentDate = (): string => {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  }).format(new Date())
}

export const extractErrorMessage = (error: any): string => {
  const response = error?.response?.data;
  if (response?.errors && typeof response.errors === "object") {
    return Object.values(response.errors)
      .flat()
      .filter(Boolean)
      .join("\n");
  }
  if (Array.isArray(response?.message)) {
    return response.message.join("\n");
  }
  if (typeof response?.message === "string") {
    return response.message;
  }
  if (typeof response === "string") {
    return response;
  }
  return error?.message || "Submission failed!";
};

/**
 * DMVIC cover validation may return can_proceed + errors.dmvic.
 * When can_proceed is true the user may confirm and continue regardless.
 *
 * Temporarily disabled until ValidateDoubleInsurance is reliable — always
 * return null so invoice steppers show the normal toast (including the
 * required cover start date) instead of the "Continue regardless" dialog.
 * Re-enable by removing the early return below.
 */
export type DmvicValidationOverrideError = {
  canProceed: true
  messages: string[]
}

const DMVIC_OVERRIDE_DIALOG_ENABLED = false

export function getDmvicValidationOverrideError(
  error: unknown
): DmvicValidationOverrideError | null {
  if (!DMVIC_OVERRIDE_DIALOG_ENABLED) {
    return null
  }

  const response = (error as any)?.response?.data
  if (!response || response.can_proceed !== true) {
    return null
  }

  const raw = response?.errors?.dmvic
  const messages = Array.isArray(raw)
    ? raw.map((item) => String(item)).filter((item) => item.trim() !== "")
    : typeof raw === "string" && raw.trim() !== ""
      ? [raw]
      : []

  if (messages.length === 0) {
    return null
  }

  return {
    canProceed: true,
    messages,
  }
}

export function getInvalidVehicleRegistrationError(
  error: unknown
): InvalidVehicleRegistrationError | null {
  const response = (error as any)?.response?.data
  const fieldErrors = response?.errors?.vehicle_registration_number
  if (fieldErrors == null) return null

  const message = Array.isArray(fieldErrors)
    ? fieldErrors.filter(Boolean).join("\n")
    : String(fieldErrors)

  const rawPreview = response?.vehicle_preview
  const preview =
    rawPreview && typeof rawPreview === "object"
      ? (rawPreview as VehiclePreview)
      : null

  return {
    message: message || "Invalid vehicle registration number",
    preview,
  }
}

export const formatDate = (value?: string) => {
    if (!value) return '-'
    const parsedDate = new Date(value)
    if (Number.isNaN(parsedDate.getTime())) return '-'

    return parsedDate.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

export const twoDecimalformatter = (value: number | string): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0.00";
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

/** Nested taxonomy from API: { id, name } -> display label or dash */
export function formatTaxonomyName(item?: { name?: string } | null): string {
  const name = item?.name?.trim()
  return name ? name : '-'
}

/** Nullable number for table cells; avoids showing 0.00 when API sends null */
export function formatOptionalDecimal(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '-'
  }
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (Number.isNaN(num)) {
    return '-'
  }
  return twoDecimalformatter(num)
}

/** Whole number with comma separators (no decimals) for vehicle value ranges */
export function formatWholeNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '-'
  }
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (Number.isNaN(num)) {
    return '-'
  }
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Math.round(num))
}

/** Motor rate age/value: "All" when unrestricted, else "from - to" */
export function formatAllOrRange(
  isAll: boolean,
  from: number | string | null | undefined,
  to: number | string | null | undefined,
  formatValue?: (value: number | string) => string,
): string {
  if (isAll) {
    return 'All'
  }
  if (from == null && to == null) {
    return '-'
  }
  const fmt = formatValue ?? String
  const fromDisplay = from ?? 0
  if (to != null) {
    return `${fmt(fromDisplay)} - ${fmt(to)}`
  }
  return fmt(fromDisplay)
}

/** Motor rate vehicle age: null age_from means 0 years */
export function formatMotorRateAge(
  isAllAge: boolean,
  ageFrom: number | string | null | undefined,
  ageTo: number | string | null | undefined,
): string {
  return formatAllOrRange(isAllAge, ageFrom, ageTo)
}

/** Motor rate vehicle value range as whole comma-separated numbers */
export function formatMotorRateValue(
  isAllSum: boolean,
  valuedFrom: number | string | null | undefined,
  valuedTo: number | string | null | undefined,
): string {
  return formatAllOrRange(isAllSum, valuedFrom, valuedTo, formatWholeNumber)
}

/** Tonnage column: taxonomy name, numeric range, or dash */
export function formatMotorRateTonnage(row: {
  used_tonnage?: { name?: string } | null
  min_tonnage?: number | string | null
  max_tonnage?: number | string | null
}): string {
  if (row.used_tonnage?.name?.trim()) {
    return row.used_tonnage.name
  }
  if (row.min_tonnage != null && row.max_tonnage != null) {
    return `${row.min_tonnage} - ${row.max_tonnage}`
  }
  return '-'
}

export const formatCurrency = (amount: string | number) => {
    if (!amount) return ''
    return new Intl.NumberFormat('en-KE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(amount))
}


export function benefitGroupFormKey(groupLabel: string): string {
    const slug =
        groupLabel
            .trim()
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_]/g, '') || 'Other'
    return `benefit_${slug}`
}

export function benefitOptionLabel(item: MotorBenefitOption): string {
    const base =
        item.name ??
        item.label ??
        (item.reference ? `Ref ${item.reference}` : null) ??
        `Benefit ${item.id}`
    return String(base)
}


export function formatPremium(premium: unknown): string {
    const n = typeof premium === 'number' ? premium : parseFloat(String(premium))
    if (!Number.isFinite(n)) return '-'
    return formatNumber(n)
}

function formatCompulsoryPremium(premium: unknown): string {
    const base = formatPremium(premium)
    if (base === '-') return '-'
    return `${base} (c)`
}

export function resolveListedBenefitValue(item: any, listedBenefitId: number): ListedBenefitResolved {
    const benefits = item?.benefits

    const compulsory = (benefits?.compulsory ?? []) as any[]
    const compulsoryMatch = compulsory.find((b) => Number(b?.benefit_id) === listedBenefitId)
    if (compulsoryMatch) {
        return { text: formatCompulsoryPremium(compulsoryMatch?.premium), status: 'compulsory' }
    }

    const inclusive = (benefits?.inclusive ?? []) as any[]
    const inclusiveMatch = inclusive.find((b) => Number(b?.benefit_id) === listedBenefitId)
    if (inclusiveMatch) {
        const raw = inclusiveMatch?.premium
        const n = typeof raw === 'number' ? raw : parseFloat(String(raw))
        if (!Number.isFinite(n) || n === 0) return { text: 'Inclusive', status: 'inclusive' }
        return { text: formatPremium(raw), status: 'inclusive' }
    }

    const selected = (benefits?.selected ?? []) as any[]
    const selectedMatch = selected.find((b) => Number(b?.benefit_id) === listedBenefitId)
    if (selectedMatch) {
        return { text: formatPremium(selectedMatch?.premium), status: 'selected' }
    }

    const availableRaw = (benefits?.available ?? []) as Array<number | string>
    const availableIds = availableRaw.map(Number).filter((n) => Number.isFinite(n))
    return availableIds.includes(listedBenefitId)
        ? { text: 'N/A', status: 'na' }
        : { text: 'N/O', status: 'no' }
}

export function collectBenefitIdsFromValues(
    values: FieldValues,
    groups: BenefitGroup[]
): number[] {
    const ids: number[] = []
    for (const { group } of groups) {
        const key = benefitGroupFormKey(group)
        const raw = values[key]
        if (raw == null || raw === '' || raw === BENEFIT_SELECT_NONE) continue
        const n = Number(raw)
        if (Number.isFinite(n)) ids.push(n)
    }
    return ids
}

export function benefitIdsEqual(a: number[], b: number[]): boolean {
    if (a.length !== b.length) return false
    const sortedA = [...a].sort((x, y) => x - y)
    const sortedB = [...b].sort((x, y) => x - y)
    return sortedA.every((id, i) => id === sortedB[i])
}

/** API sets allow_purchase on premium/comparison rows when DMVIC stock is ready for this insurer office. */
export function canPurchaseCover(item: { allow_purchase?: boolean } | null | undefined): boolean {
    return item?.allow_purchase === true
}

export const installmentText = (invoice: MotorUserCoverInvoice) =>
    `Installment ${invoice.installment_number} of ${invoice.total_installments}`

export const currentDateTime = new Intl.DateTimeFormat("en-KE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Nairobi",
  }).format(new Date());

/** Form id field: null/undefined → empty string (never "null"). */
export const toFormId = (id: unknown): string => {
  if (id === null || id === undefined || id === "") {
    return ""
  }
  return String(id)
}

/** Form number field: null/undefined → empty string; numbers stay readable in inputs. */
export const toFormNumber = (value: unknown): string => {
  if (value === null || value === undefined || value === "") {
    return ""
  }
  return String(value)
}

/** Form date field: keep YYYY-MM-DD for HTML date inputs. */
export const toFormDate = (value: unknown): string => {
  if (value === null || value === undefined || value === "") {
    return ""
  }
  return String(value).slice(0, 10)
}

/**
 * Last covered day for N months from start: same calendar day + N months, then minus 1 day.
 * Uses local year/month/day only — never toISOString() — so UTC+ offsets (e.g. Kenya) do not shift the day.
 */
export const maxCoverEndDate = (startDateYmd: string, months = 12): string => {
  const [year, month, day] = startDateYmd.split("-").map(Number)
  // Date months are 0-based; YYYY-MM-DD months are 1-based
  const date = new Date(year, month - 1, day)
  date.setMonth(date.getMonth() + months)
  date.setDate(date.getDate() - 1)

  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/** Merge a saved select value into options when it is missing from the fetched page. */
export const mergeSelectedOption = <T extends { value: string; label: string }>(
  options: T[],
  selectedOption?: { value: string; label: string } | null,
  currentValue?: string,
): T[] => {
  if (!selectedOption || !currentValue || selectedOption.value !== currentValue) {
    return options
  }
  if (options.some((option) => option.value === selectedOption.value)) {
    return options
  }
  return [selectedOption as T, ...options]
}

/** Normalize makemodel meta arrays to numeric taxonomy ids. */
export const normalizeMakeModelIds = (items: unknown): number[] => {
  if (!Array.isArray(items)) {
    return []
  }

  return items
    .map((item) => {
      if (typeof item === "number") return item
      if (typeof item === "string") return Number(item)
      if (item && typeof item === "object") {
        return Number((item as { id?: unknown; value?: unknown }).id ?? (item as { value?: unknown }).value)
      }
      return NaN
    })
    .filter((id) => Number.isFinite(id))
}

/** Map API motor rate row into react-hook-form default values. */
export const mapMotorRateToFormValues = (rate: Record<string, unknown> | null | undefined) => {
  const meta = (rate?.meta as Record<string, unknown>) ?? {}

  return {
    coverfor_id: toFormId(rate?.coverfor_id ?? (rate?.coverfor as { id?: unknown })?.id),
    covertype_id: toFormId(rate?.covertype_id ?? (rate?.covertype as { id?: unknown })?.id),
    covering_id: toFormId(rate?.covering_id ?? (rate?.covering as { id?: unknown })?.id),
    usedfor_id: toFormId(rate?.usedfor_id ?? (rate?.usedfor as { id?: unknown })?.id),
    bodytype_id: toFormId(rate?.bodytype_id ?? (rate?.bodytype as { id?: unknown })?.id),
    used_tonnage_id: toFormId(rate?.used_tonnage_id ?? (rate?.used_tonnage as { id?: unknown })?.id),
    min_tonnage: toFormNumber(rate?.min_tonnage),
    max_tonnage: toFormNumber(rate?.max_tonnage),
    is_all_sum: Boolean(rate?.is_all_sum ?? false),
    valued_from: toFormNumber(rate?.valued_from),
    valued_to: toFormNumber(rate?.valued_to),
    is_all_age: Boolean(rate?.is_all_age ?? false),
    age_from: toFormNumber(rate?.age_from),
    age_to: toFormNumber(rate?.age_to),
    rate: toFormNumber(rate?.rate),
    minimum: toFormNumber(rate?.minimum),
    pll: toFormNumber(rate?.pll),
    is_fleet: Boolean(rate?.is_fleet ?? false),
    min_fleet: toFormNumber(rate?.min_fleet),
    max_fleet: toFormNumber(rate?.max_fleet),
    target_audience: String(rate?.target_audience ?? ""),
    cover_target: String(rate?.cover_target ?? ""),
    min_age: toFormNumber(rate?.min_age),
    max_age: toFormNumber(rate?.max_age),
    start_date: toFormDate(rate?.start_date),
    expiry_date: toFormDate(rate?.expiry_date),
    is_active: Boolean(rate?.is_active ?? true),
    makemodel_offered: normalizeMakeModelIds(meta?.makemodel_offered ?? rate?.makemodel_offered),
    makemodel_notoffered: normalizeMakeModelIds(meta?.makemodel_notoffered ?? rate?.makemodel_notoffered),
    meta: [],
  }
}

export const taxonomyToSelectOption = (
  taxonomy?: { id?: number | string; name?: string } | null,
): { value: string; label: string } | undefined => {
  if (taxonomy?.id == null) {
    return undefined
  }

  return {
    value: String(taxonomy.id),
    label: taxonomy.name ?? String(taxonomy.id),
  }
}

