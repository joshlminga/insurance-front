/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ReuseableInput } from "@/dev/core"
import { CREDIT_URLS } from "@/app/admin/credit/credit-query"
import { GetCreditOutstanding } from "@/dev/columns/admin/credit/transactions"
import { interpretPaystackStatus } from "@/app/payment/payment-status"
import { UseApiMutation, UseApiQuery } from "@/hooks/hooks"
import { CreateSettlementSchema } from "@/types/form-schema"
import type { CreateSettlementFormValues } from "@/types/schema"
import type {
  CreditSettlement,
  CreditSettlementPayment,
  CreditTransaction,
  PaystackPollResponse,
  SubmitResponse,
} from "@/types/types"
import { EMETHODS, PESAPAL_PAYMENT_ENABLED, POLL_INTERVAL_MS, POLL_TIMEOUT_MS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { storePesapalCheckoutSession } from "@/utils/pesapal-payment"
import { openPaystackPopup } from "@/utils/paystack-payment"
import { EROUTES } from "@/utils/enums"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { formatCurrency } from "@/lib/format"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { useCallback, useEffect, useMemo, useState } from "react"

type SettlementModalProps = {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: {
    selectedTransactions?: CreditTransaction[]
    refetch?: () => Promise<any>
  }
}

type CreateSettlementPayload = {
  items: Array<{ credit_transaction_id: number; amount: number }>
  payment_gateway: string
  phone?: string
  email?: string
}

function creditSettlementPath(id: number): string {
  return EROUTES.CREDIT_SETTLEMENT.replace(":id", String(id))
}

export default function SettlementModal({
  handleDialogContextSwitch,
  componentProps,
}: SettlementModalProps) {
  const navigate = useNavigate()
  const selectedTransactions = componentProps?.selectedTransactions ?? []

  // Editable per-item amounts — default to outstanding (partial settle supported)
  const defaultAmounts = useMemo(() => {
    const map: Record<number, number> = {}
    selectedTransactions.forEach((txn) => {
      map[txn.id] = GetCreditOutstanding(txn)
    })
    return map
  }, [selectedTransactions])

  const [itemAmounts, setItemAmounts] = useState<Record<number, number>>(defaultAmounts)
  // After Paystack popup success we poll /paystack/status (same as cover payment).
  const [pollReference, setPollReference] = useState<string | null>(null)
  const [pendingSettlementId, setPendingSettlementId] = useState<number | null>(null)

  const total = selectedTransactions.reduce(
    (sum, txn) => sum + (itemAmounts[txn.id] ?? GetCreditOutstanding(txn)),
    0
  )

  const form = useForm<CreateSettlementFormValues>({
    resolver: zodResolver(CreateSettlementSchema),
    defaultValues: {
      payment_gateway: "mpesa",
      phone: "",
      email: "",
    },
  })

  const paymentGateway = form.watch("payment_gateway")
  const isConfirmingPaystack = Boolean(pollReference)

  const goToSettlement = useCallback(
    (settlementId: number) => {
      handleDialogContextSwitch({ refetch: true })
      navigate(creditSettlementPath(settlementId))
    },
    [handleDialogContextSwitch, navigate],
  )

  const paystackPollQuery = UseApiQuery<PaystackPollResponse>({
    url: "paystack/status",
    params: isConfirmingPaystack && pollReference ? { reference: pollReference } : undefined,
    queryOptions: {
      enabled: isConfirmingPaystack && Boolean(pollReference),
      refetchInterval: isConfirmingPaystack ? POLL_INTERVAL_MS : false,
      refetchIntervalInBackground: true,
      retry: 1,
    },
  })

  useEffect(() => {
    if (!isConfirmingPaystack || pendingSettlementId === null) return
    const timeoutId = window.setTimeout(() => {
      ShowToast.error("Payment timed out. Check the settlement page for the latest status.")
      goToSettlement(pendingSettlementId)
    }, POLL_TIMEOUT_MS)

    return () => window.clearTimeout(timeoutId)
  }, [goToSettlement, isConfirmingPaystack, pendingSettlementId])

  useEffect(() => {
    if (!isConfirmingPaystack || pendingSettlementId === null || !paystackPollQuery.data) return

    const outcome = interpretPaystackStatus(paystackPollQuery.data)
    if (outcome === "success") {
      ShowToast.success("Paystack payment confirmed.")
      goToSettlement(pendingSettlementId)
      return
    }
    if (outcome === "failed") {
      ShowToast.error("Paystack payment failed. You can retry from a new settlement.")
      goToSettlement(pendingSettlementId)
    }
  }, [goToSettlement, isConfirmingPaystack, paystackPollQuery.data, pendingSettlementId])

  const startPaystackCheckout = useCallback(
    async (payment: CreditSettlementPayment, settlementId: number) => {
      const reference = payment.reference
      const authorizationUrl = payment.authorization_url
      if (!reference) {
        ShowToast.error("Failed to initiate Paystack checkout.")
        goToSettlement(settlementId)
        return
      }

      const opened = await openPaystackPopup({
        accessCode: payment.access_code,
        publicKey: payment.public_key,
        email: form.getValues("email")?.trim() || "",
        amount: total,
        reference,
        onSuccess: () => {
          setPendingSettlementId(settlementId)
          setPollReference(reference)
        },
        onCancel: () => {
          ShowToast.error("Paystack checkout was closed. Please try again.")
          goToSettlement(settlementId)
        },
      })

      if (!opened) {
        if (!authorizationUrl) {
          ShowToast.error("Failed to open Paystack checkout.")
          goToSettlement(settlementId)
          return
        }
        ShowToast.success("Redirecting to Paystack to complete payment.")
        window.location.href = authorizationUrl
      }
    },
    [form, goToSettlement, total],
  )

  const submitMutation = UseApiMutation<SubmitResponse, CreateSettlementPayload>({
    url: CREDIT_URLS.settlements,
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (response) => {
        const settlement = (response?.data?.settlement ?? response?.data) as
          | CreditSettlement
          | undefined
        const payment = (response?.data?.payment ?? {}) as CreditSettlementPayment
        const settlementId = settlement?.id

        ShowToast.success(response?.message || "Settlement created")
        componentProps?.refetch?.()

        const redirectUrl = payment.redirect_url
        const orderTrackingId = payment.order_tracking_id
        const checkoutRequestId = payment.checkout_request_id

        // Paystack: popup first, hosted checkout as fallback — stay on this modal while we poll.
        if (settlementId && payment.gateway === "paystack") {
          void startPaystackCheckout(payment, settlementId)
          return
        }

        handleDialogContextSwitch({ refetch: true })

        // Pesapal: redirect to gateway, return to settlement detail to poll
        if (redirectUrl && orderTrackingId && settlementId) {
          const returnUrl = creditSettlementPath(settlementId)
          storePesapalCheckoutSession(orderTrackingId, returnUrl)
          window.location.href = redirectUrl
          return
        }

        // M-Pesa: STK already started — poll on detail page
        if (checkoutRequestId) {
          ShowToast.success("Check your phone and enter your M-Pesa PIN.")
        }

        if (settlementId) {
          navigate(creditSettlementPath(settlementId))
        }
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const onSubmit = (values: CreateSettlementFormValues) => {
    if (selectedTransactions.length === 0) {
      ShowToast.error("Select at least one approved transaction")
      return
    }

    const items = selectedTransactions.map((txn) => ({
      credit_transaction_id: txn.id,
      amount: itemAmounts[txn.id] ?? GetCreditOutstanding(txn),
    }))

    if (items.some((item) => !(item.amount > 0))) {
      ShowToast.error("Each item amount must be greater than zero")
      return
    }

    submitMutation.mutate({
      items,
      payment_gateway: values.payment_gateway,
      phone: values.phone?.trim() || undefined,
      email: values.email?.trim() || undefined,
    })
  }

  const showEmailField = paymentGateway === "pesapal" || paymentGateway === "paystack"

  return (
    <div className="w-full min-w-120 max-w-lg p-6 space-y-6">
      <div className="border-b pb-3">
        <h2 className="text-xl font-semibold">Recharge credit</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Pay back spent credit. You can settle a partial amount per transaction.
        </p>
      </div>

      <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
        <p className="text-sm font-medium">
          {selectedTransactions.length} transaction(s) selected
        </p>
        <p className="text-2xl font-bold">{formatCurrency(total)}</p>
        <ul className="text-sm space-y-2 max-h-40 overflow-y-auto">
          {selectedTransactions.map((txn) => {
            const maxOutstanding = GetCreditOutstanding(txn)
            return (
              <li key={txn.id} className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground shrink-0">#{txn.id}</span>
                <Input
                  type="number"
                  min={0.01}
                  step="0.01"
                  max={maxOutstanding || undefined}
                  className="h-8 w-36 text-right"
                  value={itemAmounts[txn.id] ?? maxOutstanding}
                  onChange={(event) => {
                    const next = Number(event.target.value)
                    setItemAmounts((prev) => ({
                      ...prev,
                      [txn.id]: Number.isFinite(next) ? next : 0,
                    }))
                  }}
                  aria-label={`Amount for transaction ${txn.id}`}
                />
              </li>
            )
          })}
        </ul>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label>Payment gateway</Label>
          <Controller
            name="payment_gateway"
            control={form.control}
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="mpesa" id="gateway-mpesa" />
                  <Label htmlFor="gateway-mpesa">M-Pesa</Label>
                </div>
                {PESAPAL_PAYMENT_ENABLED ? (
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="pesapal" id="gateway-pesapal" />
                    <Label htmlFor="gateway-pesapal">Pesapal</Label>
                  </div>
                ) : null}
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="paystack" id="gateway-paystack" />
                  <Label htmlFor="gateway-paystack">Paystack</Label>
                </div>
              </RadioGroup>
            )}
          />
        </div>

        <ReuseableInput
          control={form.control}
          name="phone"
          label={paymentGateway === "mpesa" ? "M-Pesa phone number" : "Phone number"}
          placeholder="07XXXXXXXX"
          required={paymentGateway === "mpesa"}
        />

        {showEmailField ? (
          <ReuseableInput
            control={form.control}
            name="email"
            label="Email"
            type="email"
            placeholder="agent@example.com"
            required={paymentGateway === "paystack"}
          />
        ) : null}

        {isConfirmingPaystack ? (
          <p className="text-sm text-muted-foreground">
            Confirming your Paystack payment...
          </p>
        ) : null}

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleDialogContextSwitch({ refetch: false })}
            disabled={submitMutation.isPending || isConfirmingPaystack}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={submitMutation.isPending || isConfirmingPaystack}
            disabled={selectedTransactions.length === 0 || isConfirmingPaystack}
          >
            Create settlement & pay
          </Button>
        </div>
      </form>
    </div>
  )
}
