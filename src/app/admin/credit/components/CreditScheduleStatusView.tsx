import { CreditStatusBadge } from "@/app/admin/credit/components/CreditStatusBadge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { CreditSchedule } from "@/types/types"
import { formatDate } from "@/lib/format"

export type CreditScheduleStatusViewProps = {
  schedule: CreditSchedule
  /** Local date input value (YYYY-MM-DD) while the user edits */
  coverStartDraft: string
  onCoverStartDraftChange: (value: string) => void
  onSaveCoverStart: () => void
  onProceed: () => void
  onDownloadReceipt?: () => void
  isSavingCoverStart?: boolean
  isProceeding?: boolean
  isDownloadingReceipt?: boolean
  todayMinDate: string
}

function isOpenSchedule(status: string | undefined): boolean {
  return status === "pending_approval" || status === "awaiting_cover_update"
}

function bannerCopy(schedule: CreditSchedule): { title: string; body: string; className: string } {
  if (schedule.status === "pending_approval") {
    return {
      title: "Waiting for manager approval",
      body: "Credit is reserved. The invoice stays unpaid until a manager approves this spend.",
      className: "border-amber-300 bg-amber-50 text-amber-950",
    }
  }

  if (schedule.status === "awaiting_cover_update") {
    return {
      title: "Cover start date must be updated",
      body: "Approval is complete, but the cover start date is in the past. Set today or a future date, then proceed to finish payment.",
      className: "border-orange-300 bg-orange-50 text-orange-950",
    }
  }

  if (schedule.status === "completed") {
    return {
      title: "Credit payment completed",
      body: "The invoice is paid. You can open the receipt.",
      className: "border-green-300 bg-green-50 text-green-950",
    }
  }

  return {
    title: "Credit spend was rejected",
    body: "This credit payment was cancelled. Credit has been returned to the wallet.",
    className: "border-red-300 bg-red-50 text-red-950",
  }
}

/**
 * Presentational status UI for a credit schedule.
 * The parent (CreditScheduleStatusPanel) loads data and talks to the API.
 */
export function CreditScheduleStatusView({
  schedule,
  coverStartDraft,
  onCoverStartDraftChange,
  onSaveCoverStart,
  onProceed,
  onDownloadReceipt,
  isSavingCoverStart,
  isProceeding,
  isDownloadingReceipt,
  todayMinDate,
}: CreditScheduleStatusViewProps) {
  const banner = bannerCopy(schedule)
  const canEditCover =
    isOpenSchedule(schedule.status) && schedule.invoice_unpaid !== false
  const canProceed = schedule.can_proceed === true
  const showReceipt = schedule.status === "completed" && Boolean(onDownloadReceipt)

  return (
    <div className="space-y-4">
      <div className={`rounded-lg border p-4 text-sm ${banner.className}`}>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{banner.title}</p>
          <CreditStatusBadge status={schedule.status} />
        </div>
        <p className="mt-1">{banner.body}</p>
        {schedule.status === "cancelled" && schedule.rejection_reason ? (
          <p className="mt-2 font-medium">Reason: {schedule.rejection_reason}</p>
        ) : null}
      </div>

      <dl className="grid gap-3 rounded-lg border bg-muted/20 p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Invoice</dt>
          <dd className="font-medium">#{schedule.invoice_id ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Cover start date</dt>
          <dd className="font-medium">
            {schedule.cover_start_date ? formatDate(schedule.cover_start_date) : "—"}
          </dd>
        </div>
      </dl>

      {canEditCover ? (
        <div className="space-y-3 rounded-lg border p-4">
          <div className="space-y-2">
            <Label htmlFor="credit-cover-start-date">Cover start date</Label>
            <input
              id="credit-cover-start-date"
              type="date"
              min={todayMinDate}
              value={coverStartDraft}
              onChange={(event) => onCoverStartDraftChange(event.target.value)}
              className="h-9 w-full rounded-md border border-black/30 bg-white px-3 text-sm"
            />
            <p className="text-xs text-muted-foreground">
              You can change this while the invoice is still unpaid. Use today or a future date.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={onSaveCoverStart}
            disabled={!coverStartDraft || isSavingCoverStart}
          >
            {isSavingCoverStart ? "Saving…" : "Save cover start date"}
          </Button>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {isOpenSchedule(schedule.status) ? (
          <Button type="button" onClick={onProceed} disabled={!canProceed || isProceeding}>
            {isProceeding ? "Completing payment…" : "Proceed"}
          </Button>
        ) : null}
        {showReceipt ? (
          <Button
            type="button"
            variant="outline"
            onClick={onDownloadReceipt}
            disabled={isDownloadingReceipt}
          >
            {isDownloadingReceipt ? "Opening receipt…" : "Open receipt"}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
