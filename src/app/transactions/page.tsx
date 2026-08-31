import { useState } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { StatsCard, StatsGrid } from "@/components/shared/stats-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FormField, SelectField } from "@/components/shared/form-field"
import {
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Download,
} from "lucide-react"
import { transactions, members } from "@/data/dummy-data"
import { formatCurrency, formatDateTime } from "@/lib/format"
import type { Transaction } from "@/types/insurance"

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false)

  // Filter transactions based on tab
  const filteredTransactions = transactions.filter((txn) => {
    if (activeTab === "all") return true
    if (activeTab === "deposits") return txn.type === "deposit"
    if (activeTab === "withdrawals") return txn.type === "withdrawal"
    if (activeTab === "repayments") return txn.type === "loan_repayment"
    if (activeTab === "pending") return txn.status === "pending"
    return true
  })

  // Stats
  const totalDeposits = transactions
    .filter((t) => t.type === "deposit" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0)
  const totalWithdrawals = transactions
    .filter((t) => t.type === "withdrawal" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0)
  const totalRepayments = transactions
    .filter((t) => t.type === "loan_repayment" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0)
  const pendingCount = transactions.filter((t) => t.status === "pending").length

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "deposit":
      case "loan_repayment":
        return <ArrowDownRight className="h-4 w-4 text-green-600" />
      case "withdrawal":
      case "loan_disbursement":
        return <ArrowUpRight className="h-4 w-4 text-red-600" />
      default:
        return <RefreshCw className="h-4 w-4 text-muted-foreground" />
    }
  }

  const columns: Column<Transaction>[] = [
    {
      key: "transactionId",
      label: "Ref ID",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {getTypeIcon(row.type)}
          <div>
            <p className="font-medium">{value as string}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {row.type.replace(/_/g, " ").replace("deposit", "premium").replace("loan repayment", "policy payment").replace("withdrawal", "claim payout")}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "memberName",
      label: "Policyholder",
      sortable: true,
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (value, row) => (
        <span
          className={`font-medium ${
            row.type === "deposit" || row.type === "loan_repayment"
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {row.type === "deposit" || row.type === "loan_repayment" ? "+" : "-"}
          {formatCurrency(value as number)}
        </span>
      ),
    },
    {
      key: "paymentMethod",
      label: "Method",
      render: (value) => (
        <Badge variant="outline" className="capitalize">
          {value as string}
        </Badge>
      ),
    },
    {
      key: "reference",
      label: "Channel Ref",
    },
    {
      key: "createdAt",
      label: "Timestamp",
      sortable: true,
      render: (value) => formatDateTime(value as string),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => <StatusBadge status={value as string} />,
    },
  ]

  const actions = (row: Transaction) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Eye className="mr-2 h-4 w-4" />
          View Receipt
        </DropdownMenuItem>
        {row.status === "pending" && (
          <>
            <DropdownMenuItem>
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve Payment
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <XCircle className="mr-2 h-4 w-4" />
              Flag Payment
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem>
          <Download className="mr-2 h-4 w-4" />
          PDF Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <>
      <PageHeader
        title="Payments & Transactions"
        description="Monitor premium collections and claim payouts"
        actions={[
          {
            label: "Record Premium",
            icon: ArrowDownRight,
            onClick: () => setIsDepositModalOpen(true),
          },
          {
            label: "Record Claim Payout",
            icon: ArrowUpRight,
            variant: "outline",
            onClick: () => setIsWithdrawalModalOpen(true),
          },
        ]}
      />

      <StatsGrid columns={4}>
        <StatsCard
          title="Premium Collections"
          value={formatCurrency(totalDeposits)}
          description="Total premiums"
          icon={ArrowDownRight}
        />
        <StatsCard
          title="Claim Payouts"
          value={formatCurrency(totalWithdrawals)}
          description="Total claims settled"
          icon={ArrowUpRight}
        />
        <StatsCard
          title="Policy Payments"
          value={formatCurrency(totalRepayments)}
          description="Installment premiums"
          icon={RefreshCw}
        />
        <StatsCard
          title="Pending Approval"
          value={pendingCount}
          description="Awaiting verification"
          icon={RefreshCw}
        />
      </StatsGrid>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All history</TabsTrigger>
          <TabsTrigger value="deposits">Premiums</TabsTrigger>
          <TabsTrigger value="withdrawals">Claims</TabsTrigger>
          <TabsTrigger value="repayments">Policy Payments</TabsTrigger>
          <TabsTrigger value="pending">Awaiting Verification ({pendingCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <DataTable
            data={filteredTransactions}
            columns={columns}
            searchPlaceholder="Search by ID, client or ref..."
            searchKeys={["transactionId", "memberName", "reference"]}
            actions={actions}
          />
        </TabsContent>
      </Tabs>

      {/* Premium Payment Modal */}
      <TransactionModal
        open={isDepositModalOpen}
        onOpenChange={setIsDepositModalOpen}
        type="deposit"
        title="Record Premium Payment"
        description="Record a new premium deposit for a client"
      />

      {/* Claim Payout Modal */}
      <TransactionModal
        open={isWithdrawalModalOpen}
        onOpenChange={setIsWithdrawalModalOpen}
        type="withdrawal"
        title="Process Claim Payout"
        description="Record an insurance claim payout"
      />
    </>
  )
}

interface TransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: "deposit" | "withdrawal"
  title: string
  description: string
}

function TransactionModal({
  open,
  onOpenChange,
  type,
  title,
  description,
}: TransactionModalProps) {
  const [formData, setFormData] = useState({
    memberId: "",
    amount: "",
    paymentMethod: "",
    reference: "",
    description: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onOpenChange(false)
    setFormData({
      memberId: "",
      amount: "",
      paymentMethod: "",
      reference: "",
      description: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <SelectField
              label="Policyholder"
              name="memberId"
              value={formData.memberId}
              onChange={(value) => setFormData((prev) => ({ ...prev, memberId: value }))}
              required
              options={members
                .filter((m) => m.status === "active")
                .map((m) => ({
                  label: `${m.firstName} ${m.lastName} (${m.memberId})`,
                  value: m.memberId,
                }))}
              placeholder="Select client"
            />
            <FormField
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
              required
              placeholder="Enter amount"
            />
            <SelectField
              label="Payment Method"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={(value) => setFormData((prev) => ({ ...prev, paymentMethod: value }))}
              required
              options={[
                { label: "M-Pesa", value: "mpesa" },
                { label: "Bank Transfer", value: "bank" },
                { label: "Cash", value: "cash" },
                { label: "Card", value: "card" },
              ]}
              placeholder="Select method"
            />
            <FormField
              label="Reference"
              name="reference"
              value={formData.reference}
              onChange={(e) => setFormData((prev) => ({ ...prev, reference: e.target.value }))}
              placeholder="Ref number (e.g. MPesa Ref)"
            />
            <FormField
              label="Reason/Description"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Policy month, claim reason, etc."
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {type === "deposit" ? "Submit Premium" : "Submit Claim Payout"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
