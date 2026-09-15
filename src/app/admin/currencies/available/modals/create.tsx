/* eslint-disable @typescript-eslint/no-explicit-any */
import { Label } from "@/components/ui/label"
import {
  Button,
  ReusableSingleSelectApiInput,
  ReuseableInput,
  ReuseableRadioChoiceGroup,
} from "@/dev/core"
import { UseApiMutation } from "@/hooks/hooks"
import { CreateCurrencySchema } from "@/types/form-schema"
import type { CreateCurrencyFormValues } from "@/types/schema"
import type { SubmitResponse } from "@/types/types"
import { EMETHODS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import z from "zod"

export function CreateCurrencyModal({
  handleDialogContextSwitch,
  componentProps,
}: {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: any
}) {
  const form = useForm<
    z.input<typeof CreateCurrencySchema>,
    any,
    CreateCurrencyFormValues
  >({
    resolver: zodResolver(CreateCurrencySchema),
    defaultValues: {
      code: "",
      symbol: "",
      name: "",
      rate: 1,
      is_auto: "0",
      fee: null,
      country_id: "",
    },
  })

  const submitMutation = UseApiMutation<SubmitResponse, Record<string, unknown>>({
    url: "atu/multicurrency/currencies",
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (data) => {
        ShowToast.success(data.message || "Currency created successfully")
        form.reset()
        componentProps?.refetch?.()
        handleDialogContextSwitch({ refetch: true })
      },
      onError: (error: unknown) => {
        ShowToast.error(extractErrorMessage(error) || "Failed to create currency")
      },
    },
  })

  const onSubmit = (data: CreateCurrencyFormValues) => {
    const payload: Record<string, unknown> = {
      rate: data.rate,
      // UI: "1" = Auto (API-managed), "0" = Manual
      is_auto: data.is_auto === "1",
    }
    const code = (data.code ?? "").trim()
    const symbol = (data.symbol ?? "").trim()
    const name = (data.name ?? "").trim()
    if (code) payload.code = code.toUpperCase()
    if (symbol) payload.symbol = symbol
    if (name) payload.name = name
    if (data.fee !== null && data.fee !== undefined && !Number.isNaN(Number(data.fee))) {
      payload.fee = Number(data.fee)
    }
    if (data.country_id) {
      payload.country_id = Number(data.country_id)
    }
    submitMutation.mutate(payload)
  }

  return (
    <div className="w-full min-w-[min(100%,36rem)] max-w-xl p-2 sm:p-4 space-y-5">
      <div className="border-b pb-3">
        <h2 className="text-xl font-semibold">Add New Currency</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in the currency details below. Code or symbol is required.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <ReuseableInput
              control={form.control}
              name="code"
              label="Currency Code"
              placeholder="USD, EUR, ZAR, ETC."
            />
            <p className="text-xs text-muted-foreground">
              ISO 4217 currency code (3–4 characters, e.g., USD, EUR, ZAR). If empty, will use Currency Symbol.
            </p>
          </div>
          <div className="space-y-1">
            <ReuseableInput
              control={form.control}
              name="symbol"
              label="Currency Symbol"
              placeholder="$, €, R, etc."
            />
            <p className="text-xs text-muted-foreground">
              Currency symbol to display (e.g., $, €, R). If empty, will use Currency Code.
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <ReuseableInput
            control={form.control}
            name="name"
            label="Currency Name"
            placeholder="United States Dollar, South African Rand, etc."
          />
          <p className="text-xs text-muted-foreground">
            Optional: Full descriptive name of the currency (e.g., &quot;South African Rand&quot;, &quot;United States Dollar&quot;)
          </p>
        </div>

        <div className="space-y-1">
          <ReuseableInput
            control={form.control}
            name="rate"
            label="Conversion Rate"
            type="number"
            required
            placeholder="1"
          />
          <p className="text-xs text-muted-foreground">
            Conversion rate against default currency. Example: 1 XXX = 1 default
          </p>
        </div>

        <div className="space-y-2">
          <Label>
            Use Auto or Manual <span className="text-red-500">*</span>
          </Label>
          <Controller
            control={form.control}
            name="is_auto"
            render={({ field }) => (
              <ReuseableRadioChoiceGroup
                layout="horizontal"
                contentPosition="inline"
                showSelector
                selectorPosition="left"
                value={String(field.value)}
                onValueChange={field.onChange}
                items={[
                  { value: "1", label: "Auto (API-managed)" },
                  { value: "0", label: "Manual" },
                ]}
              />
            )}
          />
          <p className="text-xs text-muted-foreground">
            Choose whether exchangeratesapi manages rates (auto) or manual rate above will be used
          </p>
        </div>

        <div className="space-y-1">
          <ReuseableInput
            control={form.control}
            name="fee"
            label="Additional Fee"
            type="number"
            placeholder=""
          />
          <p className="text-xs text-muted-foreground">
            Optional fee to add on checkout. Example: if the rate is 10 and the fee is 2, every time on checkout a fee of 2 will be added on the total cart
          </p>
        </div>

        <div className="space-y-1">
          <Controller
            control={form.control}
            name="country_id"
            render={({ field }) => (
              <ReusableSingleSelectApiInput
                url="taxonomies/geo/country"
                queryParams={{ sort_by: "name", per_page: 100 }}
                value={String(field.value ?? "")}
                onChange={field.onChange}
                valueKey="id"
                labelKey="name"
                label="Country"
                placeholder="-- No Country --"
                searchPlaceholder="Search country..."
                emptyMessage="No countries found"
              />
            )}
          />
          <p className="text-xs text-muted-foreground">
            Optional: Select a country related to this currency
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
          <Button
            type="button"
            className="w-full sm:w-auto rounded-md border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
            onClick={() => handleDialogContextSwitch({})}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-md hover:bg-[#C20C0C]"
            loading={submitMutation.isPending}
          >
            Save Currency
          </Button>
        </div>
      </form>
    </div>
  )
}
