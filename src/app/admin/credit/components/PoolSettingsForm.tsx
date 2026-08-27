import { Button, ReuseableInput, ReusableSelect } from "@/dev/core"
import type { PoolSettingsFormValues } from "@/types/schema"
import { Controller, type Control } from "react-hook-form"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

type PoolSettingsFormProps = {
  control: Control<PoolSettingsFormValues>
  requiresApproval: boolean
  roleOptions: Array<{ label: string; value: string }>
  isSaving?: boolean
  isLoading?: boolean
  onSubmit: () => void
}

export function PoolSettingsForm({
  control,
  requiresApproval,
  roleOptions,
  isSaving,
  isLoading,
  onSubmit,
}: PoolSettingsFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <ReuseableInput
          control={control}
          name="total_available"
          label="Pool ceiling (KES)"
          type="text"
          thousandsSeparator
          required
        />

        {requiresApproval ? (
          <ReuseableInput
            control={control}
            name="auto_approve_threshold"
            label="Auto-approve threshold (KES)"
            type="text"
            thousandsSeparator
          />
        ) : null}

        <ReusableSelect
          control={control}
          name="finance_role_id"
          label="Finance role"
          placeholder="Select role"
          options={roleOptions}
        />

        <ReusableSelect
          control={control}
          name="overall_manager_role_id"
          label="Overall manager role"
          placeholder="Select role"
          options={roleOptions}
        />
      </div>

      <div className="flex flex-wrap gap-6">
        <Controller
          name="requires_approval"
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-3">
              <Switch checked={field.value} onCheckedChange={field.onChange} id="requires_approval" />
              <Label htmlFor="requires_approval">Require approval before deduction</Label>
            </div>
          )}
        />

        <Controller
          name="finance_can_override_without_payment"
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-3">
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                id="finance_override"
              />
              <Label htmlFor="finance_override">Finance can override without payment</Label>
            </div>
          )}
        />
      </div>

      <Button type="submit" loading={isSaving || isLoading}>
        Save pool settings
      </Button>
    </form>
  )
}
