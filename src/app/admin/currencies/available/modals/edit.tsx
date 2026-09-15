/* eslint-disable @typescript-eslint/no-explicit-any */
import { Label } from "@/components/ui/label"
import {
  Button,
  ReusableSingleSelectApiInput,
  ReuseableInput,
  ReuseableRadioChoiceGroup,
} from "@/dev/core"
import { UseApiMutation } from "@/hooks/hooks"
import { EditCurrencySchema } from "@/types/form-schema"
import type { EditCurrencyFormValues } from "@/types/schema"
import type { SubmitResponse } from "@/types/types"
import type { CurrencyRow } from "@/dev/columns/admin/currencies/available"
import { EMETHODS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import z from "zod"

export function EditCurrencyModal({
  handleDialogContextSwitch,
  componentProps,
}: {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: {
    refetch?: () => Promise<any>
    data?: CurrencyRow
  }
}) {
  const currency = componentProps?.data
  const isDefault = Boolean(currency?.is_default)

  const form = useForm<
    z.input<typeof EditCurrencySchema>,
    any,
    EditCurrencyFormValues
  >({
    resolver: zodResolver(EditCurrencySchema),
    defaultValues: {
      code: currency?.code ?? "",
      symbol: currency?.symbol ?? "",
      name: currency?.name ?? "",
      rate: Number(currency?.rate ?? 1),
      is_auto:
        currency?.is_auto === true || currency?.rate_mode === "Auto" ? "1" : "0",
      fee:
        currency?.fee === null || currency?.fee === undefined
          ? null
          : Number(currency.fee),
      country_id: currency?.country_id ? String(currency.country_id) : "",
    },
  })

  const submitMutation = UseApiMutation<
    SubmitResponse,
    Record<string, unknown> & { id: number | string }
  >({
    url: ({ id }) => `atu/multicurrency/currencies/${id}`,
    method: EMETHODS.PATCH,
    mutationOptions: {
      onSuccess: (data) => {
        ShowToast.success(data.message || "Currency updated successfully")
        componentProps?.refetch?.()
        handleDialogContextSwitch({ refetch: true })
      },
      onError: (error: unknown) => {
        ShowToast.error(extractErrorMessage(error) || "Failed to update currency")
      },
    },
  })

  const onSubmit = (data: EditCurrencyFormValues) => {
    if (!currency?.id) return

    const payload: Record<string, unknown> & { id: number | string } = {
      id: currency.id,
      code: data.code.trim().toUpperCase(),
      symbol: data.symbol.trim(),
      rate: isDefault ? 1 : data.rate,
      is_auto: data.is_auto === "1",
    }
    const name = (data.name ?? "").trim()
    if (name) payload.name = name
    if (data.fee !== null && data.fee !== undefined && !Number.isNaN(Number(data.fee))) {
      payload.fee = Number(data.fee)
    } else {
      payload.fee = null
    }
    payload.country_id = data.country_id ? Number(data.country_id) : null
    submitMutation.mutate(payload)
  }

  return (
    <div className="w-full min-w-[min(100%,36rem)] max-w-xl p-2 sm:p-4 space-y-5">
      <div className="border-b pb-3">
        <h2 className="text-xl font-semibold">Edit Currency</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Update currency details. Default currency rate stays at 1.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <ReuseableInput
              control={form.control}
              name="code"
              label="Currency Code"
              required
              placeholder="USD, EUR, ZAR, ETC."
            />
            <p className="text-xs text-muted-foreground">
              ISO 4217 currency code (3–4 characters).
            </p>
          </div>
          <div className="space-y-1">
            <ReuseableInput
              control={form.control}
              name="symbol"
              label="Currency Symbol"
              required
              placeholder="$, €, R, etc."
            />
            <p className="text-xs text-muted-foreground">
              Currency symbol to display.
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
        </div>

        <div className="space-y-1">
          <ReuseableInput
            control={form.control}
            name="rate"
            label="Conversion Rate"
            type="number"
            required
            disabled={isDefault}
            placeholder="1"
          />
          <p className="text-xs text-muted-foreground">
            {isDefault
              ? "Default currency rate is fixed at 1."
              : "Conversion rate against default currency."}
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
        </div>

        <div className="space-y-1">
          <ReuseableInput
            control={form.control}
            name="fee"
            label="Additional Fee"
            type="number"
          />
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
                selectedOption={
                  currency?.country_id && currency?.country
                    ? {
                        value: String(currency.country_id),
                        label: currency.country,
                      }
                    : undefined
                }
              />
            )}
          />
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
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
