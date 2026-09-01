/* eslint-disable @typescript-eslint/no-explicit-any */
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button, ReuseableInput } from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import { CreateDmvicPolicyNumberRuleSchema } from '@/types/form-schema'
import type { CreateDmvicPolicyNumberRuleFormValues } from '@/types/schema'
import type { SubmitResponse } from '@/types/types'
import { EMETHODS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { DMVIC_POLICY_RULE_URLS } from '../dmvic-stock-query'
import { PolicyNumberRuleFormatHints } from '../policy-number-rule-hints'

/**
 * Create a policy-number rule — seeds internal certificates and sets the numbering sequence.
 * Policy numbers are generated on the API when certificates are issued.
 */
export function CreateDmvicPolicyNumberRuleModal({
  handleDialogContextSwitch,
  componentProps,
}: {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: {
    refetch?: () => Promise<any>
    stockId?: number
  }
}) {
  const form = useForm<CreateDmvicPolicyNumberRuleFormValues>({
    resolver: zodResolver(CreateDmvicPolicyNumberRuleSchema),
    defaultValues: {
      dmvic_stock_id: componentProps?.stockId ?? 0,
      template: 'HQ/0809/YYYY/01/05XXX',
      series: '05XXX',
      sequence_placeholder: 'XXX',
      stock: 20,
      sequence_start: '1',
      maintain_policy_number: true,
      effective_from: new Date().toISOString().slice(0, 10),
      effective_until: '',
    },
  })

  const submitMutation = UseApiMutation<SubmitResponse, Record<string, unknown>>({
    url: DMVIC_POLICY_RULE_URLS.create,
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (data) => {
        ShowToast.success(data.message || 'Policy number rule created successfully')
        form.reset()
        componentProps?.refetch?.()
        handleDialogContextSwitch({ refetch: true })
      },
      onError: (error: unknown) => {
        ShowToast.error(extractErrorMessage(error) || 'Failed to create rule')
      },
    },
  })

  const onSubmit = (data: CreateDmvicPolicyNumberRuleFormValues) => {
    submitMutation.mutate({
      dmvic_stock_id: data.dmvic_stock_id,
      template: data.template,
      series: data.series,
      sequence_placeholder: data.sequence_placeholder,
      stock: data.stock,
      sequence_start: data.sequence_start,
      maintain_policy_number: data.maintain_policy_number,
      effective_from: data.effective_from,
      effective_until: data.effective_until || null,
    })
  }

  return (
    <div className="w-full min-w-150 max-w-175 p-6 space-y-6">
      <div className="border-b pb-3">
        <h2 className="text-xl font-semibold">Add Policy Number Rule</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Define the numbering template and batch size. This also seeds internal certificates
          for the stock.
        </p>
      </div>

      <PolicyNumberRuleFormatHints />

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <div className="space-y-1">
          <ReuseableInput
            control={form.control}
            name="template"
            label="Template"
            placeholder="HQ/0809/YYYY/01/05XXX"
            className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
          />
          <small className="text-muted-foreground text-xs">
            Include YYYY, MM, and your sequence placeholder (e.g. XXX).
          </small>
        </div>

        <ReuseableInput
          control={form.control}
          name="series"
          label="Series"
          className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
        />

        <div className="space-y-1">
          <ReuseableInput
            control={form.control}
            name="sequence_placeholder"
            label="Sequence Placeholder"
            placeholder="XXX"
            className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
          />
          <small className="text-muted-foreground text-xs">
            Must match part of the template exactly.
          </small>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ReuseableInput
            control={form.control}
            name="stock"
            type="number"
            label="Batch size (min 2)"
            className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
          />
          <div className="space-y-1">
            <ReuseableInput
              control={form.control}
              name="sequence_start"
              label="Sequence start"
              className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
            />
            <small className="text-muted-foreground text-xs">Digits only, e.g. 1 or 001.</small>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ReuseableInput
            control={form.control}
            name="effective_from"
            type="date"
            label="Effective from"
            className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
          />
          <ReuseableInput
            control={form.control}
            name="effective_until"
            type="date"
            label="Effective until (optional)"
            className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
          />
        </div>

        <Controller
          control={form.control}
          name="maintain_policy_number"
          render={({ field }) => (
            <div className="flex items-center gap-3">
              <Switch checked={field.value} onCheckedChange={field.onChange} id="maintain_policy" />
              <Label htmlFor="maintain_policy">Maintain policy number on renewal</Label>
            </div>
          )}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => handleDialogContextSwitch({})}>
            Cancel
          </Button>
          <Button type="submit" loading={submitMutation.isPending}>
            Create Rule
          </Button>
        </div>
      </form>
    </div>
  )
}
