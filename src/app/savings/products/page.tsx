import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Plus,
  Edit,
  PiggyBank,
  Wallet,
  Lock,
  Users,
} from "lucide-react"
import { savingsProducts } from "@/data/dummy-data"
import { formatCurrency, formatPercent } from "@/lib/format"

const accountTypeIcons = {
  main_savings: Wallet,
  fixed_deposit: Lock,
  junior_account: Users,
  shares: PiggyBank,
}

export default function SavingsProductsPage() {
  return (
    <>
      <PageHeader
        title="Savings Products"
        description="Configure savings account types and interest rates"
        actions={[
          {
            label: "Back",
            icon: ArrowLeft,
            variant: "outline",
            href: "/savings",
          },
          {
            label: "Add Product",
            icon: Plus,
            onClick: () => {},
          },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {savingsProducts.map((product) => {
          const Icon =
            accountTypeIcons[
              product.accountType as keyof typeof accountTypeIcons
            ] || Wallet
          return (
            <Card key={product.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{product.name}</CardTitle>
                    <CardDescription className="mt-1">{product.code}</CardDescription>
                  </div>
                </div>
                {product.isActive ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {product.description}
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Interest Rate</p>
                    <p className="font-semibold text-lg">{formatPercent(product.interestRate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Min Balance</p>
                    <p className="font-semibold">{formatCurrency(product.minimumBalance)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Min Deposit</p>
                    <p className="font-semibold">{formatCurrency(product.minimumDeposit)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Withdrawal Limit</p>
                    <p className="font-semibold">
                      {product.withdrawalLimit ? formatCurrency(product.withdrawalLimit) : "Unlimited"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </>
  )
}
