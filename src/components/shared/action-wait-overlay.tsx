import { useSyncExternalStore } from "react"
import { createPortal } from "react-dom"

import { Spinner } from "@/components/ui/spinner"
import {
  getActionWaitSnapshot,
  subscribeActionWait,
} from "@/lib/action-wait"

/**
 * Shared wait message for the whole app.
 * Mounted once in main.tsx. Only appears after the action-wait delay.
 * Dark fade blocks page clicks; Cancel stays clickable when shown.
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60"
    >
      <div className="mx-4 flex max-w-sm flex-col items-center gap-4 p-8">
        <Spinner className="size-10 text-[#C20C0C]" />
        <p className="text-center text-base font-medium text-white">
          Please wait...
        </p>
        {snapshot.detail ? (
          <p className="text-center text-sm text-white/80">{snapshot.detail}</p>
        ) : null}
        {snapshot.onCancel ? (
          <button
            type="button"
            onClick={snapshot.onCancel}
            className="pointer-events-auto mt-1 text-sm text-[#C20C0C] underline"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
