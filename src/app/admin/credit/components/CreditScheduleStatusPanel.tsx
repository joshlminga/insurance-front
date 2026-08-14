import { CreditScheduleStatusView } from "@/app/admin/credit/components/CreditScheduleStatusView"
import { CREDIT_URLS } from "@/app/admin/credit/credit-query"
import { UseApiMutation, UseApiQuery } from "@/hooks/hooks"
import type { CreditSchedule, SubmitResponse } from "@/types/types"
import { EMETHODS, POLL_INTERVAL_MS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { useMotorDocumentDownload } from "@/utils/motor-document-download"
import { ShowToast } from "@/utils/utils"
import { useEffect, useState } from "react"

type CoverStartPayload = {
  scheduleId: number
  cover_start_date: string
}

type ProceedPayload = {
  scheduleId: number
}

type CreditScheduleStatusPanelProps = {
  invoiceId: string | number
  /** Customer purchase stepper: advance to the receipt/success step after Proceed. */
  onProceeded?: () => void
  /** Dashboard default: offer the receipt PDF after payment completes. */
  showReceiptButton?: boolean
}

const TERMINAL_STATUSES = new Set(["completed", "cancelled"])

function readSchedule(payload: SubmitResponse | undefined): CreditSchedule | undefined {
  const data = payload?.data
  if (!data || Array.isArray(data) || typeof data !== "object") {
    return undefined
  }
  return data as CreditSchedule
}

const getTodayDateString = () => new Date().toISOString().split("T")[0]

/**
 * Loads GET credit/invoices/{invoice}/schedule, polls while waiting for approval,
 * and lets the payer update cover start / proceed when the API allows it.
 */
export function CreditScheduleStatusPanel({
  invoiceId,
  onProceeded,
  showReceiptButton = true,
}: CreditScheduleStatusPanelProps) {
  const [coverStartDraft, setCoverStartDraft] = useState("")

  const scheduleQuery = UseApiQuery<SubmitResponse>({
    url: CREDIT_URLS.invoiceSchedule(invoiceId),
    queryOptions: {
      enabled: Boolean(invoiceId),
      refetchInterval: (query) => {
        const schedule = readSchedule(query.state.data as SubmitResponse | undefined)
        const status = schedule?.status
        if (!status || TERMINAL_STATUSES.has(status)) {
          return false
        }
        if (status === "pending_approval") {
          return POLL_INTERVAL_MS
        }
        return false
      },
    },
  })

  const schedule = readSchedule(scheduleQuery.data)

  useEffect(() => {
    if (schedule?.cover_start_date) {
      setCoverStartDraft(schedule.cover_start_date)
    }
  }, [schedule?.cover_start_date])

  const coverStartMutation = UseApiMutation<SubmitResponse, CoverStartPayload>({
    url: (variables) => CREDIT_URLS.scheduleCoverStart(variables.scheduleId),
    method: EMETHODS.PATCH,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response?.message || "Cover start date updated")
        void scheduleQuery.refetch()
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const proceedMutation = UseApiMutation<SubmitResponse, ProceedPayload>({
    url: (variables) => CREDIT_URLS.scheduleProceed(variables.scheduleId),
    method: EMETHODS.POST,
    mutationOptions: {
      onSuccess: (response) => {
        ShowToast.success(response?.message || "Invoice paid via credit")
        void scheduleQuery.refetch()
        onProceeded?.()
      },
      onError: (error) => {
        ShowToast.error(extractErrorMessage(error))
      },
    },
  })

  const receiptMutation = useMotorDocumentDownload(
    (id) => `document/motor/receipt/${id}`,
    "Receipt"
  )

  if (scheduleQuery.isLoading && !schedule) {
    return (
      <div className="rounded-lg border bg-muted/30 p-6 text-sm text-muted-foreground">
        Loading credit approval status…
      </div>
    )
  }

  if (!schedule) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
        No credit approval schedule was found for this invoice.
      </div>
    )
  }

  return (
    <CreditScheduleStatusView
      schedule={schedule}
      coverStartDraft={coverStartDraft}
      onCoverStartDraftChange={setCoverStartDraft}
      onSaveCoverStart={() => {
        if (!schedule.id || !coverStartDraft) return
        coverStartMutation.mutate({
          scheduleId: schedule.id,
          cover_start_date: coverStartDraft,
        })
      }}
      onProceed={() => {
        if (!schedule.id) return
        proceedMutation.mutate({ scheduleId: schedule.id })
      }}
      onDownloadReceipt={
        showReceiptButton
          ? () => {
              if (!schedule.invoice_id) return
              receiptMutation.mutate(String(schedule.invoice_id))
            }
          : undefined
      }
      isSavingCoverStart={coverStartMutation.isPending}
      isProceeding={proceedMutation.isPending}
      isDownloadingReceipt={receiptMutation.isPending}
      todayMinDate={getTodayDateString()}
    />
  )
}
