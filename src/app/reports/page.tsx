import { PageHeader } from "@/components/shared/page-header"
import { StatsCard, StatsGrid } from "@/components/shared/stats-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Users,
  CreditCard,
  Wallet,
  TrendingUp,
  Download,
  FileText,
  BarChart3,
  PieChart,
  Calendar,
} from "lucide-react"
import { formatCurrency, formatPercent } from "@/lib/format"
import {
  dashboardStats,
  memberGrowthData,
  savingsGrowthData,
  loanDistributionData,
  loanStatusData,
} from "@/data/dummy-data"

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports & Analytics"
        description="Generate and view Accensure performance reports"
      />

      {/* Quick Stats */}
      <StatsGrid columns={4}>
        <StatsCard
          title="Total Members"
          value={dashboardStats.totalMembers.toLocaleString()}
          icon={Users}
          trend={{ value: dashboardStats.memberGrowth, isPositive: true }}
        />
        <StatsCard
          title="Total Savings"
          value={formatCurrency(dashboardStats.totalSavings)}
          icon={Wallet}
          trend={{ value: dashboardStats.savingsGrowth, isPositive: true }}
        />
        <StatsCard
          title="Total Loans"
          value={formatCurrency(dashboardStats.totalLoans)}
          icon={CreditCard}
        />
        <StatsCard
          title="Default Rate"
          value={formatPercent(dashboardStats.defaultRate)}
          icon={TrendingUp}
        />
      </StatsGrid>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="savings">Savings</TabsTrigger>
          <TabsTrigger value="loans">Loans</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Member Growth Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Member Growth Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Chart visualization will be rendered here
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Data: {memberGrowthData.length} months
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Savings Growth Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Savings Growth Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Chart visualization will be rendered here
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Data: {savingsGrowthData.length} months
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loan Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  Loan Distribution by Product
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 mx-auto text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Chart visualization will be rendered here
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {loanDistributionData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-medium">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Loan Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Loan Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Chart visualization will be rendered here
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {loanStatusData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <ReportsList
            reports={[
              {
                name: "Member Summary Report",
                description: "Overview of all members, statuses, and demographics",
                icon: Users,
              },
              {
                name: "New Registrations Report",
                description: "List of newly registered members within a period",
                icon: Users,
              },
              {
                name: "Member Activity Report",
                description: "Transaction activity by member",
                icon: BarChart3,
              },
              {
                name: "KYC Compliance Report",
                description: "Members pending KYC verification",
                icon: FileText,
              },
            ]}
          />
        </TabsContent>

        <TabsContent value="savings" className="mt-4">
          <ReportsList
            reports={[
              {
                name: "Savings Summary Report",
                description: "Overview of all savings accounts and balances",
                icon: Wallet,
              },
              {
                name: "Interest Computation Report",
                description: "Interest earned by members",
                icon: TrendingUp,
              },
              {
                name: "Deposits Report",
                description: "All deposits within a period",
                icon: Wallet,
              },
              {
                name: "Withdrawals Report",
                description: "All withdrawals within a period",
                icon: Wallet,
              },
            ]}
          />
        </TabsContent>

        <TabsContent value="loans" className="mt-4">
          <ReportsList
            reports={[
              {
                name: "Loan Portfolio Report",
                description: "Overview of all active loans",
                icon: CreditCard,
              },
              {
                name: "Loan Disbursement Report",
                description: "Loans disbursed within a period",
                icon: CreditCard,
              },
              {
                name: "Loan Repayment Report",
                description: "Loan repayments received",
                icon: TrendingUp,
              },
              {
                name: "Loan Arrears Report",
                description: "Overdue loans and defaulters",
                icon: CreditCard,
              },
              {
                name: "Loan Performance Report",
                description: "Loan performance by product",
                icon: BarChart3,
              },
            ]}
          />
        </TabsContent>

        <TabsContent value="financial" className="mt-4">
          <ReportsList
            reports={[
              {
                name: "Balance Sheet",
                description: "Assets, liabilities, and equity statement",
                icon: FileText,
              },
              {
                name: "Income Statement",
                description: "Revenue and expenses summary",
                icon: TrendingUp,
              },
              {
                name: "Cash Flow Statement",
                description: "Cash inflows and outflows",
                icon: Wallet,
              },
              {
                name: "Trial Balance",
                description: "Chart of accounts balances",
                icon: FileText,
              },
              {
                name: "General Ledger",
                description: "All ledger entries",
                icon: FileText,
              },
            ]}
          />
        </TabsContent>
      </Tabs>
    </>
  )
}

interface Report {
  name: string
  description: string
  icon: typeof FileText
}

function ReportsList({ reports }: { reports: Report[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {reports.map((report, index) => {
        const Icon = report.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">{report.name}</CardTitle>
                <CardDescription className="mt-1">{report.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Select defaultValue="this_month">
                    <SelectTrigger className="h-8 w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="this_week">This Week</SelectItem>
                      <SelectItem value="this_month">This Month</SelectItem>
                      <SelectItem value="this_quarter">This Quarter</SelectItem>
                      <SelectItem value="this_year">This Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 ml-auto">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Excel
                  </Button>
                  <Button size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
