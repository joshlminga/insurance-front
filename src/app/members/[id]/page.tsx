import { useParams, Link } from "react-router-dom"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { DetailItem, DetailGrid } from "@/components/shared/detail-item"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Edit,
  Ban,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  HeartPulse,
} from "lucide-react"
import { members, savingAccensureunts, loanApplications, transactions } from "@/data/dummy-data"
import { formatCurrency, formatDate, formatPhone, getInitials } from "@/lib/format"
import { EmptyState } from "@/components/shared/empty-state"

export default function PolicyholderDetailPage() {
  const { id } = useParams<{ id: string }>()

  // Find policyholder by ID
  const member = members.find((m) => m.memberId === id)

  if (!member) {
    return (
      <EmptyState
        title="Policyholder Not Found"
        description="The policyholder you're looking for doesn't exist or has been removed."
        action={{ label: "Back to Policyholders", href: "/members" }}
      />
    )
  }

  // Get policyholder's accounts
  const memberSavings = savingAccensureunts.filter((s) => s.memberId === member.memberId)

  // Get policyholder's policies
  const memberLoans = loanApplications.filter((l) => l.memberId === member.memberId)

  // Get policyholder's transactions
  const memberTransactions = transactions.filter((t) => t.memberId === member.memberId)

  return (
    <>
      <PageHeader
        title="Policyholder Profile"
        description={`${member.firstName} ${member.lastName}`}
        actions={[
          {
            label: "Edit Profile",
            icon: Edit,
            variant: "outline",
            onClick: () => {},
          },
          member.status === "active"
            ? {
                label: "Suspend Account",
                icon: Ban,
                variant: "outline",
                onClick: () => {},
              }
            : {
                label: "Activate Account",
                icon: UserCheck,
                variant: "default",
                onClick: () => {},
              },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Policyholder Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {getInitials(`${member.firstName} ${member.lastName}`)}
                </AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-xl font-semibold">
                {member.firstName} {member.lastName}
              </h2>
              <p className="text-sm text-muted-foreground">{member.memberId}</p>
              <div className="mt-2">
                <StatusBadge status={member.status} />
              </div>

              <div className="mt-6 w-full space-y-3 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{member.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{formatPhone(member.phone)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{member.address}, {member.city}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Onboarded {formatDate(member.joinDate)}</span>
                </div>
              </div>

              <div className="mt-6 grid w-full grid-cols-2 gap-4 border-t pt-6">
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(member.totalSavings)}</p>
                  <p className="text-xs text-muted-foreground">Premiums Paid</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(member.totalShares)}</p>
                  <p className="text-xs text-muted-foreground">Investment</p>
                </div>
              </div>

              {member.kycVerified ? (
                <Badge variant="success" className="mt-4">KYC Verified</Badge>
              ) : (
                <Badge variant="warning" className="mt-4">KYC Pending</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="savings">Premium Accounts ({memberSavings.length})</TabsTrigger>
              <TabsTrigger value="loans">Active Policies ({memberLoans.length})</TabsTrigger>
              <TabsTrigger value="transactions">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <DetailGrid columns={2}>
                    <DetailItem label="ID Number" value={member.idNumber} />
                    <DetailItem label="Date of Birth" value={formatDate(member.dateOfBirth)} />
                    <DetailItem label="Gender" value={member.gender.charAt(0).toUpperCase() + member.gender.slice(1)} />
                    <DetailItem label="Region" value={member.branch} />
                    <DetailItem label="Active Policies" value={member.activeLoans} />
                    <DetailItem label="Client Since" value={formatDate(member.joinDate)} />
                  </DetailGrid>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="savings" className="mt-4 space-y-4">
              {memberSavings.length === 0 ? (
                <Card>
                  <CardContent className="py-8">
                    <EmptyState
                      icon={Wallet}
                      title="No Premium Accounts"
                      description="This client doesn't have any premium accounts yet."
                    />
                  </CardContent>
                </Card>
              ) : (
                memberSavings.map((account) => (
                  <Card key={account.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <HeartPulse className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium capitalize">{account.accountType.replace(/_/g, " ").replace("savings", "premium")}</p>
                            <p className="text-sm text-muted-foreground">{account.accountNumber}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">{formatCurrency(account.balance)}</p>
                          <p className="text-xs text-muted-foreground">
                            Available: {formatCurrency(account.availableBalance)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Bonus Rate</p>
                          <p className="font-medium">{account.interestRate}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Bonuses</p>
                          <p className="font-medium">{formatCurrency(account.interestEarned)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Activity</p>
                          <p className="font-medium">{account.lastTransactionDate ? formatDate(account.lastTransactionDate) : "-"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="loans" className="mt-4 space-y-4">
              {memberLoans.length === 0 ? (
                <Card>
                  <CardContent className="py-8">
                    <EmptyState
                      icon={ShieldCheck}
                      title="No Policies"
                      description="This client doesn't have any insurance policies."
                    />
                  </CardContent>
                </Card>
              ) : (
                memberLoans.map((loan) => (
                  <Card key={loan.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{loan.productName}</p>
                            <p className="text-sm text-muted-foreground">{loan.loanId}</p>
                          </div>
                        </div>
                        <StatusBadge status={loan.status} />
                      </div>
                      <div className="mt-4 grid grid-cols-4 gap-4 border-t pt-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Coverage</p>
                          <p className="font-medium">{formatCurrency(loan.amount)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Active Premium</p>
                          <p className="font-medium">{formatCurrency(loan.outstandingBalance)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Premium Rate</p>
                          <p className="font-medium">{loan.interestRate}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Term</p>
                          <p className="font-medium">{loan.tenure} months</p>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/loans/${loan.loanId}`}>View Policy Details</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="transactions" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {memberTransactions.length === 0 ? (
                    <EmptyState
                      icon={ArrowDownRight}
                      title="No Transactions"
                      description="This client doesn't have any transactions yet."
                    />
                  ) : (
                    <div className="space-y-4">
                      {memberTransactions.map((txn) => (
                        <div
                          key={txn.id}
                          className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                txn.type === "deposit" || txn.type === "loan_repayment"
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
                                {txn.type.replace(/_/g, " ").replace("deposit", "premium").replace("loan repayment", "policy payment").replace("withdrawal", "claim payout")}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {txn.reference}
                              </p>
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
