import { useParams, Link } from "react-router-dom"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { DetailItem, DetailGrid } from "@/components/shared/detail-item"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  CheckCheck,
  XCircle,
  ShieldCheck,
  Calendar,
  User,
  FileText,
} from "lucide-react"
import { loanApplications, members } from "@/data/dummy-data"
import { formatCurrency, formatDate, formatPercent } from "@/lib/format"
import { EmptyState } from "@/components/shared/empty-state"

export default function PolicyDetailPage() {
  const { id } = useParams<{ id: string }>()

  const loan = loanApplications.find((l) => l.loanId === id)

  if (!loan) {
    return (
      <EmptyState
        title="Policy Not Found"
        description="The insurance policy or application you're looking for doesn't exist."
        action={{ label: "Back to Policies", href: "/loans" }}
      />
    )
  }

  const member = members.find((m) => m.memberId === loan.memberId)
  const repaymentProgress = (loan.totalRepaid / loan.totalRepayable) * 100

  return (
    <>
      <PageHeader
        title="Policy Details"
        description={loan.loanId}
        actions={[
          {
            label: "Back",
            icon: ArrowLeft,
            variant: "outline",
            href: "/loans",
          },
          ...(["submitted", "under_review"].includes(loan.status)
            ? [
                {
                  label: "Approve Policy",
                  icon: CheckCheck,
                  onClick: () => {},
                },
                {
                  label: "Decline",
                  icon: XCircle,
                  variant: "outline" as const,
                  onClick: () => {},
                },
              ]
            : []),
          ...(loan.status === "approved"
            ? [
                {
                  label: "Issue Policy",
                  icon: ShieldCheck,
                  onClick: () => {},
                },
              ]
            : []),
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Policy Summary */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <h2 className="mt-4 text-3xl font-bold">{formatCurrency(loan.amount)}</h2>
              <p className="text-sm text-muted-foreground">{loan.productName}</p>

              <div className="mt-4">
                <StatusBadge status={loan.status} />
              </div>

              {loan.status === "repaying" && (
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Premium Payment Progress</span>
                    <span>{repaymentProgress.toFixed(1)}%</span>
                  </div>
                  <Progress value={repaymentProgress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>{formatCurrency(loan.totalRepaid)} paid</span>
                    <span>{formatCurrency(loan.outstandingBalance)} remaining</span>
                  </div>
                </div>
              )}

              <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-6 text-left">
                <div>
                  <p className="text-sm text-muted-foreground">Total Premiums</p>
                  <p className="text-lg font-semibold">{formatCurrency(loan.totalRepayable)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Premium</p>
                  <p className="text-lg font-semibold">{formatCurrency(loan.outstandingBalance)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Premium Rate</p>
                  <p className="text-lg font-semibold">{formatPercent(loan.interestRate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Term</p>
                  <p className="text-lg font-semibold">{loan.tenure} months</p>
                </div>
              </div>

              {loan.nextPaymentDate && loan.nextPaymentAmount && (
                <div className="mt-4 rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Next Payment</p>
                  <p className="text-lg font-bold">{formatCurrency(loan.nextPaymentAmount)}</p>
                  <p className="text-xs text-muted-foreground">Due {formatDate(loan.nextPaymentDate)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Policy Details Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Policy Info</TabsTrigger>
              <TabsTrigger value="schedule">Payment Schedule</TabsTrigger>
              <TabsTrigger value="guarantors">Beneficiaries</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Underwriting Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <DetailGrid columns={2}>
                    <DetailItem label="Policy ID" value={loan.loanId} />
                    <DetailItem label="Insurance Plan" value={loan.productName} />
                    <DetailItem label="Coverage Amount" value={formatCurrency(loan.amount)} />
                    <DetailItem
                      label="Active Value"
                      value={loan.disbursedAmount ? formatCurrency(loan.disbursedAmount) : "Not issued"}
                    />
                    <DetailItem label="Application Date" value={formatDate(loan.applicationDate)} />
                    <DetailItem
                      label="Underwritten Date"
                      value={loan.approvalDate ? formatDate(loan.approvalDate) : "Pending"}
                    />
                    <DetailItem
                      label="Issuance Date"
                      value={loan.disbursementDate ? formatDate(loan.disbursementDate) : "Pending"}
                    />
                    <DetailItem
                      label="Policy Expiry"
                      value={loan.expectedCompletionDate ? formatDate(loan.expectedCompletionDate) : "N/A"}
                    />
                    <DetailItem label="Underwriter" value={loan.approvedBy || "Pending"} />
                  </DetailGrid>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Risk Description/Purpose</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{loan.purpose}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Policyholder Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{loan.memberName}</p>
                      <p className="text-sm text-muted-foreground">{loan.memberId}</p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto" asChild>
                      <Link to={`/members/${loan.memberId}`}>View Profile</Link>
                    </Button>
                  </div>
                  {member && (
                    <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Premiums Paid</p>
                        <p className="font-medium">{formatCurrency(member.totalSavings)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Investment</p>
                        <p className="font-medium">{formatCurrency(member.totalShares)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Active Policies</p>
                        <p className="font-medium">{member.activeLoans}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Premium Payment Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  {loan.repaymentSchedule && loan.repaymentSchedule.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Premium</TableHead>
                          <TableHead>Fees</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Paid</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loan.repaymentSchedule.map((schedule) => (
                          <TableRow key={schedule.id}>
                            <TableCell>{formatDate(schedule.dueDate)}</TableCell>
                            <TableCell>{formatCurrency(schedule.principal)}</TableCell>
                            <TableCell>{formatCurrency(schedule.interest)}</TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(schedule.totalAmount)}
                            </TableCell>
                            <TableCell>{formatCurrency(schedule.paidAmount)}</TableCell>
                            <TableCell>
                              <StatusBadge status={schedule.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <EmptyState
                      icon={Calendar}
                      title="No Schedule Available"
                      description="Payment schedule will be generated after policy issuance."
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="guarantors" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Policy Beneficiaries</CardTitle>
                </CardHeader>
                <CardContent>
                  {loan.guarantors && loan.guarantors.length > 0 ? (
                    <div className="space-y-4">
                      {loan.guarantors.map((guarantor) => (
                        <div
                          key={guarantor.id}
                          className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{guarantor.memberName}</p>
                              <p className="text-sm text-muted-foreground">{guarantor.phone}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatPercent(guarantor.amount / loan.amount * 100)} Share</p>
                            <StatusBadge status={guarantor.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={User}
                      title="No Beneficiaries"
                      description="No beneficiaries have been added to this policy."
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Policy Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  {loan.documents && loan.documents.length > 0 ? (
                    <div className="space-y-4">
                      {loan.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-sm text-muted-foreground">{doc.type}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={FileText}
                      title="No Documents"
                      description="No policy documents have been uploaded."
                    />
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
