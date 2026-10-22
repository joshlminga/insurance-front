import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, render, screen } from "@testing-library/react"
import { ActionWaitOverlay } from "@/components/shared/action-wait-overlay"
import {
  ACTION_WAIT_DELAY_MS,
  beginActionWait,
  beginActionWaitHold,
  endActionWait,
  getActionWaitSnapshot,
  releaseActionWaitHold,
  resetActionWaitForTests,
  shouldTrackActionWait,
} from "@/lib/action-wait"

describe("shouldTrackActionWait", () => {
  it("tracks mutating methods", () => {
    expect(shouldTrackActionWait("post", "users")).toBe(true)
    expect(shouldTrackActionWait("PUT", "users/1")).toBe(true)
    expect(shouldTrackActionWait("patch", "users/1")).toBe(true)
    expect(shouldTrackActionWait("delete", "users/1")).toBe(true)
  })

  it("skips reads and background auth checks", () => {
    expect(shouldTrackActionWait("get", "users")).toBe(false)
    expect(shouldTrackActionWait("post", "auth/check-auth")).toBe(false)
    expect(shouldTrackActionWait("post", "auth/refresh")).toBe(false)
  })

  it("still tracks login and logout", () => {
    expect(shouldTrackActionWait("post", "auth/login")).toBe(true)
    expect(shouldTrackActionWait("post", "auth/logout")).toBe(true)
  })
})

describe("action wait delay", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetActionWaitForTests()
  })

  afterEach(() => {
    resetActionWaitForTests()
    vi.useRealTimers()
  })

  it("stays hidden before 2 seconds and shows after", () => {
    beginActionWait()
    expect(getActionWaitSnapshot().visible).toBe(false)

    vi.advanceTimersByTime(ACTION_WAIT_DELAY_MS - 1)
    expect(getActionWaitSnapshot().visible).toBe(false)

    vi.advanceTimersByTime(1)
    expect(getActionWaitSnapshot().visible).toBe(true)
    expect(getActionWaitSnapshot().pending).toBe(1)
  })

  it("never shows when the action ends before 2 seconds", () => {
    beginActionWait()
    vi.advanceTimersByTime(ACTION_WAIT_DELAY_MS - 1)
    endActionWait()
    vi.advanceTimersByTime(ACTION_WAIT_DELAY_MS)
    expect(getActionWaitSnapshot().visible).toBe(false)
    expect(getActionWaitSnapshot().pending).toBe(0)
  })

  it("hides when the last action ends after the overlay was shown", () => {
    beginActionWait()
    vi.advanceTimersByTime(ACTION_WAIT_DELAY_MS)
    expect(getActionWaitSnapshot().visible).toBe(true)

    endActionWait()
    expect(getActionWaitSnapshot().visible).toBe(false)
  })

  it("does not restart the delay when a second action starts while waiting", () => {
    beginActionWait()
    vi.advanceTimersByTime(ACTION_WAIT_DELAY_MS - 1)
    beginActionWait()
    vi.advanceTimersByTime(1)
    expect(getActionWaitSnapshot().visible).toBe(true)
    expect(getActionWaitSnapshot().pending).toBe(2)
  })

  it("keeps the overlay for payment holds with detail and cancel", () => {
    const onCancel = vi.fn()
    beginActionWaitHold("payment-poll", {
      detail: "Please enter your PIN on the M-Pesa prompt on your phone.",
      onCancel,
    })

    vi.advanceTimersByTime(ACTION_WAIT_DELAY_MS)
    const snapshot = getActionWaitSnapshot()
    expect(snapshot.visible).toBe(true)
    expect(snapshot.detail).toContain("M-Pesa")
    expect(snapshot.onCancel).toBe(onCancel)

    releaseActionWaitHold("payment-poll")
    expect(getActionWaitSnapshot().visible).toBe(false)
  })
})

describe("ActionWaitOverlay", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetActionWaitForTests()
  })

  afterEach(() => {
    resetActionWaitForTests()
    vi.useRealTimers()
  })

  it("renders Please wait... only after the delay", () => {
    beginActionWait()
    render(<ActionWaitOverlay />)

    expect(screen.queryByText("Please wait...")).toBeNull()

    act(() => {
      vi.advanceTimersByTime(ACTION_WAIT_DELAY_MS)
    })

    expect(screen.getByText("Please wait...")).toBeInTheDocument()
  })
})
