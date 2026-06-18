import { PageHeader } from '@/components/shared'
import { AdminMotorQuotationsPage } from '../steppers/quotations'
import { EROUTES } from '@/utils/enums'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { readAdminMotorCustomerContact } from '../admin-motor-session'

export const AdminMotorQuotationResultsPage = () => {
    const navigate = useNavigate()
    const defaultCustomerContact = useMemo(() => readAdminMotorCustomerContact(), [])

    return (
        <div className="space-y-6 text-sm pb-[max(5vh,4.5rem)] mb-[5vh]">
            <div className="[&_h1]:text-lg [&_h1]:leading-7 [&_p]:text-sm [&_p]:leading-5">
                <PageHeader
                    title="Quote results"
                    description="Compare motor insurance premiums for this quotation."
                />
            </div>
            <AdminMotorQuotationsPage
                goToPrevStep={() => navigate(EROUTES.MOTORQUOTATIONS)}
                goToNextStep={() => navigate(EROUTES.MOTOR_QUOTATION_PURCHASE)}
                missingSessionBackLabel="Motor Quotations"
                defaultCustomerContact={defaultCustomerContact}
            />
        </div>
    )
}
