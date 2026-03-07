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

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link" }> = {
  // Member statuses
  pending: { label: "Pending", variant: "secondary" },
  approved: { label: "Approved", variant: "default" },
  active: { label: "Active", variant: "default" },
  suspended: { label: "Suspended", variant: "destructive" },
  inactive: { label: "Inactive", variant: "secondary" },

  // Policy statuses
  submitted: { label: "Applied", variant: "outline" },
  under_review: { label: "Underwriting", variant: "outline" },
  disbursed: { label: "Issued", variant: "default" },
  repaying: { label: "In Force", variant: "outline" },
  completed: { label: "Matured", variant: "default" },
  defaulted: { label: "Lapsed", variant: "destructive" },
  rejected: { label: "Declined", variant: "destructive" },

  // Transaction statuses
  failed: { label: "Failed", variant: "destructive" },
  reversed: { label: "Reversed", variant: "outline" },
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
