/* eslint-disable @typescript-eslint/no-explicit-any */
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button, ReuseableInput } from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import { EditDmvicPolicyNumberRuleSchema } from '@/types/form-schema'
import type { EditDmvicPolicyNumberRuleFormValues } from '@/types/schema'
import type { SubmitResponse } from '@/types/types'
import { EMETHODS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useEffect } from 'react'
import {
  dmvicRuleHasAllocations,
  type DmvicPolicyNumberRuleRow,
  DMVIC_POLICY_RULE_URLS,
} from '../dmvic-stock-query'
import { PolicyNumberRuleFormatHints } from '../policy-number-rule-hints'

/** Edit rule — format/sequence fields lock after the first allocation. */
export function EditDmvicPolicyNumberRuleModal({
  handleDialogContextSwitch,
  componentProps,
}: {
  handleDialogContextSwitch: (context?: any) => void
  componentProps?: {
    refetch?: () => Promise<any>
    data?: DmvicPolicyNumberRuleRow
  }
}) {
  const rule = componentProps?.data
  const locked = rule ? dmvicRuleHasAllocations(rule) : false

  const form = useForm<EditDmvicPolicyNumberRuleFormValues>({
    resolver: zodResolver(EditDmvicPolicyNumberRuleSchema),
    defaultValues: {
      template: '',
      series: '',
      sequence_placeholder: '',
      stock: 2,
      sequence_start: '1',
      maintain_policy_number: true,
      effective_from: '',
      effective_until: '',
    },
  })

  useEffect(() => {
    if (!rule) {
      return
    }
    form.reset({
      template: rule.template,
      series: rule.series,
      sequence_placeholder: rule.sequence_placeholder,
      stock: rule.stock,
      sequence_start: rule.sequence_start,
      maintain_policy_number: rule.maintain_policy_number,
      effective_from: rule.effective_from?.slice(0, 10) ?? '',
      effective_until: rule.effective_until?.slice(0, 10) ?? '',
    })
  }, [rule, form])

  const submitMutation = UseApiMutation<
    SubmitResponse,
    Record<string, unknown> & { id: number }
  >({
    url: ({ id }) => DMVIC_POLICY_RULE_URLS.update(id),
    method: EMETHODS.PATCH,
    mutationOptions: {
      onSuccess: (data) => {
        ShowToast.success(data.message || 'Policy number rule updated successfully')
        componentProps?.refetch?.()
        handleDialogContextSwitch({ refetch: true })
      },
      onError: (error: unknown) => {
        ShowToast.error(extractErrorMessage(error) || 'Failed to update rule')
      },
    },
  })

  const onSubmit = (data: EditDmvicPolicyNumberRuleFormValues) => {
    if (!rule?.id) {
      return
    }

    const payload: Record<string, unknown> = {
      id: rule.id,
      maintain_policy_number: data.maintain_policy_number,
      effective_until: data.effective_until || null,
    }

    if (!locked) {
      payload.template = data.template
      payload.series = data.series
      payload.sequence_placeholder = data.sequence_placeholder
      payload.stock = data.stock
      payload.sequence_start = data.sequence_start
      payload.effective_from = data.effective_from
    }

    submitMutation.mutate(payload)
  }

  return (
    <div className="w-full min-w-150 max-w-175 p-6 space-y-6">
      <div className="border-b pb-3">
        <h2 className="text-xl font-semibold">Edit Policy Number Rule</h2>
        {locked ? (
          <p className="text-sm text-amber-700 mt-1">
            Format and sequence are locked because policy numbers have been allocated. Create a
            new rule to restock with a different series.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground mt-1">
            Update the numbering template before any certificates are issued from this rule.
          </p>
        )}
      </div>

      {!locked ? <PolicyNumberRuleFormatHints /> : null}

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <ReuseableInput
          control={form.control}
          name="template"
          label="Template"
          disabled={locked}
          className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
        />

        <ReuseableInput
          control={form.control}
          name="series"
          label="Series"
          disabled={locked}
          className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
        />

        <ReuseableInput
          control={form.control}
          name="sequence_placeholder"
          label="Sequence Placeholder"
          disabled={locked}
          className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
        />

        <div className="grid grid-cols-2 gap-4">
          <ReuseableInput
            control={form.control}
            name="stock"
            type="number"
            label="Batch size"
            disabled={locked}
            className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
          />
          <ReuseableInput
            control={form.control}
            name="sequence_start"
            label="Sequence start"
            disabled={locked}
            className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
          />
        </div>

        {rule ? (
          <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
            Sequence next: <span className="font-medium text-foreground">{rule.sequence_next}</span>
            {' · '}
            End: <span className="font-medium text-foreground">{rule.sequence_end}</span>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-4">
          <ReuseableInput
            control={form.control}
            name="effective_from"
            type="date"
            label="Effective from"
            disabled={locked}
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
              <Switch checked={field.value} onCheckedChange={field.onChange} id="edit_maintain" />
              <Label htmlFor="edit_maintain">Maintain policy number on renewal</Label>
            </div>
          )}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => handleDialogContextSwitch({})}>
            Cancel
          </Button>
          <Button type="submit" loading={submitMutation.isPending}>
            Save Rule
          </Button>
        </div>
      </form>
    </div>
  )
}
