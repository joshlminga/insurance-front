/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ReuseableInput } from "@/dev/core"
import { CREDIT_URLS } from "@/app/admin/credit/credit-query"
import { getCreditOutstanding } from "@/dev/columns/admin/credit/transactions"
import { UseApiMutation } from "@/hooks/hooks"
import { CreateSettlementSchema } from "@/types/form-schema"
import type { CreateSettlementFormValues } from "@/types/schema"
import type {
  CreditSettlement,
  CreditSettlementPayment,
  CreditTransaction,
  SubmitResponse,
} from "@/types/types"
import { EMETHODS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { storePesapalCheckoutSession } from "@/utils/pesapal-payment"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { formatCurrency } from "@/lib/format"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { useMemo, useState } from "react"

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
      map[txn.id] = getCreditOutstanding(txn)
    })
    return map
  }, [selectedTransactions])

  const [itemAmounts, setItemAmounts] = useState<Record<number, number>>(defaultAmounts)

  const total = selectedTransactions.reduce(
    (sum, txn) => sum + (itemAmounts[txn.id] ?? getCreditOutstanding(txn)),
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
        handleDialogContextSwitch({ refetch: true })

        const redirectUrl = payment.redirect_url
        const orderTrackingId = payment.order_tracking_id
        const checkoutRequestId = payment.checkout_request_id

        // Pesapal: redirect to gateway, return to settlement detail to poll
        if (redirectUrl && orderTrackingId && settlementId) {
          const returnUrl = `/dashboard/credit/settlements/${settlementId}`
          storePesapalCheckoutSession(orderTrackingId, returnUrl)
          window.location.href = redirectUrl
          return
        }

        // M-Pesa: STK already started — poll on detail page
        if (checkoutRequestId) {
          ShowToast.success("Check your phone and enter your M-Pesa PIN.")
        }

        if (settlementId) {
          navigate(`/dashboard/credit/settlements/${settlementId}`)
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
      amount: itemAmounts[txn.id] ?? getCreditOutstanding(txn),
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
            const maxOutstanding = getCreditOutstanding(txn)
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
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="mpesa" id="gateway-mpesa" />
                  <Label htmlFor="gateway-mpesa">M-Pesa</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="pesapal" id="gateway-pesapal" />
                  <Label htmlFor="gateway-pesapal">Pesapal</Label>
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

        {paymentGateway === "pesapal" ? (
          <ReuseableInput
            control={form.control}
            name="email"
            label="Email"
            type="email"
            placeholder="agent@example.com"
          />
        ) : null}

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleDialogContextSwitch({ refetch: false })}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={submitMutation.isPending}
            disabled={selectedTransactions.length === 0}
          >
            Create settlement & pay
          </Button>
        </div>
      </form>
    </div>
  )
}
