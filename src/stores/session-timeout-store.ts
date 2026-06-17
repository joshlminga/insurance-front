import { create } from 'zustand'

/** Fired by the API client when a 401 is received outside the login page. */
export const SESSION_EXPIRED_EVENT = 'session:expired'

type SessionTimeoutState = {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const useSessionTimeoutStore = create<SessionTimeoutState>((set) => ({
  isOpen: false,
  open: () =>
    set((state) => {
      if (state.isOpen) return state
      return { isOpen: true }
    }),
  close: () => set({ isOpen: false }),
}))

/** Lets non-React code (axios interceptor) open the session dialog. */
export function emitSessionExpired() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT))
}
