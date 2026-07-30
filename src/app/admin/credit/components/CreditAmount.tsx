import { formatCurrency, parseMoneyString } from "@/lib/format"

type CreditAmountProps = {
  value: string | number | null | undefined
  className?: string
  fallback?: string
}

/** Safely display API decimal strings as formatted KES amounts */
export function CreditAmount({ value, className, fallback = "—" }: CreditAmountProps) {
  if (value === null || value === undefined || value === "") {
    return <span className={className}>{fallback}</span>
  }
  return <span className={className}>{formatCurrency(parseMoneyString(value))}</span>
}
