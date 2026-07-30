/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditAmount } from "@/app/admin/credit/components/CreditAmount"
import { CreditStatusBadge } from "@/app/admin/credit/components/CreditStatusBadge"
import {
  CREDIT_URLS,
  invalidateCreditWallet,
  invalidateCreditTransactions,
} from "@/app/admin/credit/credit-query"
import { useCan } from "@/auth/useCan"
import { MODULES } from "@/auth/module-keys"
import { UseApiMutation, UseApiQuery } from "@/hooks/hooks"
import type { CreditSettlement, CreditPool, SubmitResponse } from "@/types/types"
import { EMETHODS, POLL_INTERVAL_MS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { formatDate } from "@/lib/format"
import { EROUTES } from "@/utils/enums"
import { useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const TERMINAL_STATUSES = new Set(["completed", "failed"])

export function CreditSettlementDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { canModuleAction } = useCan()
  const canSettle = canModuleAction(MODULES.FINANCE_CONTROL, "settle")
  const [financeNotes, setFinanceNotes] = useState("")
  const completedInvalidated = useRef(false)

  const settlementQuery = UseApiQuery<SubmitResponse>({
    url: CREDIT_URLS.settlement(id ?? ""),
    queryOptions: {
      enabled: Boolean(id),
      refetchInterval: (query) => {
        const payload = query.state.data as SubmitResponse | undefined
        const settlement = (payload?.data?.settlement ?? payload?.data) as CreditSettlement | undefined
        const status = settlement?.status?.toLowerCase()
        if (!status || TERMINAL_STATUSES.has(status)) return false
        return POLL_INTERVAL_MS
      },
    },
  })

  const poolQuery = UseApiQuery<SubmitResponse>({
    url: CREDIT_URLS.setupPool,
    queryOptions: {
      enabled: canSettle,
    },
  })

  const settlement = (settlementQuery.data?.data?.settlement ??
    settlementQuery.data?.data) as CreditSettlement | undefined

  const pool = (poolQuery.data?.data?.pool ?? poolQuery.data?.data) as CreditPool | undefined
  const canManualSettle =
    canSettle &&
    pool?.finance_can_override_without_payment === true &&
    settlement &&
    (settlement.status === "pending" || settlement.status === "failed")

  // When poll reaches completed, refresh wallet + transactions once
  useEffect(() => {
    const status = settlement?.status?.toLowerCase()
    if (status === "completed" && !completedInvalidated.current) {
      completedInvalidated.current = true
      void Promise.all([
        invalidateCreditWallet(queryClient),
        invalidateCreditTransactions(queryClient),
      ])
    }
  }, [settlement?.status, queryClient])

  const manualSettleMutation = UseApiMutation<SubmitResponse, { finance_notes?: string }>({
    url: CREDIT_URLS.settlementManualSettle(id ?? ""),
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: async (response) => {
        ShowToast.success(response?.message || "Settlement completed manually")
        await Promise.all([
          invalidateCreditWallet(queryClient),
          invalidateCreditTransactions(queryClient),
          settlementQuery.refetch(),
        ])
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const status = settlement?.status?.toLowerCase()
  const isPending = status === "pending" || status === "processing"

  const statusMessage: Record<string, string> = {
    pending:
      settlement?.payment_gateway === "mpesa"
        ? "Approve the M-Pesa STK push on your phone to restore credit."
        : "Complete payment in the gateway to restore your credit.",
    processing: "Confirming payment…",
    completed: "Credit restored successfully.",
    failed: "Payment failed. Start a new settlement to retry.",
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settlement detail"
        description="Track recharge payment status and linked transactions."
      />

      <Button
        type="button"
        variant="outline"
        className="rounded-full"
        onClick={() => navigate(EROUTES.CREDIT_TRANSACTIONS)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to transactions
      </Button>

      {settlementQuery.isLoading ? (
        <div className="rounded-xl border p-8 text-center text-muted-foreground">
          Loading settlement…
        </div>
      ) : !settlement ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          Settlement not found.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-xl border p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Settlement #{settlement.id}</p>
                <p className="text-3xl font-bold">
                  <CreditAmount value={settlement.total_amount} />
                </p>
              </div>
              <CreditStatusBadge status={settlement.status} />
            </div>

            <p className="text-sm">{statusMessage[status ?? ""] ?? ""}</p>

            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div>
                <span className="text-muted-foreground">Gateway: </span>
                {settlement.payment_gateway ?? settlement.payment_method ?? "—"}
              </div>
              <div>
                <span className="text-muted-foreground">Created: </span>
                {settlement.created_at ? formatDate(settlement.created_at) : "—"}
              </div>
              {settlement.completed_at ? (
                <div>
                  <span className="text-muted-foreground">Completed: </span>
                  {formatDate(settlement.completed_at)}
                </div>
              ) : null}
            </div>

            {isPending ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Checking payment status…
              </div>
            ) : null}

            {status === "completed" ? (
              <Button variant="outline" asChild>
                <Link to={EROUTES.CREDIT_WALLET}>View wallet</Link>
              </Button>
            ) : null}

            {status === "failed" ? (
              <Button
                type="button"
                onClick={() => navigate(EROUTES.CREDIT_TRANSACTIONS)}
              >
                Retry recharge
              </Button>
            ) : null}
          </div>

          {canManualSettle ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-6 space-y-4">
              <h3 className="font-semibold">Finance manual settle</h3>
              <p className="text-sm text-muted-foreground">
                Mark this settlement as completed without gateway payment.
              </p>
              <div className="space-y-2">
                <Label htmlFor="finance-notes">Finance notes (optional)</Label>
                <Input
                  id="finance-notes"
                  placeholder="Reason for manual settlement"
                  value={financeNotes}
                  onChange={(event) => setFinanceNotes(event.target.value)}
                />
              </div>
              <Button
                type="button"
                disabled={manualSettleMutation.isPending}
                onClick={() =>
                  manualSettleMutation.mutate({
                    finance_notes: financeNotes.trim() || undefined,
                  })
                }
              >
                Manual settle
              </Button>
            </div>
          ) : null}

          {settlement.items?.length ? (
            <div className="rounded-xl border p-6">
              <h3 className="mb-4 font-semibold">Included transactions</h3>
              <ul className="space-y-2 text-sm">
                {settlement.items.map((item) => (
                  <li key={item.id ?? item.credit_transaction_id} className="flex justify-between">
                    <span>
                      Transaction #{item.credit_transaction_id ?? item.credit_transaction?.id}
                    </span>
                    <CreditAmount
                      value={
                        item.amount_paid_for_this_txn ??
                        item.amount ??
                        item.credit_transaction?.amount_used
                      }
                    />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default CreditSettlementDetailPage
