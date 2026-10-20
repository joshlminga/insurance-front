import { useEffect, useRef } from "react"

import {
  beginActionWaitHold,
  releaseActionWaitHold,
  type ActionWaitHoldOptions,
} from "@/lib/action-wait"

/**
 * While `active` is true, keep the shared Please-wait overlay armed
 * (still only visible after the 5s delay).
 *
 * Use this for long waits that outlive a single HTTP call, such as
 * M-Pesa / Paystack / Pesapal polling.
 */
export function useActionWaitHold(
  key: string,
  active: boolean,
  options: ActionWaitHoldOptions = {},
): void {
  const optionsRef = useRef(options)
  optionsRef.current = options

  // Lifecycle: arm / disarm without restarting when detail or Cancel changes.
  useEffect(() => {
    if (!active) {
      releaseActionWaitHold(key)
      return
    }

    beginActionWaitHold(key, optionsRef.current)
    return () => {
      releaseActionWaitHold(key)
    }
  }, [key, active])

  // Keep the overlay text and Cancel handler up to date while held.
  useEffect(() => {
    if (!active) {
      return
    }
    beginActionWaitHold(key, {
      detail: options.detail,
      onCancel: options.onCancel,
    })
  }, [key, active, options.detail, options.onCancel])
}
