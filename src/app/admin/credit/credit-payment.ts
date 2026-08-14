import { CREDIT_URLS } from "@/app/admin/credit/credit-query"
import apiClient from "@/lib/api-client"
import type { AxiosResponse } from "axios"
import type { CreditPaymentPendingResponse, SubmitResponse } from "@/types/types"

export type MotorCreditPaymentResult =
  | { kind: "success"; message?: string; data?: SubmitResponse }
  | { kind: "pending_approval"; message: string; creditTransactionId?: number }
  | { kind: "validation_error"; message: string }

/** Pay an invoice with prepaid credit — handles 200, 202, 422 */
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
      const body = response.data as CreditPaymentPendingResponse
      return {
        kind: "pending_approval",
        message:
          body.message ??
          "Credit transaction requires approval before payment can proceed.",
        creditTransactionId: body.credit_transaction_id,
      }
    }

    return {
      kind: "success",
      message: response.data?.message,
      data: response.data,
    }
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { status?: number; data?: CreditPaymentPendingResponse & SubmitResponse }
    }
    const status = axiosError.response?.status
    const body = axiosError.response?.data

    if (status === 202) {
      return {
        kind: "pending_approval",
        message:
          body?.message ??
          "Credit transaction requires approval before payment can proceed.",
        creditTransactionId: body?.credit_transaction_id,
      }
    }

    if (status === 422) {
      const message =
        (typeof body?.message === "string" && body.message) ||
        "Credit validation failed. Check your balance and spending limits."
      return { kind: "validation_error", message }
    }

    throw error
  }
}
