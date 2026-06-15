import { formatNumber } from "@/lib/format";
import { 
  BenefitGroup, 
  ListedBenefitResolved, 
  MotorBenefitOption, 
  MotorUserCoverInvoice
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

export const installmentText = (invoice: MotorUserCoverInvoice) =>
    `Installment ${invoice.installment_number} of ${invoice.total_installments}`
