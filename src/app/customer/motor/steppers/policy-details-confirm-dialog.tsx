import { ConfirmationDialog } from '@/dev/core'
import {
  MOTOR_POLICY_DETAIL_ROWS,
  type MotorPolicyDetails,
} from '@/utils/motor-policy-details'

type PolicyDetailsConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  details: MotorPolicyDetails | null
  onConfirm: () => void
  onChangeDetails: () => void
  isPending?: boolean
}

/** Dark filled secondary — overrides red ghost cancel defaults. */
const CHANGE_DETAILS_BUTTON_CLASSES =
  'border-transparent bg-neutral-900 text-neutral-100 shadow-none hover:bg-neutral-800 hover:text-neutral-100 focus-visible:ring-neutral-900/30'

/**
 * Pre-payment gate: show policy preview, then either jump to KYC or continue payment.
 * Cancel = Change Details; Confirm = Policy Details Are Correct; X = dismiss only.
 */
export function PolicyDetailsConfirmDialog({
  open,
  onOpenChange,
  details,
  onConfirm,
  onChangeDetails,
  isPending = false,
}: PolicyDetailsConfirmDialogProps) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      contentSize="default"
      centered
      showCloseButton
      title="Confirm policy details"
      description="Please review these details before payment. They will appear on the insurance certificate."
      cancelButtonText="Change Details"
      cancelButtonClassName={CHANGE_DETAILS_BUTTON_CLASSES}
      confirmButtonText="Policy Details Are Correct"
      onCancel={onChangeDetails}
      onConfirm={onConfirm}
      isPending={isPending}
    >
      {details ? (
        <dl className="mt-1 space-y-2.5 rounded-lg border border-black/10 bg-neutral-50/80 px-3 py-3 text-left text-sm">
          {MOTOR_POLICY_DETAIL_ROWS.map(({ key, label }) => (
            <div
              key={key}
              className="grid grid-cols-1 gap-0.5 sm:grid-cols-[9.5rem_1fr] sm:gap-3"
            >
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-medium text-foreground break-words">
                {details[key] || '—'}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </ConfirmationDialog>
  )
}
