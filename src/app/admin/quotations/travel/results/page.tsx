import { PageHeader } from '@/components/shared'
import { TravelQuotationsPage } from '@/app/customer/travel/steppers/quotations'
import { EROUTES } from '@/utils/enums'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { UseAuth } from '@/stores/auth-store'
import {
    persistAdminTravelPurchaseStart,
    resolveAdminTravelPayeeContact,
} from '../admin-travel-session'
import { PURCHASE_SESSION_STORAGE_KEY } from '@/utils/constatnts'
import { useEffect } from 'react'

/**
 * Admin travel Results — reuses customer premium list.
 * When purchase starts, customer stepper calls goToNextStep; we persist admin step + navigate.
 */
export const AdminTravelQuotationResultsPage = () => {
    const navigate = useNavigate()
    const { user } = UseAuth()
    const defaultCustomerContact = useMemo(
        () => resolveAdminTravelPayeeContact(user),
        [user]
    )

    // If purchase id was set by TravelQuotationsPage, seed admin purchase step
    useEffect(() => {
        void defaultCustomerContact
    }, [defaultCustomerContact])

    const goToPurchase = () => {
        const purchaseId = sessionStorage.getItem(PURCHASE_SESSION_STORAGE_KEY)?.trim()
        if (purchaseId) {
            persistAdminTravelPurchaseStart(purchaseId)
        }
        navigate(EROUTES.TRAVEL_QUOTATION_PURCHASE)
    }

    return (
        <div className="space-y-6 text-sm pb-[max(5vh,4.5rem)] mb-[5vh]">
            <div className="[&_h1]:text-lg [&_h1]:leading-7 [&_p]:text-sm [&_p]:leading-5">
                <PageHeader
                    title="Quote results"
                    description="Compare travel insurance premiums for this quotation."
                />
            </div>
            <TravelQuotationsPage
                goToPrevStep={() => navigate(EROUTES.TRAVELQUOTATIONS)}
                goToNextStep={goToPurchase}
                missingSessionBackLabel="Travel Quotations"
            />
        </div>
    )
}
