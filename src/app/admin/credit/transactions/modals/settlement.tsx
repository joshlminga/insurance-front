/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ReuseableInput } from "@/dev/core"
import { CREDIT_URLS } from "@/app/admin/credit/credit-query"
import { CreditAmount } from "@/app/admin/credit/components/CreditAmount"
import { UseApiMutation } from "@/hooks/hooks"
import { CreateSettlementSchema } from "@/types/form-schema"
import type { CreateSettlementFormValues } from "@/types/schema"
import type { CreditTransaction, SubmitResponse } from "@/types/types"
import { EMETHODS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { parseMoneyString } from "@/lib/format"
import { formatCurrency } from "@/lib/format"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type SettlementModalProps = {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: {
    selectedTransactions?: CreditTransaction[]
    refetch?: () => Promise<any>
  }
}

export default function SettlementModal({
  handleDialogContextSwitch,
  componentProps,
}: SettlementModalProps) {
  const navigate = useNavigate()
  const selectedTransactions = componentProps?.selectedTransactions ?? []

  const total = selectedTransactions.reduce(
    (sum, txn) => sum + parseMoneyString(txn.amount_used),
    0
  )

  const form = useForm<CreateSettlementFormValues>({
    resolver: zodResolver(CreateSettlementSchema),
    defaultValues: {
      payment_gateway: "mpesa",
      phone_number: "",
    },
  })

  const paymentGateway = form.watch("payment_gateway")

  const submitMutation = UseApiMutation<
    SubmitResponse,
    { credit_transaction_ids: number[]; payment_gateway: string; phone_number?: string }
  >({
    url: CREDIT_URLS.settlements,
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response?.message || "Settlement created")
        componentProps?.refetch?.()
        handleDialogContextSwitch({ refetch: true })

        const settlement = response?.data?.settlement ?? response?.data
        const settlementId = settlement?.id
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

    submitMutation.mutate({
      credit_transaction_ids: selectedTransactions.map((txn) => txn.id),
      payment_gateway: values.payment_gateway,
      phone_number: values.phone_number?.trim() || undefined,
    })
  }

  return (
    <div className="w-full min-w-120 max-w-lg p-6 space-y-6">
      <div className="border-b pb-3">
        <h2 className="text-xl font-semibold">Recharge credit</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Pay back spent credit for the selected transactions.
        </p>
      </div>

      <div className="rounded-lg border bg-muted/20 p-4 space-y-2">
        <p className="text-sm font-medium">
          {selectedTransactions.length} transaction(s) selected
        </p>
        <p className="text-2xl font-bold">{formatCurrency(total)}</p>
        <ul className="text-sm text-muted-foreground space-y-1 max-h-32 overflow-y-auto">
          {selectedTransactions.map((txn) => (
            <li key={txn.id} className="flex justify-between gap-4">
              <span>#{txn.id}</span>
              <CreditAmount value={txn.amount_used} />
            </li>
          ))}
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

        {paymentGateway === "mpesa" ? (
          <ReuseableInput
            control={form.control}
            name="phone_number"
            label="M-Pesa phone number"
            placeholder="07XXXXXXXX"
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
