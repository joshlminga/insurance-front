import { useSyncExternalStore } from "react"
import { createPortal } from "react-dom"

import { Spinner } from "@/components/ui/spinner"
import {
  getActionWaitSnapshot,
  subscribeActionWait,
} from "@/lib/action-wait"

/**
 * One full-screen wait state for the whole app.
 * Mounted once in main.tsx. Only appears after 5 seconds of an in-flight action.
 */
export function ActionWaitOverlay() {
  const snapshot = useSyncExternalStore(
    subscribeActionWait,
    getActionWaitSnapshot,
    getActionWaitSnapshot,
  )

  if (!snapshot.visible || typeof document === "undefined") {
    return null
  }

  return createPortal(
    <div
      role="alertdialog"
      aria-busy="true"
      aria-live="assertive"
      aria-label="Please wait"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
    >
      <div className="mx-4 flex max-w-sm flex-col items-center gap-4 rounded-2xl border border-black/10 bg-white p-8 shadow-xl">
        <Spinner className="size-10 text-[#C20C0C]" />
        <p className="text-center text-base font-medium text-gray-800">
          Please wait...
        </p>
        {snapshot.detail ? (
          <p className="text-center text-sm text-gray-500">{snapshot.detail}</p>
        ) : null}
        {snapshot.onCancel ? (
          <button
            type="button"
            onClick={snapshot.onCancel}
            className="mt-1 text-sm text-[#C20C0C] underline"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
