import { PageHeader } from '@/components/shared'
import { QuotationsPage } from '@/app/customer/motor/steppers/quotations'
import { EROUTES } from '@/utils/enums'
import { useNavigate } from 'react-router-dom'

export const AdminMotorQuotationResultsPage = () => {
    const navigate = useNavigate()

    return (
        <div className="space-y-6 text-sm pb-[max(5vh,4.5rem)] mb-[5vh]">
            <div className="[&_h1]:text-lg [&_h1]:leading-7 [&_p]:text-sm [&_p]:leading-5">
                <PageHeader
                    title="Quote results"
                    description="Compare motor insurance premiums for this quotation."
                />
            </div>

            <QuotationsPage
                goToPrevStep={() => navigate(EROUTES.MOTORQUOTATIONS)}
                goToNextStep={() => navigate(EROUTES.MOTORQUOTATIONS)}
                missingSessionBackLabel="Motor Quotations"
            />
        </div>
    )
}
