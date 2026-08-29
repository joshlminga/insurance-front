import { EROUTES } from './enums'
import { getPaymentReturnPath } from '@/app/payment/payment-session'

const PAYSTACK_INLINE_SCRIPT = 'https://js.paystack.co/v2/inline.js'

/** Public default; prefer getPaystackReturnRoute() when flow may be admin. */
export const PAYSTACK_RETURN_ROUTE = EROUTES.PAYMENT_PAYSTACK_RETURN

/** Admin vs public Paystack return/checking URL from payment session flow. */
export function getPaystackReturnRoute(): string {
  return getPaymentReturnPath('paystack')
}

type PaystackPopupCallbacks = {
  onSuccess?: (transaction?: { reference?: string }) => void
  onCancel?: () => void
}

type PaystackPopInstance = {
  resumeTransaction?: (accessCode: string, callbacks?: PaystackPopupCallbacks) => void
  newTransaction?: (options: Record<string, unknown>) => void
}

type PaystackPopStatic = {
  new (): PaystackPopInstance
  resumeTransaction?: (accessCode: string, callbacks?: PaystackPopupCallbacks) => void
  setup?: (options: Record<string, unknown>) => { openIframe: () => void }
}

declare global {
  interface Window {
    PaystackPop?: PaystackPopStatic
  }
}

export type OpenPaystackCheckoutInput = {
  accessCode?: string | null
  publicKey?: string | null
  email: string
  /** Amount in major units (e.g. shillings). Converted to kobo/cents for setup(). */
  amount: number
  reference: string
  onSuccess: (transaction?: { reference?: string }) => void
  onCancel: () => void
}

export function isPaystackStatusSuccess(status?: string | null): boolean {
  const normalized = status?.toLowerCase()
  return normalized === 'completed' || normalized === 'success' || normalized === 'successful'
}

export function isPaystackStatusFailed(status?: string | null): boolean {
  const normalized = status?.toLowerCase()
  return (
    normalized === 'failed' ||
    normalized === 'cancelled' ||
    normalized === 'canceled' ||
    normalized === 'abandoned' ||
    normalized === 'reversed' ||
    normalized === 'error'
  )
}

export function loadPaystackInlineScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Paystack is only available in the browser'))
  }

  if (window.PaystackPop) {
    return Promise.resolve()
  }

  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${PAYSTACK_INLINE_SCRIPT}"]`,
  )
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Failed to load Paystack')), {
        once: true,
      })
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = PAYSTACK_INLINE_SCRIPT
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Paystack'))
    document.head.appendChild(script)
  })
}

/**
 * Try Paystack's popup first. Returns false when the script/popup cannot start
 * so the caller can redirect to the hosted checkout URL.
 */
export async function openPaystackPopup(input: OpenPaystackCheckoutInput): Promise<boolean> {
  try {
    await loadPaystackInlineScript()
  } catch {
    return false
  }

  const PaystackPop = window.PaystackPop
  if (!PaystackPop) {
    return false
  }

  const callbacks: PaystackPopupCallbacks = {
    onSuccess: input.onSuccess,
    onCancel: input.onCancel,
  }

  try {
    if (input.accessCode && typeof PaystackPop === 'function') {
      const popup = new PaystackPop()
      if (typeof popup.resumeTransaction === 'function') {
        popup.resumeTransaction(input.accessCode, callbacks)
        return true
      }
    }

    if (input.accessCode && typeof PaystackPop.resumeTransaction === 'function') {
      PaystackPop.resumeTransaction(input.accessCode, callbacks)
      return true
    }

    if (input.publicKey && typeof PaystackPop.setup === 'function') {
      const handler = PaystackPop.setup({
        key: input.publicKey,
        email: input.email,
        amount: Math.round(input.amount * 100),
        ref: input.reference,
        callback: input.onSuccess,
        onClose: input.onCancel,
      })
      handler.openIframe()
      return true
    }
  } catch {
    return false
  }

  return false
}
