import { EROUTES } from "@/utils/enums"
import { Link } from "react-router-dom"

type CreditPendingBannerProps = {
  message: string
  creditTransactionId?: number
}

/** Shown when motor credit payment returns HTTP 202 (awaiting manager approval) */
export function CreditPendingBanner({ message, creditTransactionId }: CreditPendingBannerProps) {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
      <p className="font-medium">{message}</p>
      {creditTransactionId ? (
        <p className="mt-1 text-amber-800">Reference: transaction #{creditTransactionId}</p>
      ) : null}
      <Link
        to={EROUTES.CREDIT_TRANSACTIONS}
        className="mt-2 inline-block font-medium text-[#C20C0C] underline"
      >
        View my credit transactions
      </Link>
    </div>
  )
}
