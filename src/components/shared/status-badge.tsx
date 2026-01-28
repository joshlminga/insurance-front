import { Badge } from "@/components/ui/badge"
import type {
  PolicyholderStatus as MemberStatus,
  PolicyStatus as LoanStatus,
  TransactionStatus
} from "@/types/insurance"

type StatusType = MemberStatus | LoanStatus | TransactionStatus | string

interface StatusBadgeProps {
  status: StatusType
  className?: string
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" }> = {
  // Member statuses
  pending: { label: "Pending", variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  active: { label: "Active", variant: "success" },
  suspended: { label: "Suspended", variant: "destructive" },
  inactive: { label: "Inactive", variant: "secondary" },

  // Policy statuses
  submitted: { label: "Applied", variant: "info" },
  under_review: { label: "Underwriting", variant: "warning" },
  disbursed: { label: "Issued", variant: "success" },
  repaying: { label: "In Force", variant: "info" },
  completed: { label: "Matured", variant: "success" },
  defaulted: { label: "Lapsed", variant: "destructive" },
  rejected: { label: "Declined", variant: "destructive" },

  // Transaction statuses
  failed: { label: "Failed", variant: "destructive" },
  reversed: { label: "Reversed", variant: "warning" },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    variant: "secondary" as const
  }

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}
