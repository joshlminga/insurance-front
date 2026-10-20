/**
 * Tracks in-flight user actions (submits) and shows a shared overlay
 * only after ACTION_WAIT_DELAY_MS if work is still running.
 */

export const ACTION_WAIT_DELAY_MS = 5000

export type ActionWaitHoldOptions = {
  /** Extra line under "Please wait..." (e.g. M-Pesa PIN hint). */
  detail?: string | null
  /** When set, the overlay shows Cancel and calls this. */
  onCancel?: (() => void) | null
}

export type ActionWaitSnapshot = {
  pending: number
  visible: boolean
  detail: string | null
  onCancel: (() => void) | null
}

type Listener = () => void

let pending = 0
let visible = false
let showTimer: ReturnType<typeof setTimeout> | null = null
const holds = new Map<string, ActionWaitHoldOptions>()
const listeners = new Set<Listener>()

/** Cached for useSyncExternalStore — must be referentially stable between changes. */
let snapshot: ActionWaitSnapshot = {
  pending: 0,
  visible: false,
  detail: null,
  onCancel: null,
}

function clearShowTimer(): void {
  if (showTimer == null) {
    return
  }
  clearTimeout(showTimer)
  showTimer = null
}

function scheduleShow(): void {
  // Already showing or already waiting — do not restart the 5s window.
  if (visible || showTimer != null) {
    return
  }
  if (pending <= 0) {
    return
  }
  showTimer = setTimeout(() => {
    showTimer = null
    if (pending > 0) {
      visible = true
      notify()
    }
  }, ACTION_WAIT_DELAY_MS)
}

function pickHoldDisplay(): Pick<ActionWaitSnapshot, "detail" | "onCancel"> {
  let detail: string | null = null
  let onCancel: (() => void) | null = null
  for (const options of holds.values()) {
    if (options.detail) {
      detail = options.detail
    }
    if (options.onCancel) {
      onCancel = options.onCancel
    }
  }
  return { detail, onCancel }
}

function rebuildSnapshot(): void {
  const display = pickHoldDisplay()
  snapshot = {
    pending,
    visible,
    detail: display.detail,
    onCancel: display.onCancel,
  }
}

function notify(): void {
  rebuildSnapshot()
  for (const listener of listeners) {
    listener()
  }
}

export function getActionWaitSnapshot(): ActionWaitSnapshot {
  return snapshot
}

export function subscribeActionWait(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Count one HTTP (or other) action that has started. */
export function beginActionWait(): void {
  pending += 1
  scheduleShow()
  notify()
}

/** Count one action that has finished (success or error). */
export function endActionWait(): void {
  pending = Math.max(0, pending - 1)
  if (pending === 0) {
    clearShowTimer()
    visible = false
  }
  notify()
}

/**
 * Keep the waiter open after the first HTTP call returns (payment poll, plan update).
 * Same key updates options without bumping the count again.
 */
export function beginActionWaitHold(
  key: string,
  options: ActionWaitHoldOptions = {},
): void {
  const isNew = !holds.has(key)
  holds.set(key, options)
  if (isNew) {
    pending += 1
    scheduleShow()
  }
  notify()
}

export function releaseActionWaitHold(key: string): void {
  if (!holds.has(key)) {
    return
  }
  holds.delete(key)
  pending = Math.max(0, pending - 1)
  if (pending === 0) {
    clearShowTimer()
    visible = false
  }
  notify()
}

const MUTATING_METHODS = new Set(["post", "put", "patch", "delete"])

/** True for user submit calls that should drive the overlay. */
export function shouldTrackActionWait(
  method: string | undefined,
  url: string | undefined,
): boolean {
  const normalizedMethod = (method ?? "get").toLowerCase()
  if (!MUTATING_METHODS.has(normalizedMethod)) {
    return false
  }
  const path = String(url ?? "")
  if (path.includes("auth/check-auth") || path.includes("auth/refresh")) {
    return false
  }
  return true
}

/** Hint shown under Please wait... while a payment gateway is polling. */
export function getPaymentActionWaitDetail(options: {
  isPaystack?: boolean
  pollMode?: string | null
}): string {
  if (options.isPaystack) {
    return "Complete payment in the Paystack window if it is still open."
  }
  if (options.pollMode === "pesapal") {
    return "Complete payment on the Pesapal page if it is still open."
  }
  return "Please enter your PIN on the M-Pesa prompt on your phone."
}

/** Vitest helper — reset module state between tests. */
export function resetActionWaitForTests(): void {
  clearShowTimer()
  pending = 0
  visible = false
  holds.clear()
  notify()
}
