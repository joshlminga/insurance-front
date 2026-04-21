import { useCallback } from 'react'
import { useStepperStore, type PurchaseFlow } from '@/stores/stepper-store'

export function usePurchaseStepper(flow: PurchaseFlow) {
  const currentStep = useStepperStore((s) =>
    flow === 'motor' ? s.motorStep : s.marineStep
  )

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

  return { currentStep, setCurrentStep, goToNextStep, goToPrevStep }
}

export type { PurchaseFlow }
