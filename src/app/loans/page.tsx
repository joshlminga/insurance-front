import { useState } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { StatsCard, StatsGrid } from "@/components/shared/stats-card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ShieldCheck,
  Clock,
  AlertTriangle,
  Plus,
  MoreHorizontal,
  Eye,
  CheckCheck,
  XCircle,
  Settings,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { loanApplications } from "@/data/dummy-data"
import { formatCurrency, formatDate, formatPercent } from "@/lib/format"
import type { PolicyApplication as LoanApplication } from "@/types/insurance"

export default function PoliciesPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("all")

  // Filter policies based on tab
  const filteredLoans = loanApplications.filter((loan) => {
    if (activeTab === "all") return true
    if (activeTab === "pending") return ["submitted", "under_review"].includes(loan.status)
    if (activeTab === "approved") return loan.status === "approved"
    if (activeTab === "active") return ["disbursed", "repaying"].includes(loan.status)
    if (activeTab === "completed") return loan.status === "completed"
    if (activeTab === "defaulted") return loan.status === "defaulted"
    return true
  })

  // Stats
  const totalLoans = loanApplications.length
  const pendingCount = loanApplications.filter((l) => ["submitted", "under_review"].includes(l.status)).length
  const activeCount = loanApplications.filter((l) => ["disbursed", "repaying"].includes(l.status)).length
  const defaultedCount = loanApplications.filter((l) => l.status === "defaulted").length
  const totalDisbursed = loanApplications
    .filter((l) => l.disbursedAmount)
    .reduce((sum, l) => sum + (l.disbursedAmount || 0), 0)
  const totalOutstanding = loanApplications.reduce((sum, l) => sum + l.outstandingBalance, 0)

  const columns: Column<LoanApplication>[] = [
    {
      key: "loanId",
      label: "Policy ID",
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-medium">{value as string}</p>
          <p className="text-xs text-muted-foreground">{row.productName}</p>
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
      label: "Coverage Amount",
      sortable: true,
      render: (value) => (
        <span className="font-medium">{formatCurrency(value as number)}</span>
      ),
    },
    {
      key: "outstandingBalance",
      label: "Active Premium",
      sortable: true,
      render: (value, row) => (
        <div>
          <p>{formatCurrency(value as number)}</p>
          {row.status === "repaying" && (
            <Progress
              value={((row.totalRepaid / row.totalRepayable) * 100)}
              className="mt-1 h-1.5"
            />
          )}
        </div>
      ),
    },
    {
      key: "interestRate",
      label: "Premium Rate",
      render: (value) => formatPercent(value as number),
    },
    {
      key: "tenure",
      label: "Term",
      render: (value) => `${value} months`,
    },
    {
      key: "applicationDate",
      label: "Application Date",
      sortable: true,
      render: (value) => formatDate(value as string),
    },
    {
      key: "status",
      label: "Policy Status",
      render: (value) => <StatusBadge status={value as string} />,
    },
  ]

  const actions = (row: LoanApplication) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => navigate(`/loans/${row.loanId}`)}>
          <Eye className="mr-2 h-4 w-4" />
          View Policy
        </DropdownMenuItem>
        {["submitted", "under_review"].includes(row.status) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <CheckCheck className="mr-2 h-4 w-4" />
              Approve Policy
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <XCircle className="mr-2 h-4 w-4" />
              Decline Policy
            </DropdownMenuItem>
          </>
        )}
        {row.status === "approved" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Issue Policy
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <>
      <PageHeader
        title="Insurance Policies"
        description="Manage insurance applications, approvals, and policy issuance"
        actions={[
          {
            label: "Policy Products",
            icon: Settings,
            variant: "outline",
            href: "/loans/products",
          },
          {
            label: "New Quote/Application",
            icon: Plus,
            href: "/loans/apply",
          },
        ]}
      />

      <StatsGrid columns={4}>
        <StatsCard
          title="Total Coverage Value"
          value={formatCurrency(totalDisbursed)}
          description={`${activeCount} active policies`}
          icon={ShieldCheck}
        />
        <StatsCard
          title="Potential Exposure"
          value={formatCurrency(totalOutstanding)}
          description="Total active risk"
          icon={Clock}
        />
        <StatsCard
          title="Pending Underwriting"
          value={pendingCount}
          description="Awaiting decision"
          icon={Clock}
        />
        <StatsCard
          title="Loss Ratio"
          value={formatPercent((defaultedCount / totalLoans) * 100)}
          description={`${defaultedCount} failed policies`}
          icon={AlertTriangle}
          trend={{ value: 0.5, isPositive: false }}
        />
      </StatsGrid>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Policies ({totalLoans})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeCount})</TabsTrigger>
          <TabsTrigger value="defaulted">Historical Issues ({defaultedCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <DataTable
            data={filteredLoans}
            columns={columns}
            searchPlaceholder="Search policies..."
            searchKeys={["loanId", "memberName", "productName"]}
            onRowClick={(row) => navigate(`/loans/${row.loanId}`)}
            actions={actions}
          />
        </TabsContent>
      </Tabs>
    </>
  )
}
