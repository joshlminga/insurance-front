import { useCallback } from 'react'

import {
  useStepperStore,
  type PurchaseFlow,
} from '@/stores/stepper-store'

export function usePurchaseStepper(flow: PurchaseFlow) {
  const currentStep = useStepperStore((state) => {
    if (flow === 'motor') {
      return state.motorStep
    }

    if (flow === 'marine') {
      return state.marineStep
    }

    return state.travelStep
  })

  const setCurrentStep = useCallback(
    (step: number) => {
      useStepperStore.getState().setStep(flow, step)
    },
    [flow]
  )

  const goToNextStep = useCallback(() => {
    useStepperStore.getState().goNext(flow)
  }, [flow])

  const goToPrevStep = useCallback(() => {
    useStepperStore.getState().goPrev(flow)
  }, [flow])

  return {
    currentStep,
    setCurrentStep,
    goToNextStep,
    goToPrevStep,
  }
}