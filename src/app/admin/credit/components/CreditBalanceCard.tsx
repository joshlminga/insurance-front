import { StatsCard, StatsGrid } from "@/components/shared/stats-card"
import type { CreditWallet } from "@/types/types"
import { formatCurrency, parseMoneyString } from "@/lib/format"
import { Coins, Lock, Wallet, TrendingDown } from "lucide-react"

type CreditBalanceCardProps = {
  wallet: CreditWallet | null | undefined
  isLoading?: boolean
}

export function CreditBalanceCard({ wallet, isLoading }: CreditBalanceCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
        Loading credit wallet…
      </div>
    )
  }

  if (!wallet) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/20 p-8 text-center">
        <Wallet className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <p className="font-medium">No credit allocated for this location</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Contact your finance team to assign credit to your account.
        </p>
      </div>
    )
  }

  const format = (value: string | null | undefined) =>
    formatCurrency(parseMoneyString(value))

  return (
    <StatsGrid columns={4}>
      <StatsCard
        title="Allocated"
        value={format(wallet.allocated_balance)}
        description="Total credit assigned to you"
        icon={Coins}
      />
      <StatsCard
        title="Available"
        value={format(wallet.available_balance)}
        description="Spendable right now"
        icon={Wallet}
      />
      <StatsCard
        title="Pending"
        value={format(wallet.pending_balance)}
        description="Held awaiting approval"
        icon={Lock}
      />
      <StatsCard
        title="Credit floor"
        value={format(wallet.minimum_spend_threshold)}
        description="You must keep at least this amount available after using credit."
        icon={TrendingDown}
      />
    </StatsGrid>
  )
}
