// import { create } from 'zustand'

// export type PurchaseFlow = 'motor' | 'marine' | 'travel'

// type StepperState = {
//   motorStep: number
//   marineStep: number
//   travelStep: number
//   setStep: (flow: PurchaseFlow, step: number) => void
//   goNext: (flow: PurchaseFlow) => void
//   goPrev: (flow: PurchaseFlow) => void
// }

// export const useStepperStore = create<StepperState>((set, get) => ({
//   motorStep: 1,
//   marineStep: 1,
//   travelStep: 1,
//   setStep: (flow, step) =>
//     flow === 'motor' ? set({ motorStep: step }) : set({ marineStep: step }),
//   goNext: (flow) =>
//     set((s) =>
//       flow === 'motor'
//         ? { motorStep: s.motorStep + 1 }
//         : { marineStep: s.marineStep + 1 }
//     ),
//   goPrev: (flow) =>
//     set((s) =>
//       flow === 'motor'
//         ? { motorStep: Math.max(1, s.motorStep - 1) }
//         : { marineStep: Math.max(1, s.marineStep - 1) }
//     ),
// }))


import { create } from 'zustand'

export type PurchaseFlow = 'motor' | 'marine' | 'travel'

type StepperState = {
  motorStep: number
  marineStep: number
  travelStep: number
  setStep: (flow: PurchaseFlow, step: number) => void
  goNext: (flow: PurchaseFlow) => void
  goPrev: (flow: PurchaseFlow) => void
}

export const useStepperStore = create<StepperState>((set) => ({
  motorStep: 1,
  marineStep: 1,
  travelStep: 1,

  setStep: (flow, step) => {
    if (flow === 'motor') {
      set({ motorStep: step })
    } else if (flow === 'marine') {
      set({ marineStep: step })
    } else {
      set({ travelStep: step })
    }
  },

  goNext: (flow) => {
    if (flow === 'motor') {
      set((state) => ({ motorStep: state.motorStep + 1 }))
    } else if (flow === 'marine') {
      set((state) => ({ marineStep: state.marineStep + 1 }))
    } else {
      set((state) => ({ travelStep: state.travelStep + 1 }))
    }
  },

  goPrev: (flow) => {
    if (flow === 'motor') {
      set((state) => ({
        motorStep: Math.max(1, state.motorStep - 1),
      }))
    } else if (flow === 'marine') {
      set((state) => ({
        marineStep: Math.max(1, state.marineStep - 1),
      }))
    } else {
      set((state) => ({
        travelStep: Math.max(1, state.travelStep - 1),
      }))
    }
  },
}))