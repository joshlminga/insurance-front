import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Edit, CreditCard, Clock, Users, Percent } from "lucide-react"
import { loanProducts } from "@/data/dummy-data"
import { formatCurrency, formatPercent } from "@/lib/format"

export default function LoanProductsPage() {
  return (
    <>
      <PageHeader
        title="Loan Products"
        description="Configure loan types, interest rates, and eligibility rules"
        actions={[
          {
            label: "Back",
            icon: ArrowLeft,
            variant: "outline",
            href: "/loans",
          },
          {
            label: "Add Product",
            icon: Plus,
            onClick: () => {},
          },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {loanProducts.map((product) => (
          <Card key={product.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <CreditCard className="h-5 w-5 text-primary" />
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
              <p className="text-sm text-muted-foreground mb-4">{product.description}</p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Interest Rate</p>
                    <p className="font-semibold">{formatPercent(product.interestRate)} ({product.interestType.replace(/_/g, " ")})</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Tenure</p>
                    <p className="font-semibold">{product.minTenure} - {product.maxTenure} months</p>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">Amount Range</p>
                  <p className="font-semibold">
                    {formatCurrency(product.minAmount)} - {formatCurrency(product.maxAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Processing Fee</p>
                  <p className="font-semibold">{formatPercent(product.processingFee)}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {product.requiresGuarantor
                      ? `Requires ${product.maxGuarantors} guarantor(s)`
                      : "No guarantor required"}
                  </span>
                </div>
              </div>

              {product.eligibilityRules.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Eligibility:</p>
                  <div className="flex flex-wrap gap-1">
                    {product.eligibilityRules.slice(0, 2).map((rule, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {rule}
                      </Badge>
                    ))}
                    {product.eligibilityRules.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{product.eligibilityRules.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Product
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
