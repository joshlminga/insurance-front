import { PageHeader } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { CreditBalanceCard } from "@/app/admin/credit/components/CreditBalanceCard"
import { CREDIT_URLS } from "@/app/admin/credit/credit-query"
import { useCan } from "@/auth/useCan"
import { MODULES } from "@/auth/module-keys"
import { UseApiQuery } from "@/hooks/hooks"
import type { CreditWallet, SubmitResponse } from "@/types/types"
import { EROUTES } from "@/utils/enums"
import { Link } from "react-router-dom"
import { ArrowRight, History } from "lucide-react"

export function CreditWalletPage() {
  const { canModuleAction } = useCan()
  const canSettle = canModuleAction(MODULES.FINANCE_CONTROL, "action")

  const { data, isLoading } = UseApiQuery<SubmitResponse>({
    url: CREDIT_URLS.wallet,
    queryOptions: {
      enabled: true,
    },
  })

  const wallet = (data?.data?.wallet ?? data?.data ?? null) as CreditWallet | null
  // Temporarily show whenever the user can settle so the recharge mechanism is discoverable.
  // Later we can restore: canSettle && usedBalance > 0
  const showRecharge = canSettle

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
          {showRecharge ? (
            <Button asChild variant="outline" className="rounded-full">
              <Link to={EROUTES.CREDIT_TRANSACTIONS}>
                Recharge credit
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default CreditWalletPage
