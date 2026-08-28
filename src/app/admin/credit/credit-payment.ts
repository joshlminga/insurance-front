import { CREDIT_URLS } from "@/app/admin/credit/credit-query"
import apiClient from "@/lib/api-client"
import type { AxiosResponse } from "axios"
import type {
  CreditPaymentPendingResponse,
  CreditScheduleStatus,
  SubmitResponse,
} from "@/types/types"
import { EROUTES } from "@/utils/enums"

export type MotorCreditPaymentResult =
  | { kind: "success"; message?: string; data?: SubmitResponse }
  | {
      kind: "pending_approval"
      message: string
      creditTransactionId?: number
      creditScheduleId?: number
      scheduleStatus?: CreditScheduleStatus
      invoiceId?: number
      coverStartDate?: string
      requiresCoverStartUpdate?: boolean
      canProceed?: boolean
    }
  | { kind: "validation_error"; message: string }

const PENDING_MESSAGE =
  "Credit transaction requires approval before payment can proceed."

/** Dashboard URL for a payer's pending credit schedule (invoice is the route key). */
export function creditPendingDetailPath(invoiceId: string | number): string {
  return `${EROUTES.CREDIT_PENDING}/${invoiceId}`
}

function pendingFromBody(
  body: CreditPaymentPendingResponse | undefined
): MotorCreditPaymentResult {
  const data = body?.data

  return {
    kind: "pending_approval",
    message: body?.message ?? PENDING_MESSAGE,
    creditTransactionId: data?.credit_transaction_id ?? body?.credit_transaction_id,
    creditScheduleId: data?.credit_schedule_id,
    scheduleStatus: data?.schedule_status,
    invoiceId: data?.invoice_id,
    coverStartDate: data?.cover_start_date,
    requiresCoverStartUpdate: data?.requires_cover_start_update,
    canProceed: data?.can_proceed,
  }
}

/** Pay an invoice with prepaid credit — handles 200, 202, 422. Branch on HTTP 202, not success. */
export async function submitMotorCreditPayment(
  invoiceId: string,
  payload: Record<string, unknown> = {}
): Promise<MotorCreditPaymentResult> {
  try {
    const response: AxiosResponse<SubmitResponse> = await apiClient.post(
      CREDIT_URLS.invoicePay(invoiceId),
      payload
    )

    if (response.status === 202) {
      return pendingFromBody(
        response.data as unknown as CreditPaymentPendingResponse
      )
    }

    return {
      kind: "success",
      message: response.data?.message,
      data: response.data,
    }
  } catch (error: unknown) {
    const axiosError = error as {
      response?: {
        status?: number
        data?: CreditPaymentPendingResponse | SubmitResponse
      }
    }
    const status = axiosError.response?.status
    const body = axiosError.response?.data

    if (status === 202) {
      return pendingFromBody(body as CreditPaymentPendingResponse | undefined)
    }

    if (status === 422) {
      const message =
        (body &&
          typeof body === "object" &&
          "message" in body &&
          typeof body.message === "string" &&
          body.message) ||
        "Credit validation failed. Check your balance and spending limits."
      return { kind: "validation_error", message }
    }

    throw error
  }
}
