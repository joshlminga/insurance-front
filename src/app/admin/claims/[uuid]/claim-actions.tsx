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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button, ReusableSelect, ReusableSingleSelectApiInput, ReuseableInput } from '@/dev/core'
import { UseApiMutation } from '@/hooks/hooks'
import type { SubmitResponse } from '@/types/types'
import { CLAIMS_API, confirmationMessage, type ClaimDetail } from '@/utils/claims'
import { EMETHODS } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { ClaimSurface, claimFieldClass } from '../claim-ui'

const detailsSchema = z.object({
  handler_id: z.string().min(1, 'Choose a handler'),
  insurer_claim_number: z.string().optional(),
  claimed_amount: z.string().optional(),
  tat_days: z.string().optional(),
  notified_to_insurer_date: z.string().optional(),
})

const statusSchema = z.object({
  status: z.string().min(1, 'Choose the next status'),
  reason: z.string().optional(),
  notify_customer: z.boolean(),
})

type DetailsValues = z.infer<typeof detailsSchema>
type StatusValues = z.infer<typeof statusSchema>
type StatusPayload = StatusValues & { confirm_warnings?: boolean }

type ActionDialog = 'details' | 'status' | null

/**
 * Claim actions live behind buttons → dialogs so the detail page stays short.
 * Same API calls as before (PATCH claim, POST status, POST recheck).
 */
export function ClaimActions({
  claim,
  orgContextHeaders,
  onChanged,
}: {
  claim: ClaimDetail
  orgContextHeaders?: Record<string, string>
  onChanged: () => void
}) {
  const orgConfig = orgContextHeaders ? { headers: orgContextHeaders } : undefined
  const [dialog, setDialog] = useState<ActionDialog>(null)
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
    claim.tatDays,
    claim.notifiedToInsurerDate,
  ])

  const patchClaim = UseApiMutation<SubmitResponse, DetailsValues>({
    url: CLAIMS_API.claim(claim.uuid),
    method: EMETHODS.PATCH,
    config: orgConfig,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response.message || 'Claim updated')
        setDialog(null)
        onChanged()
      },
      onError: (error) => ShowToast.error(extractErrorMessage(error)),
    },
  })

  const changeStatus = UseApiMutation<SubmitResponse, StatusPayload>({
    url: CLAIMS_API.status(claim.uuid),
    method: EMETHODS.POST,
    config: orgConfig,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response.message || 'Status updated')
        setConfirmText(null)
        setPendingStatus(null)
        statusForm.reset({ status: '', reason: '', notify_customer: false })
        setDialog(null)
        onChanged()
      },
      onError: (error, variables) => {
        const warning = confirmationMessage(error)
        if (warning && !variables.confirm_warnings) {
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
    config: orgConfig,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response.message || 'Policy status re-checked')
        onChanged()
      },
      onError: (error) => ShowToast.error(extractErrorMessage(error)),
    },
  })

  const submitStatus = (values: StatusValues, confirmWarnings = false) => {
    const next = values.status.toLowerCase()
    const needsInsurerNumber = next.includes('approved') || next.includes('settled')
    const typedNumber = detailsForm.getValues('insurer_claim_number')?.trim() ?? ''
    const savedNumber = claim.insurer_claim_number?.trim() ?? ''
    if (needsInsurerNumber && !typedNumber && !savedNumber) {
      ShowToast.error('Add the insurer claim number before this status.')
      setDialog('details')
      return
    }
    if (needsInsurerNumber && typedNumber && typedNumber !== savedNumber) {
      ShowToast.error('Save the insurer claim number before changing status.')
      setDialog('details')
      return
    }
    setPendingStatus(values)
    changeStatus.mutate({
      status: values.status,
      reason: values.reason?.trim() || undefined,
      notify_customer: values.notify_customer,
      ...(confirmWarnings ? { confirm_warnings: true } : {}),
    })
  }

  return (
    <>
      <ClaimSurface padding="sm">
        <h2 className="mb-3 text-base font-semibold">Actions</h2>
        <div className="flex flex-wrap gap-2">
          <Button type="button" className="rounded-xl" onClick={() => setDialog('details')}>
            Edit details
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            disabled={claim.allowedNextStatuses.length === 0}
            onClick={() => setDialog('status')}
          >
            Change status
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            disabled={recheck.isPending}
            onClick={() => recheck.mutate({})}
          >
            {recheck.isPending ? 'Checking…' : 'Re-check policy'}
          </Button>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Current status: {claim.status_label}</p>
      </ClaimSurface>

      {/* Edit handler / insurer number / amount / TAT */}
      <Dialog open={dialog === 'details'} onOpenChange={(open) => { if (!open) setDialog(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit claim details</DialogTitle>
          </DialogHeader>
          <form
            className="grid gap-3 py-2"
            onSubmit={detailsForm.handleSubmit((values) => {
              patchClaim.mutate({
                handler_id: values.handler_id,
                insurer_claim_number: values.insurer_claim_number?.trim() || undefined,
                claimed_amount: values.claimed_amount?.trim() || undefined,
                tat_days: values.tat_days?.trim() || undefined,
                notified_to_insurer_date: values.notified_to_insurer_date?.trim() || undefined,
              })
            })}
          >
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
                  labelKey="name"
                  valueKey="id"
                  config={orgConfig}
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
              thousandsSeparator
              step="0.01"
              className={claimFieldClass}
            />
            <ReuseableInput
              control={detailsForm.control}
              name="tat_days"
              label="TAT (days)"
              type="number"
              min="1"
              className={claimFieldClass}
            />
            <ReuseableInput
              control={detailsForm.control}
              name="notified_to_insurer_date"
              label="Date notified to insurer"
              type="date"
              className={claimFieldClass}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialog(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={patchClaim.isPending}>
                {patchClaim.isPending ? 'Saving…' : 'Save details'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Move to next status */}
      <Dialog open={dialog === 'status'} onOpenChange={(open) => { if (!open) setDialog(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change status</DialogTitle>
          </DialogHeader>
          <form
            className="grid gap-3 py-2"
            onSubmit={statusForm.handleSubmit((values) => submitStatus(values))}
          >
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
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialog(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={changeStatus.isPending || claim.allowedNextStatuses.length === 0}>
                {changeStatus.isPending ? 'Updating…' : 'Update status'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
    </>
  )
}

function detailsFromClaim(claim: ClaimDetail): DetailsValues {
  return {
    handler_id: claim.handlerId,
    insurer_claim_number: claim.insurer_claim_number ?? '',
    claimed_amount: claim.claimedAmount,
    tat_days: claim.tatDays,
    notified_to_insurer_date: claim.notifiedToInsurerDate ?? '',
  }
}
