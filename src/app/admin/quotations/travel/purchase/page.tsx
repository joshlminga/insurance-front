import { PageHeader } from '@/components/shared'
import { TravelKycDetailsPage } from '@/app/customer/travel/steppers/kyc-details'
import { TravelPaymentGatePage } from '@/app/customer/travel/steppers/travel-payment-gate'
import { TravelSuccessPurchase } from '@/app/customer/travel/steppers/success-purchase'
import { TravelInvoiceGatePage } from '@/app/customer/travel/steppers/travel-invoice-gate'
import { AdminTravelInvoicePayment } from '@/app/admin/quotations/travel/steppers/invoice-payment'
import { TRAVEL_CANNON_CHECKOUT_KEY } from '@/utils/constatnts'
import {
    ADMIN_TRAVEL_PURCHASE_STEP_KEY,
} from '@/app/payment/payment-session'
import {
    INVOICE_SESSION_STORAGE_KEY,
    PURCHASE_SESSION_STORAGE_KEY,
} from '@/utils/constatnts'
import { EROUTES } from '@/utils/enums'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UseAuth } from '@/stores/auth-store'
import { resolveAdminTravelPayeeContact } from '../admin-travel-session'

/** Admin travel purchase: KYC → Invoice → Payment → Success (same order as customer, no register/OTP). */
const AdminTravelInvoiceGate = (props: React.ComponentProps<typeof AdminTravelInvoicePayment>) => {
    const isCannon =
        typeof window !== 'undefined' &&
        sessionStorage.getItem(TRAVEL_CANNON_CHECKOUT_KEY) === '1'

    if (isCannon) {
        return <TravelInvoiceGatePage {...props} />
    }

    return <AdminTravelInvoicePayment {...props} />
}

const TRAVEL_PURCHASE_STEPS = [
    { title: 'KYC', Component: TravelKycDetailsPage },
    { title: 'Invoice', Component: AdminTravelInvoiceGate },
    { title: 'Payment', Component: TravelPaymentGatePage },
    { title: 'Success', Component: TravelSuccessPurchase },
] as const

const readSessionValue = (key: string) => {
    if (typeof window === 'undefined') return null
    const value = sessionStorage.getItem(key)?.trim()
    return value || null
}

const hasSessionValue = (key: string) => Boolean(readSessionValue(key))

const readStoredPurchaseStep = () => {
    const stored = readSessionValue(ADMIN_TRAVEL_PURCHASE_STEP_KEY)
    const parsed = stored ? Number(stored) : 1
    if (Number.isInteger(parsed) && parsed >= 1 && parsed <= TRAVEL_PURCHASE_STEPS.length) {
        return parsed
    }
    return 1
}

export const AdminTravelQuotationPurchasePage = () => {
    const navigate = useNavigate()
    const { user } = UseAuth()
    const [step, setStep] = useState(readStoredPurchaseStep)
    const defaultCustomerContact = resolveAdminTravelPayeeContact(user)

    useEffect(() => {
        sessionStorage.setItem(ADMIN_TRAVEL_PURCHASE_STEP_KEY, String(step))
    }, [step])

    useEffect(() => {
        if (step === 1 && !hasSessionValue(PURCHASE_SESSION_STORAGE_KEY)) {
            navigate(EROUTES.TRAVEL_QUOTATION_RESULTS, { replace: true })
            return
        }
        // Cannon skips Acensure invoice but KYC still stamps INVOICE_SESSION_STORAGE_KEY.
        if (
            step >= 2 &&
            !hasSessionValue(INVOICE_SESSION_STORAGE_KEY) &&
            sessionStorage.getItem(TRAVEL_CANNON_CHECKOUT_KEY) !== '1'
        ) {
            navigate(EROUTES.TRAVEL_QUOTATION_RESULTS, { replace: true })
        }
    }, [step, navigate])

    const current = TRAVEL_PURCHASE_STEPS[step - 1]
    const StepComponent = current.Component

    const goToPrevStep = () => {
        if (step === 1) {
            navigate(EROUTES.TRAVEL_QUOTATION_RESULTS)
            return
        }
        setStep((prev) => prev - 1)
    }

    const goToNextStep = () => {
        if (step < TRAVEL_PURCHASE_STEPS.length) {
            setStep((prev) => prev + 1)
        }
    }

    // Payment "Change details" should jump to KYC, not Invoice
    const goToKyc = () => setStep(1)

    const baseProps =
        current.Component === TravelKycDetailsPage ||
        current.Component === TravelSuccessPurchase
            ? { goToPrevStep, goToNextStep }
            : { goToPrevStep, goToNextStep, defaultCustomerContact }

    // Payment step uses TravelPaymentGatePage (Cannon M-Pesa or normal options).
    const stepProps =
        current.Component === TravelPaymentGatePage
            ? {
                  ...baseProps,
                  goToKyc,
                  paymentStatusFlow: 'admin' as const,
                  // Admins may pay by Credit; customer travel payment hides it
                  includeCreditPayment: true,
              }
            : baseProps

    return (
        <div className="space-y-6 text-sm pb-[max(5vh,4.5rem)] mb-[5vh]">
            <div className="[&_h1]:text-lg [&_h1]:leading-7 [&_p]:text-sm [&_p]:leading-5">
                <PageHeader
                    title="Complete travel purchase"
                    description=""
                />
            </div>
            <StepComponent {...stepProps} />
        </div>
    )
}
