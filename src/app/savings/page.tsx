import { useState } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatsCard, StatsGrid } from "@/components/shared/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Wallet,
  HeartPulse,
  TrendingUp,
  Plus,
  MoreHorizontal,
  Eye,
  ArrowDownRight,
  ArrowUpRight,
  Settings,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { savingAccensureunts, savingsProducts, transactions } from "@/data/dummy-data"
import { formatCurrency, formatDate, formatPercent } from "@/lib/format"
import type { PremiumAccount as SavingAccensureunt } from "@/types/insurance"

export default function PremiumsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("accounts")

  // Stats
  const totalBalance = savingAccensureunts.reduce((sum, a) => sum + a.balance, 0)
  const totalInterestEarned = savingAccensureunts.reduce((sum, a) => sum + a.interestEarned, 0)
  const activeAccounts = savingAccensureunts.filter((a) => a.isActive).length

  // Recent deposits (Premium Payments)
  const recentDeposits = transactions
    .filter((t) => t.type === "deposit")
    .slice(0, 5)

  const columns: Column<SavingAccensureunt>[] = [
    {
      key: "accountNumber",
      label: "Account Number",
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-medium">{value as string}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {row.accountType.replace(/_/g, " ").replace("savings", "premium")}
          </p>
        </div>
      ),
    },
    {
      key: "memberName",
      label: "Policyholder",
      sortable: true,
    },
    {
      key: "balance",
      label: "Premium Balance",
      sortable: true,
      render: (value) => (
        <span className="font-medium">{formatCurrency(value as number)}</span>
      ),
    },
    {
      key: "availableBalance",
      label: "Available Funds",
      sortable: true,
      render: (value) => formatCurrency(value as number),
    },
    {
      key: "interestRate",
      label: "Bonus Rate",
      render: (value) => formatPercent(value as number),
    },
    {
      key: "interestEarned",
      label: "Total Bonuses",
      sortable: true,
      render: (value) => formatCurrency(value as number),
    },
    {
      key: "lastTransactionDate",
      label: "Last Activity",
      render: (value) => value ? formatDate(value as string) : "-",
    },
  ]

  const actions = (row: SavingAccensureunt) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => navigate(`/savings/${row.accountNumber}`)}>
          <Eye className="mr-2 h-4 w-4" />
          View Account
        </DropdownMenuItem>
        <DropdownMenuItem>
          <ArrowDownRight className="mr-2 h-4 w-4" />
          Pay Premium
        </DropdownMenuItem>
        <DropdownMenuItem>
          <ArrowUpRight className="mr-2 h-4 w-4" />
          File Claim
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <>
      <PageHeader
        title="Premiums & Claims"
        description="Manage policyholder premium accounts and claim history"
        actions={[
          {
            label: "Insurance Products",
            icon: Settings,
            variant: "outline",
            href: "/savings/products",
          },
        ]}
      />

      <StatsGrid columns={4}>
        <StatsCard
          title="Total Premiums Collected"
          value={formatCurrency(totalBalance)}
          description="All accounts combined"
          icon={Wallet}
          trend={{ value: 8.7, isPositive: true }}
        />
        <StatsCard
          title="Total Bonuses Issued"
          value={formatCurrency(totalInterestEarned)}
          description="This year"
          icon={TrendingUp}
        />
        <StatsCard
          title="Active Accounts"
          value={activeAccounts}
          description={`${savingAccensureunts.length} total accounts`}
          icon={HeartPulse}
        />
        <StatsCard
          title="Insurance Products"
          value={savingsProducts.filter((p) => p.isActive).length}
          description="Active insurance plans"
          icon={Settings}
        />
      </StatsGrid>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="accounts">Premium Accounts</TabsTrigger>
          <TabsTrigger value="deposits">Recent Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="mt-4">
          <DataTable
            data={savingAccensureunts}
            columns={columns}
            searchPlaceholder="Search accounts..."
            searchKeys={["accountNumber", "memberName"]}
            onRowClick={(row) => navigate(`/savings/${row.accountNumber}`)}
            actions={actions}
          />
        </TabsContent>

        <TabsContent value="deposits" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Premium Payments</CardTitle>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Pay Premium
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDeposits.map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                        <ArrowDownRight className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium">{txn.memberName}</p>
                        <p className="text-sm text-muted-foreground">
                          {txn.accountNumber} - {txn.description.replace("savings", "premium")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600 dark:text-green-400">
                        +{formatCurrency(txn.amount)}
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
        </TabsContent>
      </Tabs>
    </>
  )
}
