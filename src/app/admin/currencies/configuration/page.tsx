/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCan } from "@/auth/useCan"
import { MODULES } from "@/auth/module-keys"
import { PageHeader } from "@/components/shared"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button, ReuseableInput } from "@/dev/core"
import { UseApiMutation, UseApiQuery } from "@/hooks/hooks"
import { MulticurrencySettingsSchema } from "@/types/form-schema"
import type { MulticurrencySettingsFormValues } from "@/types/schema"
import type { SubmitResponse } from "@/types/types"
import { EMETHODS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckSquare } from "lucide-react"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import z from "zod"

type SettingsPayload = {
  settings_source?: string
  default_currency_code?: string
  conversion?: {
    apply_fees?: boolean
    log_conversions?: boolean
    round_precision?: number
  }
}

export function CurrenciesConfigurationPage() {
  const { canModuleAction } = useCan()
  const canUpdate = canModuleAction(MODULES.ATU_MULTICURRENCY_SETTINGS, "update")

  const { data, isLoading, refetch } = UseApiQuery<SubmitResponse>({
    url: "atu/multicurrency/settings",
  })

  const settings = (data?.data ?? {}) as SettingsPayload
  const settingsSource = settings.settings_source ?? "—"
  const defaultCurrency = settings.default_currency_code ?? "—"
  const canEditSource = settings.settings_source === "database"
  const fieldsDisabled = !canEditSource || !canUpdate

  const form = useForm<
    z.input<typeof MulticurrencySettingsSchema>,
    any,
    MulticurrencySettingsFormValues
  >({
    resolver: zodResolver(MulticurrencySettingsSchema),
    defaultValues: {
      apply_fees: true,
      log_conversions: true,
      round_precision: 2,
    },
  })

  useEffect(() => {
    if (!settings.conversion) return
    form.reset({
      apply_fees: Boolean(settings.conversion.apply_fees),
      log_conversions: Boolean(settings.conversion.log_conversions),
      round_precision: Number(settings.conversion.round_precision ?? 2),
    })
  }, [settings.conversion?.apply_fees, settings.conversion?.log_conversions, settings.conversion?.round_precision])

  const saveMutation = UseApiMutation<
    SubmitResponse,
    MulticurrencySettingsFormValues
  >({
    url: "atu/multicurrency/settings",
    method: EMETHODS.PATCH,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response?.message || "Settings saved")
        refetch()
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const onSubmit = (values: MulticurrencySettingsFormValues) => {
    if (!canEditSource) {
      ShowToast.error("Settings can only be updated when source is Database")
      return
    }
    saveMutation.mutate(values)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Currency Configuration"
        description="Preview default currency and update conversion behaviour."
      />

      <div className="rounded-lg border bg-card p-6 space-y-6 max-w-2xl">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading settings…</p>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="default-currency">Default Currency</Label>
              <Input
                id="default-currency"
                value={defaultCurrency}
                disabled
                readOnly
              />
              <p className="text-xs text-muted-foreground">
                The default currency cannot be changed from this interface.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="settings-source">Settings Source</Label>
              <Input
                id="settings-source"
                value={settingsSource}
                disabled
                readOnly
              />
              <p className="text-xs text-muted-foreground">
                {canEditSource
                  ? "Settings are currently loaded from database."
                  : "Settings are not loaded from database — editable fields are locked until ATU_CURRENCY_SETTINGS_SOURCE=database."}
              </p>
            </div>

            <Controller
              control={form.control}
              name="apply_fees"
              render={({ field }) => (
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="apply_fees"
                    checked={field.value}
                    disabled={fieldsDisabled}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                    className="mt-0.5"
                  />
                  <div className="space-y-1">
                    <Label htmlFor="apply_fees" className="font-medium">
                      Apply Fees
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Enable automatic fee application during currency conversion. Fees are added to the converted amount.
                    </p>
                  </div>
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="log_conversions"
              render={({ field }) => (
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="log_conversions"
                    checked={field.value}
                    disabled={fieldsDisabled}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                    className="mt-0.5"
                  />
                  <div className="space-y-1">
                    <Label htmlFor="log_conversions" className="font-medium">
                      Log Conversions
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Enable logging of all currency conversions to the conversion log table for audit and reporting purposes.
                    </p>
                  </div>
                </div>
              )}
            />

            <div className="space-y-1">
              <ReuseableInput
                control={form.control}
                name="round_precision"
                label="Round Precision"
                type="number"
                min={0}
                max={10}
                required
                disabled={fieldsDisabled}
              />
              <p className="text-xs text-muted-foreground">
                Number of decimal places to round converted amounts to (0–10).
              </p>
            </div>

            <div className="border-t pt-4 flex justify-end">
              <Button
                type="submit"
                disabled={fieldsDisabled}
                loading={saveMutation.isPending}
                className="gap-2"
              >
                <CheckSquare className="size-4" />
                Save Settings
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default CurrenciesConfigurationPage
