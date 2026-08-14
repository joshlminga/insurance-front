import { Badge } from "@/components/ui/badge"
import type { CreditSettlementStatus, CreditTransactionStatus } from "@/types/types"

type StatusKind = CreditTransactionStatus | CreditSettlementStatus | string

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending_approval: {
    label: "Pending approval",
    className: "bg-amber-100 text-amber-800",
  },
  awaiting_cover_update: {
    label: "Awaiting cover date",
    className: "bg-orange-100 text-orange-800",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800",
  },
  approved: {
    label: "Approved",
    className: "bg-green-100 text-green-800",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-800",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-800",
  },
  processing: {
    label: "Processing",
    className: "bg-blue-100 text-blue-800",
  },
  completed: {
    label: "Completed",
    className: "bg-green-100 text-green-800",
  },
  failed: {
    label: "Failed",
    className: "bg-red-100 text-red-800",
  },
}

export function CreditStatusBadge({ status }: { status: StatusKind }) {
  const key = String(status ?? "").toLowerCase()
  const config = STATUS_CONFIG[key] ?? {
    label: key.replace(/_/g, " ") || "Unknown",
    className: "bg-gray-100 text-gray-800",
  }

  return (
    <Badge className={`rounded-lg font-semibold capitalize ${config.className}`}>
      {config.label}
    </Badge>
  )
}
