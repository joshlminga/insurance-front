import { PageHeader } from '@/components/shared'
import { KycInfo } from '@/app/customer/motor/steppers/kyc-info'
import { SuccessPurchase } from '@/app/customer/motor/steppers/success-purchase'
import {
    ADMIN_MOTOR_PURCHASE_STEP_KEY,
} from '@/app/payment/payment-session'
import {
    INVOICE_SESSION_STORAGE_KEY,
    PURCHASE_SESSION_STORAGE_KEY,
} from '@/utils/constatnts'
import { EROUTES } from '@/utils/enums'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UseAuth } from '@/stores/auth-store'
import { resolveAdminMotorPayeeContact } from '../admin-motor-session'
import { AdminMotorInvoicePayment } from '../steppers/invoice-payment'
import { AdminMotorPaymentOptions } from '../steppers/payment-options'

const PURCHASE_STEPS = [
    { title: 'KYC', Component: KycInfo },
    { title: 'Invoice', Component: AdminMotorInvoicePayment },
    { title: 'Payment', Component: AdminMotorPaymentOptions },
    { title: 'Success', Component: SuccessPurchase },
] as const

const readSessionValue = (key: string) => {
    if (typeof window === 'undefined') return null
    const value = sessionStorage.getItem(key)?.trim()
    return value || null
}

const hasSessionValue = (key: string) => Boolean(readSessionValue(key))

const readStoredPurchaseStep = () => {
    const stored = readSessionValue(ADMIN_MOTOR_PURCHASE_STEP_KEY)
    const parsed = stored ? Number(stored) : 1
    if (Number.isInteger(parsed) && parsed >= 1 && parsed <= PURCHASE_STEPS.length) {
        return parsed
    }
    return 1
}

export const AdminMotorQuotationPurchasePage = () => {
    const navigate = useNavigate()
    const { user } = UseAuth()
    const [step, setStep] = useState(readStoredPurchaseStep)
    const defaultCustomerContact = resolveAdminMotorPayeeContact(user)

    useEffect(() => {
        sessionStorage.setItem(ADMIN_MOTOR_PURCHASE_STEP_KEY, String(step))
    }, [step])

    useEffect(() => {
        if (step === 1 && !hasSessionValue(PURCHASE_SESSION_STORAGE_KEY)) {
            navigate(EROUTES.MOTOR_QUOTATION_RESULTS, { replace: true })
            return
        }
        if (step >= 2 && !hasSessionValue(INVOICE_SESSION_STORAGE_KEY)) {
            navigate(EROUTES.MOTOR_QUOTATION_RESULTS, { replace: true })
        }
    }, [step, navigate])

    const current = PURCHASE_STEPS[step - 1]
    const StepComponent = current.Component

    const goToPrevStep = () => {
        if (step === 1) {
            navigate(EROUTES.MOTOR_QUOTATION_RESULTS)
            return
        }
        setStep((prev) => prev - 1)
    }

    const goToNextStep = () => {
        if (step < PURCHASE_STEPS.length) {
            setStep((prev) => prev + 1)
        }
    }

    const stepProps =
        current.Component === KycInfo || current.Component === SuccessPurchase
            ? { goToPrevStep, goToNextStep }
            : { goToPrevStep, goToNextStep, defaultCustomerContact }

    return (
        <div className="space-y-6 text-sm pb-[max(5vh,4.5rem)] mb-[5vh]">
            <div className="[&_h1]:text-lg [&_h1]:leading-7 [&_p]:text-sm [&_p]:leading-5">
                <PageHeader
                    title="Complete motor purchase"
                    description=""
                />
            </div>

            <StepComponent {...stepProps} />
        </div>
    )
}
