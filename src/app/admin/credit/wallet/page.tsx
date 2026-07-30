import { PageHeader } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { CreditBalanceCard } from "@/app/admin/credit/components/CreditBalanceCard"
import { CREDIT_URLS } from "@/app/admin/credit/credit-query"
import { UseApiQuery } from "@/hooks/hooks"
import type { CreditWallet, SubmitResponse } from "@/types/types"
import { EROUTES } from "@/utils/enums"
import { Link } from "react-router-dom"
import { ArrowRight, History } from "lucide-react"

export function CreditWalletPage() {
  const { data, isLoading } = UseApiQuery<SubmitResponse>({
    url: CREDIT_URLS.wallet,
    queryOptions: {
      enabled: true,
    },
  })

  const wallet = (data?.data?.wallet ?? data?.data ?? null) as CreditWallet | null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Credit Wallet"
        description="View your allocated credit balance and spending limits for this location."
      />

      <CreditBalanceCard wallet={wallet} isLoading={isLoading} />

      {wallet ? (
        <div className="flex flex-wrap gap-3">
          <Button asChild className="rounded-full">
            <Link to={EROUTES.CREDIT_TRANSACTIONS}>
              <History className="mr-2 h-4 w-4" />
              View transactions
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to={EROUTES.CREDIT_TRANSACTIONS}>
              Recharge credit
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export default CreditWalletPage
