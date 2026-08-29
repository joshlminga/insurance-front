import {
    getPaymentReturnPath,
    readPaymentStatusSession,
    type PaymentMethodKey,
} from '@/app/payment/payment-session'
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

/**
 * If this payment was started from admin and the gateway landed on the public
 * /payment/* return URL, bounce into /dashboard/payment/* so checking UI stays
 * inside the admin Layout.
 */
export function usePreferAdminPaymentReturn(method: PaymentMethodKey): boolean {
    const navigate = useNavigate()
    const location = useLocation()
    const [ready, setReady] = React.useState(() => {
        const isAdminFlow = readPaymentStatusSession()?.flow === 'admin'
        const alreadyOnAdmin = location.pathname.startsWith('/dashboard/payment')
        return !(isAdminFlow && !alreadyOnAdmin)
    })

    React.useEffect(() => {
        const isAdminFlow = readPaymentStatusSession()?.flow === 'admin'
        const alreadyOnAdmin = location.pathname.startsWith('/dashboard/payment')
        if (!isAdminFlow || alreadyOnAdmin) {
            setReady(true)
            return
        }
        navigate(`${getPaymentReturnPath(method)}${location.search}`, { replace: true })
    }, [location.pathname, location.search, method, navigate])

    return ready
}
