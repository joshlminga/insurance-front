import { creditPendingDetailPath } from "@/app/admin/credit/credit-payment"
import { EROUTES } from "@/utils/enums"
import { Link } from "react-router-dom"

type CreditPendingBannerProps = {
  message: string
  creditTransactionId?: number
  invoiceId?: string | number
  /** Customer payment step has no credit dashboard — hide the link. */
  showDashboardLink?: boolean
}

/** Shown when motor credit payment returns HTTP 202 (awaiting manager approval or cover date). */
export function CreditPendingBanner({
  message,
  creditTransactionId,
  invoiceId,
  showDashboardLink = true,
}: CreditPendingBannerProps) {
  const pendingHref = invoiceId ? creditPendingDetailPath(invoiceId) : EROUTES.CREDIT_PENDING

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
      <p className="font-medium">{message}</p>
      {creditTransactionId ? (
        <p className="mt-1 text-amber-800">Reference: transaction #{creditTransactionId}</p>
      ) : null}
      {showDashboardLink ? (
        <Link
          to={pendingHref}
          className="mt-2 inline-block font-medium text-[#C20C0C] underline"
        >
          View credit approval status
        </Link>
      ) : null}
    </div>
  )
}
