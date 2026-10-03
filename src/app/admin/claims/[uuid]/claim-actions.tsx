import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button, ReusableSelect, ReusableSingleSelectApiInput, ReuseableInput } from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import type { SubmitResponse } from '@/types/types'
import { CLAIM_PRODUCT, CLAIMS_API, confirmationMessage, type ClaimDetail } from '@/utils/claims'
import { EMETHODS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { claimFieldClass } from '../claim-ui'

const detailsSchema = z.object({
  handler_id: z.string().min(1, 'Choose a handler'),
  insurer_claim_number: z.string().optional(),
  claimed_amount: z.string().optional(),
  expected_tat_days: z.string().optional(),
  date_notified_to_insurer: z.string().optional(),
})

const statusSchema = z.object({
  status: z.string().min(1, 'Choose the next status'),
  reason: z.string().optional(),
  notify_customer: z.boolean(),
})

type DetailsValues = z.infer<typeof detailsSchema>
type StatusValues = z.infer<typeof statusSchema>

/**
 * Save handler / insurer reference, move status, or re-check the policy gate.
 * A 422 with requires_confirmation asks the clerk to confirm before the API applies it.
 */
export function ClaimActions({
  claim,
  onChanged,
}: {
  claim: ClaimDetail
  onChanged: () => void
}) {
  const [confirmText, setConfirmText] = useState<string | null>(null)
  const [pendingStatus, setPendingStatus] = useState<StatusValues | null>(null)

  const detailsForm = useForm<DetailsValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: detailsFromClaim(claim),
  })
  const statusForm = useForm<StatusValues>({
    resolver: zodResolver(statusSchema),
    defaultValues: { status: '', reason: '', notify_customer: false },
  })

  useEffect(() => {
    detailsForm.reset(detailsFromClaim(claim))
    // Reset when the saved claim changes, not when the clerk is typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    claim.uuid,
    claim.handlerId,
    claim.insurer_claim_number,
    claim.claimedAmount,
    claim.expectedTatDays,
    claim.dateNotifiedToInsurer,
  ])

  const patchClaim = UseApiMutation<SubmitResponse, DetailsValues>({
    url: CLAIMS_API.claim(claim.uuid),
    method: EMETHODS.PATCH,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response.message || 'Claim updated')
        onChanged()
      },
      onError: (error) => ShowToast.error(extractErrorMessage(error)),
    },
  })

  const changeStatus = UseApiMutation<SubmitResponse, StatusValues & { confirm?: boolean }>({
    url: CLAIMS_API.status(claim.uuid),
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response.message || 'Status updated')
        setConfirmText(null)
        setPendingStatus(null)
        statusForm.reset({ status: '', reason: '', notify_customer: false })
        onChanged()
      },
      onError: (error, variables) => {
        const warning = confirmationMessage(error)
        if (warning && !variables.confirm) {
          setPendingStatus({
            status: variables.status,
            reason: variables.reason,
            notify_customer: variables.notify_customer,
          })
          setConfirmText(warning)
          return
        }
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const recheck = UseApiMutation<SubmitResponse, Record<string, never>>({
    url: CLAIMS_API.recheck(claim.uuid),
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response.message || 'Policy status re-checked')
        onChanged()
      },
      onError: (error) => ShowToast.error(extractErrorMessage(error)),
    },
  })

  const submitStatus = (values: StatusValues, confirm = false) => {
    const next = values.status.toLowerCase()
    const needsInsurerNumber = next.includes('approved') || next.includes('settled')
    const typedNumber = detailsForm.getValues('insurer_claim_number')?.trim() ?? ''
    const savedNumber = claim.insurer_claim_number?.trim() ?? ''
    if (needsInsurerNumber && !typedNumber && !savedNumber) {
      ShowToast.error('Add the insurer claim number before this status.')
      return
    }
    if (needsInsurerNumber && typedNumber && typedNumber !== savedNumber) {
      ShowToast.error('Save the insurer claim number before changing status.')
      return
    }
    setPendingStatus(values)
    changeStatus.mutate({
      status: values.status,
      reason: values.reason?.trim() || undefined,
      notify_customer: values.notify_customer,
      confirm,
    })
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form
        className="grid gap-3 rounded-lg border bg-card p-4"
        onSubmit={detailsForm.handleSubmit((values) => {
          patchClaim.mutate({
            handler_id: values.handler_id,
            insurer_claim_number: values.insurer_claim_number?.trim() || undefined,
            claimed_amount: values.claimed_amount?.trim() || undefined,
            expected_tat_days: values.expected_tat_days?.trim() || undefined,
            date_notified_to_insurer: values.date_notified_to_insurer?.trim() || undefined,
          })
        })}
      >
        <h2 className="text-lg font-semibold">Claim actions</h2>
        <Controller
          control={detailsForm.control}
          name="handler_id"
          render={({ field }) => (
            <ReusableSingleSelectApiInput
              url={CLAIMS_API.handlers}
              value={field.value}
              onChange={field.onChange}
              label="Handler"
              required
              queryParams={{ product: CLAIM_PRODUCT }}
              labelKey="name"
              valueKey="id"
              selectedOption={claim.handlerId ? {
                value: claim.handlerId,
                label: claim.handler_name || 'Current handler',
              } : undefined}
            />
          )}
        />
        <ReuseableInput
          control={detailsForm.control}
          name="insurer_claim_number"
          label="Insurer claim number"
          className={claimFieldClass}
        />
        <ReuseableInput
          control={detailsForm.control}
          name="claimed_amount"
          label="Claimed amount"
          type="number"
          step="0.01"
          className={claimFieldClass}
        />
        <ReuseableInput
          control={detailsForm.control}
          name="expected_tat_days"
          label="Expected TAT (days)"
          type="number"
          min="1"
          className={claimFieldClass}
        />
        <ReuseableInput
          control={detailsForm.control}
          name="date_notified_to_insurer"
          label="Date notified to insurer"
          type="date"
          className={claimFieldClass}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={patchClaim.isPending}>
            {patchClaim.isPending ? 'Saving…' : 'Save details'}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={recheck.isPending}
            onClick={() => recheck.mutate({})}
          >
            {recheck.isPending ? 'Checking…' : 'Re-check policy status'}
          </Button>
        </div>
      </form>

      <form
        className="grid content-start gap-3 rounded-lg border bg-card p-4"
        onSubmit={statusForm.handleSubmit((values) => submitStatus(values))}
      >
        <h2 className="text-lg font-semibold">Status</h2>
        <p className="text-sm text-muted-foreground">Current: {claim.status_label}</p>
        {claim.allowedNextStatuses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No further status changes from here.</p>
        ) : (
          <ReusableSelect
            control={statusForm.control}
            name="status"
            label="Next status"
            placeholder="Select a status"
            options={claim.allowedNextStatuses}
            required
          />
        )}
        <ReuseableInput
          control={statusForm.control}
          name="reason"
          label="Reason (optional)"
          placeholder="Leave blank to use the default reason"
          className={claimFieldClass}
        />
        <Controller
          control={statusForm.control}
          name="notify_customer"
          render={({ field }) => (
            <Label className="flex items-center gap-2 font-normal">
              <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
              Notify the customer
            </Label>
          )}
        />
        <Button type="submit" disabled={changeStatus.isPending || claim.allowedNextStatuses.length === 0}>
          {changeStatus.isPending ? 'Updating…' : 'Update status'}
        </Button>
      </form>

      <AlertDialog open={confirmText != null} onOpenChange={(open) => { if (!open) setConfirmText(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Continue with this status?</AlertDialogTitle>
            <AlertDialogDescription>{confirmText}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingStatus) submitStatus(pendingStatus, true)
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function detailsFromClaim(claim: ClaimDetail): DetailsValues {
  return {
    handler_id: claim.handlerId,
    insurer_claim_number: claim.insurer_claim_number ?? '',
    claimed_amount: claim.claimedAmount,
    expected_tat_days: claim.expectedTatDays,
    date_notified_to_insurer: claim.dateNotifiedToInsurer ?? '',
  }
}
