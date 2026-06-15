import { PageHeader } from "@/components/shared/page-header"
import { StatsCard, StatsGrid } from "@/components/shared/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  Wallet,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { formatCurrency, formatDate, formatPercent } from "@/lib/format"
import {
  dashboardStats,
  loanApplications,
  transactions,
  notifications,
} from "@/data/dummy-data"
import { StatusBadge } from "@/components/shared/status-badge"
import { Link } from "react-router-dom"

export default function DashboardPage() {
  const recentLoanApplications = loanApplications
    .filter((l) => ["submitted", "under_review"].includes(l.status))
    .slice(0, 5)
  const recentTransactions = transactions.slice(0, 5)
  const unreadNotifications = notifications.filter((n) => !n.isRead).slice(0, 4)

  const currentDateTime = new Intl.DateTimeFormat("en-KE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Nairobi",
  }).format(new Date());

  return (
    <>
      <PageHeader
        title={`Marketplace Dashboard • ${currentDateTime}`}
        description="Welcome back! Here's an overview of your insurance platform"
      />
      <StatsGrid columns={4}>
        <StatsCard
          title="Total Policyholders"
          value={dashboardStats.totalMembers.toLocaleString()}
          description={`${dashboardStats.activeMembers} active accounts`}
          icon={Users}
          trend={{ value: dashboardStats.memberGrowth, isPositive: true }}
        />
        <StatsCard
          title="Total Premiums"
          value={formatCurrency(dashboardStats.totalSavings)}
          description="Total premiums collected"
          icon={Wallet}
          trend={{ value: dashboardStats.savingsGrowth, isPositive: true }}
        />
        <StatsCard
          title="Active Policies"
          value={dashboardStats.activeLoans.toLocaleString()}
          description={formatCurrency(dashboardStats.totalLoans)}
          icon={ShieldCheck}
        />
        <StatsCard
          title="Loss Ratio"
          value={formatPercent(dashboardStats.defaultRate)}
          description={`${dashboardStats.activeLoans} active policies`}
          icon={TrendingUp}
          trend={{ value: 0.5, isPositive: false }}
        />
      </StatsGrid>

      {/* Monthly Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="py-4">
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <ArrowDownRight className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Premiums this month</p>
              <p className="text-xl font-bold">
                {formatCurrency(dashboardStats.depositsThisMonth)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <ArrowUpRight className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Claims Paid this month</p>
              <p className="text-xl font-bold">
                {formatCurrency(dashboardStats.withdrawalsThisMonth)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Policies issued</p>
              <p className="text-xl font-bold">
                {formatCurrency(dashboardStats.loansDisbursedThisMonth)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Pending Policy Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">
              Pending Policy Applications
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/loans">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLoanApplications.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No pending applications
                </p>
              ) : (
                recentLoanApplications.map((loan) => (
                  <div
                    key={loan.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{loan.memberName}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{loan.productName}</span>
                        <span>-</span>
                        <span>{formatCurrency(loan.amount)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={loan.status} />
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/loans/${loan.loanId}`}>Review</Link>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">
              Recent Transactions
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/transactions">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${txn.type === "deposit" || txn.type === "loan_repayment"
                        ? "bg-green-100 dark:bg-green-900"
                        : "bg-red-100 dark:bg-red-900"
                        }`}
                    >
                      {txn.type === "deposit" || txn.type === "loan_repayment" ? (
                        <ArrowDownRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{txn.memberName}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {txn.type.replace(/_/g, " ").replace("deposit", "premium").replace("loan repayment", "policy payment")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-medium ${txn.type === "deposit" || txn.type === "loan_repayment"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                        }`}
                    >
                      {txn.type === "deposit" || txn.type === "loan_repayment"
                        ? "+"
                        : "-"}
                      {formatCurrency(txn.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(txn.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">
              Recent Notifications
            </CardTitle>
            {unreadNotifications.length > 0 && (
              <Badge variant="secondary">{unreadNotifications.length} new</Badge>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {unreadNotifications.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No new notifications
                </p>
              ) : (
                unreadNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${notification.type === "error"
                        ? "bg-red-100 dark:bg-red-900"
                        : notification.type === "warning"
                          ? "bg-yellow-100 dark:bg-yellow-900"
                          : notification.type === "success"
                            ? "bg-green-100 dark:bg-green-900"
                            : "bg-blue-100 dark:bg-blue-900"
                        }`}
                    >
                      {notification.type === "error" ? (
                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      ) : notification.type === "warning" ? (
                        <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link to="/members/new">
                  <Users className="h-5 w-5" />
                  <span className="text-xs">New Policyholder</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link to="/loans/apply">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-xs">New Policy</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link to="/transactions">
                  <Wallet className="h-5 w-5" />
                  <span className="text-xs">Record Transaction</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link to="/reports">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-xs">View Insights</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
