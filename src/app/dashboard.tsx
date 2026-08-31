import { PageHeader } from "@/components/shared/page-header"
import { StatsCard, StatsGrid } from "@/components/shared/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  Wallet,
  ShieldCheck,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertTriangle,
  TrendingUp,
} from "lucide-react"
import { formatCurrency, formatDate, parseMoneyString } from "@/lib/format"
import { StatusBadge } from "@/components/shared/status-badge"
import { Link } from "react-router-dom"
import { UseApiQuery } from "@/hooks/hooks"
import { REPORT_URLS, motorDashboardKey } from "@/app/admin/reports/reports-query"
import type { SubmitResponse } from "@/types/types"
import type { MotorDashboardReport } from "@/types/dashboard-report"
import { EROUTES } from "@/utils/enums"
import { currentDateTime } from "@/utils/helpers"

const EMPTY_LIST_MESSAGE = "No available data"
const NA = "N/A"

/** Count → string; missing/unavailable → N/A. Zero is valid. */
function displayCount(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return NA
  }
  return value.toLocaleString()
}

/** Money string from API → currency; missing → N/A. */
function displayMoney(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return NA
  }
  return formatCurrency(parseMoneyString(value))
}

/** Turn API event_type like "quote.started" into a short title */
function notificationTitle(eventType: string): string {
  return eventType
    .split(".")
    .map((part) => part.replace(/_/g, " "))
    .join(" · ")
}

function resolveErrorMessage(
  error: unknown,
  fallbackMessage?: string
): string {
  const err = error as {
    response?: { data?: { message?: string } }
    message?: string
  }
  return (
    err?.response?.data?.message ??
    err?.message ??
    fallbackMessage ??
    "Could not load dashboard report."
  )
}

export default function DashboardPage() {
  const params = { per_page: 10 }

  // One API call loads KPIs + short lists for the current org location
  const { data, isLoading, isError, error } = UseApiQuery<SubmitResponse>({
    url: REPORT_URLS.dashboard,
    queryKey: motorDashboardKey(params),
    params,
  })

  // Loading / error / missing payload → N/A stats and empty lists
  const report =
    !isLoading && !isError && data?.data
      ? (data.data as MotorDashboardReport)
      : null
  const summary = report?.summary
  const period = report?.period

  const pendingQuotations = report?.pending_quotations
  const pendingInstallments = report?.pending_installments
  const notifications = report?.recent_notifications
  const failedCertificates = report?.failed_certificates
  const certificatesTotal = report?.certificates?.total

  const quotationItems = pendingQuotations?.items ?? []
  const installmentItems = pendingInstallments?.items ?? []
  const notificationItems = notifications?.items ?? []

  const periodLabel =
    period != null
      ? `${period.date_from} → ${period.date_to}`
      : isLoading
        ? "loading…"
        : "current month"

  const errorMessage = isError
    ? resolveErrorMessage(error, data?.message)
    : null

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Welcome back • ${currentDateTime} • Period: ${periodLabel}`}
      />

      {errorMessage ? (
        <p className="text-sm text-destructive rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2">
          {errorMessage}
        </p>
      ) : null}

      <StatsGrid columns={4}>
        <StatsCard
          title="Total Customers"
          value={displayCount(summary?.total_customers)}
          description="Registered customers"
          icon={Users}
        />
        <StatsCard
          title="Total Payments"
          value={displayMoney(summary?.total_payments)}
          description="Paid invoices (all time)"
          icon={Wallet}
        />
        <StatsCard
          title="Active Policies"
          value={displayCount(summary?.active_policies)}
          description={
            certificatesTotal === null || certificatesTotal === undefined
              ? `${NA} certificates listed`
              : `${certificatesTotal.toLocaleString()} certificates listed`
          }
          icon={ShieldCheck}
        />
        <StatsCard
          title="Total Invoices"
          value={displayCount(summary?.total_invoices)}
          description="Active motor invoices"
          icon={FileText}
        />
      </StatsGrid>

      {/* Period summary row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="py-4 shadow-none">
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <ArrowDownRight className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Premiums this period</p>
              <p className="text-xl font-bold">
                {displayMoney(summary?.total_premium)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-4 shadow-none">
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Failed certificates</p>
              <p className="text-xl font-bold">
                {displayCount(failedCertificates?.total)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-4 shadow-none">
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quotations this period</p>
              <p className="text-xl font-bold">
                {displayCount(summary?.total_quotations)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Pending quotations */}
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">
              Pending Quotations
              {(pendingQuotations?.total ?? 0) > 0 ? (
                <Badge variant="secondary" className="ml-2">
                  {pendingQuotations!.total}
                </Badge>
              ) : null}
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to={EROUTES.MOTORQUOTATIONS}>View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quotationItems.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  {EMPTY_LIST_MESSAGE}
                </p>
              ) : (
                quotationItems.map((quote) => (
                  <div
                    key={quote.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {quote.customer?.name ?? "Guest"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{quote.quote_code}</span>
                        <span>-</span>
                        <span>
                          {quote.vehicle?.registration_number ?? "No plate"}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={quote.status} />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending installments */}
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">
              Pending Installments
              {(pendingInstallments?.total ?? 0) > 0 ? (
                <Badge variant="secondary" className="ml-2">
                  {pendingInstallments!.total}
                </Badge>
              ) : null}
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to={EROUTES.FINANCE_INVOICES}>View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {installmentItems.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  {EMPTY_LIST_MESSAGE}
                </p>
              ) : (
                installmentItems.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                        <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {invoice.customer?.name ??
                            invoice.vehicle?.registration_number ??
                            invoice.invoice_number}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {invoice.installment_text}
                          {invoice.due_date
                            ? ` · due ${formatDate(invoice.due_date)}`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {displayMoney(invoice.installment_amount)}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {invoice.status}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent notifications */}
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">
              Recent Notifications
            </CardTitle>
            {(notifications?.total ?? 0) > 0 ? (
              <Badge variant="secondary">{notifications!.total}</Badge>
            ) : null}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notificationItems.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  {EMPTY_LIST_MESSAGE}
                </p>
              ) : (
                notificationItems.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                      <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium capitalize">
                        {notificationTitle(notification.event_type)}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.category}
                        {notification.occurred_at
                          ? ` · ${formatDate(notification.occurred_at)}`
                          : ""}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                asChild
              >
                <Link to={EROUTES.ORGANIZATION_MEMBERS}>
                  <Users className="h-5 w-5" />
                  <span className="text-xs">Members</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                asChild
              >
                <Link to={EROUTES.MOTORQUOTATIONS}>
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-xs">New Quotation</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                asChild
              >
                <Link to={EROUTES.FINANCE_INVOICES}>
                  <Wallet className="h-5 w-5" />
                  <span className="text-xs">Invoices</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                asChild
              >
                <Link to={EROUTES.CREDIT_WALLET}>
                  <ArrowUpRight className="h-5 w-5" />
                  <span className="text-xs">Credit Wallet</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
