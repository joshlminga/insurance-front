import { useParams, Link } from "react-router-dom"
import { PageHeader } from "@/components/shared/page-header"
import { DetailItem, DetailGrid } from "@/components/shared/detail-item"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  TrendingUp,
  Calendar,
  HeartPulse,
} from "lucide-react"
import { savingAccensureunts, transactions } from "@/data/dummy-data"
import { formatCurrency, formatDate, formatPercent } from "@/lib/format"
import { EmptyState } from "@/components/shared/empty-state"

export default function PremiumAccountDetailPage() {
  const { id } = useParams<{ id: string }>()

  const account = savingAccensureunts.find((a) => a.accountNumber === id)

  if (!account) {
    return (
      <EmptyState
        title="Premium Account Not Found"
        description="The account you're looking for doesn't exist."
        action={{ label: "Back to Premiums", href: "/savings" }}
      />
    )
  }

  // Get account transactions
  const accountTransactions = transactions
    .filter((t) => t.accountNumber === account.accountNumber)
    .slice(0, 10)

  return (
    <>
      <PageHeader
        title="Premium Account"
        description={account.accountNumber}
        actions={[
          {
            label: "Back",
            icon: ArrowLeft,
            variant: "outline",
            href: "/savings",
          },
          {
            label: "Pay Premium",
            icon: ArrowDownRight,
            onClick: () => {},
          },
          {
            label: "Process Claim",
            icon: ArrowUpRight,
            variant: "outline",
            onClick: () => {},
          },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Account Summary */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <HeartPulse className="h-8 w-8 text-primary" />
              </div>
              <h2 className="mt-4 text-3xl font-bold">{formatCurrency(account.balance)}</h2>
              <p className="text-sm text-muted-foreground">Settled Balance</p>

              <div className="mt-4">
                {account.isActive ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge variant="secondary">Suspended</Badge>
                )}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-6 text-left">
                <div>
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="text-lg font-semibold">{formatCurrency(account.availableBalance)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Claims</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(account.balance - account.availableBalance)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <DetailGrid columns={3}>
                <DetailItem label="Account Number" value={account.accountNumber} />
                <DetailItem label="Policyholder" value={account.memberName} />
                <DetailItem
                  label="Policy Plan"
                  value={account.accountType.replace(/_/g, " ").replace("savings", "premium").replace(/\b\w/g, (l) => l.toUpperCase())}
                />
                <DetailItem label="Bonus Rate" value={formatPercent(account.interestRate)} />
                <DetailItem label="Total Bonuses" value={formatCurrency(account.interestEarned)} />
                <DetailItem label="Min Contribution" value={formatCurrency(account.minimumBalance)} />
                <DetailItem
                  label="Last Payment"
                  value={account.lastTransactionDate ? formatDate(account.lastTransactionDate) : "N/A"}
                />
                <DetailItem label="Opened On" value={formatDate(account.createdAt)} />
              </DetailGrid>
            </CardContent>
          </Card>

          {/* Bonus Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bonus & Yield Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <TrendingUp className="mx-auto h-6 w-6 text-green-600" />
                  <p className="mt-2 text-2xl font-bold">{formatPercent(account.interestRate)}</p>
                  <p className="text-xs text-muted-foreground">Annual Yield</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <Wallet className="mx-auto h-6 w-6 text-primary" />
                  <p className="mt-2 text-2xl font-bold">{formatCurrency(account.interestEarned)}</p>
                  <p className="text-xs text-muted-foreground">Accrued Bonus</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <Calendar className="mx-auto h-6 w-6 text-muted-foreground" />
                  <p className="mt-2 text-2xl font-bold">{formatCurrency(account.interestEarned / 12)}</p>
                  <p className="text-xs text-muted-foreground">Monthly Growth</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Payments & Claims */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Payments & Claims</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/transactions">View History</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {accountTransactions.length === 0 ? (
                <EmptyState
                  title="No Transactions"
                  description="No history found for this account."
                />
              ) : (
                <div className="space-y-4">
                  {accountTransactions.map((txn) => (
                    <div
                      key={txn.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            txn.type === "deposit"
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
                          <p className="text-sm font-medium capitalize">
                            {txn.type.replace(/_/g, " ").replace("deposit", "premium payment").replace("withdrawal", "claim payout")}
                          </p>
                          <p className="text-xs text-muted-foreground">{txn.reference}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-medium ${
                            txn.type === "deposit" || txn.type === "loan_repayment"
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {txn.type === "deposit" || txn.type === "loan_repayment" ? "+" : "-"}
                          {formatCurrency(txn.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(txn.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
