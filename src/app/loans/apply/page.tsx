import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { PageHeader } from "@/components/shared/page-header"
import { FormField, SelectField, TextareaField, FormGrid } from "@/components/shared/form-field"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Send, Calculator, CreditCard } from "lucide-react"
import { loanProducts, members } from "@/data/dummy-data"
import { formatCurrency, formatPercent } from "@/lib/format"

interface LoanFormData {
  memberId: string
  productId: string
  amount: string
  tenure: string
  purpose: string
}

export default function LoanApplicationPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<LoanFormData>({
    memberId: "",
    productId: "",
    amount: "",
    tenure: "",
    purpose: "",
  })
  const [errors, setErrors] = useState<Partial<LoanFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedProduct = loanProducts.find((p) => p.id === formData.productId)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof LoanFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof LoanFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  // Calculate loan details
  const calculateLoan = () => {
    if (!selectedProduct || !formData.amount || !formData.tenure) return null

    const principal = parseFloat(formData.amount)
    const tenure = parseInt(formData.tenure)
    const rate = selectedProduct.interestRate / 100

    let totalInterest = 0
    let monthlyPayment = 0

    if (selectedProduct.interestType === "flat") {
      totalInterest = principal * rate * (tenure / 12)
      monthlyPayment = (principal + totalInterest) / tenure
    } else {
      // Reducing balance
      const monthlyRate = rate / 12
      monthlyPayment =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
        (Math.pow(1 + monthlyRate, tenure) - 1)
      totalInterest = monthlyPayment * tenure - principal
    }

    const processingFee = principal * (selectedProduct.processingFee / 100)
    const totalRepayable = principal + totalInterest

    return {
      principal,
      totalInterest,
      monthlyPayment,
      processingFee,
      totalRepayable,
      disbursementAmount: principal - processingFee,
    }
  }

  const loanDetails = calculateLoan()

  const validateForm = (): boolean => {
    const newErrors: Partial<LoanFormData> = {}

    if (!formData.memberId) newErrors.memberId = "Member is required"
    if (!formData.productId) newErrors.productId = "Loan product is required"
    if (!formData.amount) newErrors.amount = "Loan amount is required"
    else if (selectedProduct) {
      const amount = parseFloat(formData.amount)
      if (amount < selectedProduct.minAmount) {
        newErrors.amount = `Minimum amount is ${formatCurrency(selectedProduct.minAmount)}`
      }
      if (amount > selectedProduct.maxAmount) {
        newErrors.amount = `Maximum amount is ${formatCurrency(selectedProduct.maxAmount)}`
      }
    }
    if (!formData.tenure) newErrors.tenure = "Tenure is required"
    if (!formData.purpose) newErrors.purpose = "Purpose is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("Loan application submitted:", formData)
    setIsSubmitting(false)
    navigate("/loans")
  }

  // Generate tenure options based on selected product
  const tenureOptions = selectedProduct
    ? Array.from(
        { length: selectedProduct.maxTenure - selectedProduct.minTenure + 1 },
        (_, i) => {
          const months = selectedProduct.minTenure + i
          return { label: `${months} months`, value: String(months) }
        }
      )
    : []

  return (
    <>
      <PageHeader
        title="New Loan Application"
        description="Submit a new loan application"
        actions={[
          {
            label: "Back",
            icon: ArrowLeft,
            variant: "outline",
            href: "/loans",
          },
        ]}
      />

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Loan Details */}
            <Card>
              <CardHeader>
                <CardTitle>Loan Details</CardTitle>
                <CardDescription>
                  Select the loan product and enter application details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormGrid columns={2}>
                  <SelectField
                    label="Member"
                    name="memberId"
                    value={formData.memberId}
                    onChange={handleSelectChange("memberId")}
                    error={errors.memberId}
                    required
                    options={members
                      .filter((m) => m.status === "active")
                      .map((m) => ({
                        label: `${m.firstName} ${m.lastName} (${m.memberId})`,
                        value: m.memberId,
                      }))}
                    placeholder="Select member"
                  />
                  <SelectField
                    label="Loan Product"
                    name="productId"
                    value={formData.productId}
                    onChange={handleSelectChange("productId")}
                    error={errors.productId}
                    required
                    options={loanProducts
                      .filter((p) => p.isActive)
                      .map((p) => ({
                        label: `${p.name} (${formatPercent(p.interestRate)})`,
                        value: p.id,
                      }))}
                    placeholder="Select loan product"
                  />
                  <FormField
                    label="Loan Amount"
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleInputChange}
                    error={errors.amount}
                    required
                    placeholder="Enter amount"
                    description={
                      selectedProduct
                        ? `Min: ${formatCurrency(selectedProduct.minAmount)} - Max: ${formatCurrency(selectedProduct.maxAmount)}`
                        : undefined
                    }
                  />
                  <SelectField
                    label="Repayment Tenure"
                    name="tenure"
                    value={formData.tenure}
                    onChange={handleSelectChange("tenure")}
                    error={errors.tenure}
                    required
                    options={tenureOptions}
                    placeholder="Select tenure"
                    disabled={!selectedProduct}
                  />
                </FormGrid>
                <div className="mt-4">
                  <TextareaField
                    label="Purpose of Loan"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    error={errors.purpose}
                    required
                    placeholder="Describe the purpose of this loan..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Product Details */}
            {selectedProduct && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Product Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Interest Rate</p>
                      <p className="font-semibold">{formatPercent(selectedProduct.interestRate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Interest Type</p>
                      <p className="font-semibold capitalize">{selectedProduct.interestType.replace(/_/g, " ")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Processing Fee</p>
                      <p className="font-semibold">{formatPercent(selectedProduct.processingFee)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Grace Period</p>
                      <p className="font-semibold">{selectedProduct.gracePeriod} days</p>
                    </div>
                  </div>
                  {selectedProduct.eligibilityRules.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Eligibility Requirements:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {selectedProduct.eligibilityRules.map((rule, index) => (
                          <li key={index}>- {rule}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Loan Calculator */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Loan Calculator
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loanDetails ? (
                  <div className="space-y-4">
                    <div className="rounded-lg bg-primary/10 p-4 text-center">
                      <p className="text-sm text-muted-foreground">Monthly Payment</p>
                      <p className="text-3xl font-bold">{formatCurrency(loanDetails.monthlyPayment)}</p>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Principal Amount</span>
                        <span className="font-medium">{formatCurrency(loanDetails.principal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Interest</span>
                        <span className="font-medium">{formatCurrency(loanDetails.totalInterest)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Processing Fee</span>
                        <span className="font-medium">{formatCurrency(loanDetails.processingFee)}</span>
                      </div>
                      <div className="border-t pt-3 flex justify-between">
                        <span className="font-medium">Total Repayable</span>
                        <span className="font-bold">{formatCurrency(loanDetails.totalRepayable)}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>You will receive</span>
                        <span className="font-bold">{formatCurrency(loanDetails.disbursementAmount)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Select a product and enter amount to calculate</p>
                  </div>
                )}

                <div className="mt-6 space-y-3">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    <Send className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/loans")}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </>
  )
}
