import { goToReceipt } from '@/app/payment/payment-session'
import { UseAuth } from '@/stores/auth-store'
import React from 'react'
import { useNavigate } from 'react-router-dom'

const RECEIPT_DELAY_SECONDS = 10

/**
 * After a successful payment, wait 10 seconds then go to the receipt step.
 * The button on the page can call continueToReceipt() immediately (this clears the wait).
 */
export function useReceiptContinue() {
    const navigate = useNavigate()
    const { isAuthenticated } = UseAuth()
    const [secondsLeft, setSecondsLeft] = React.useState(RECEIPT_DELAY_SECONDS)

    const hasRedirectedRef = React.useRef(false)

    const continueToReceipt = React.useCallback(() => {
        if (hasRedirectedRef.current) return
        hasRedirectedRef.current = true
        goToReceipt(navigate, isAuthenticated)
    }, [navigate, isAuthenticated])

    React.useEffect(() => {
        if (secondsLeft > 0) {
            const timer = window.setTimeout(() => {
                setSecondsLeft((current) => current - 1)
            }, 1000)
            return () => window.clearTimeout(timer)
        }

        if (hasRedirectedRef.current) return
        continueToReceipt()
    }, [secondsLeft, continueToReceipt])

    return { secondsLeft, continueToReceipt }
}
