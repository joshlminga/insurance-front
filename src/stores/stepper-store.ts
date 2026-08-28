import { create } from 'zustand'

export type PurchaseFlow = 'motor' | 'marine'

type StepperState = {
  motorStep: number
  marineStep: number
  setStep: (flow: PurchaseFlow, step: number) => void
  goNext: (flow: PurchaseFlow) => void
  goPrev: (flow: PurchaseFlow) => void
}

export const useStepperStore = create<StepperState>((set, _get) => ({
  motorStep: 1,
  marineStep: 1,
  setStep: (flow, step) =>
    flow === 'motor' ? set({ motorStep: step }) : set({ marineStep: step }),
  goNext: (flow) =>
    set((s) =>
      flow === 'motor'
        ? { motorStep: s.motorStep + 1 }
        : { marineStep: s.marineStep + 1 }
    ),
  goPrev: (flow) =>
    set((s) =>
      flow === 'motor'
        ? { motorStep: Math.max(1, s.motorStep - 1) }
        : { marineStep: Math.max(1, s.marineStep - 1) }
    ),
}))
