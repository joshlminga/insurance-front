import { FieldGroup } from '@/components/ui/field'
import { ReuseableInput } from '@/dev/core'
import { UseApiQuery } from '@/hooks/hooks'
import type { BankPaymentDetailsResponse, CashPaymentOption } from '@/types/types'
import type { PaymentFormInput } from '@/types/schema'
import {
    ACCEPTED_FILE_TYPES,
    BANK_PAYMENT_DETAILS_API_ENABLED,
    BANK_PAYMENT_DETAILS_URL,
    INVOICE_SESSION_STORAGE_KEY,
} from '@/utils/constatnts'
import React from 'react'
import { useFormContext } from 'react-hook-form'
import { PaymentAmountSummary } from './payment-amount-summary'

const PLACEHOLDER = '—'

const buildPaymentOptions = (details?: BankPaymentDetailsResponse): CashPaymentOption[] => {
    if (details?.payment_options?.length) {
        return details.payment_options
    }

    const bank = details?.bank_payment_details
    const options: CashPaymentOption[] = [
        {
            title: 'Bank Payment Details',
            steps: [
                `Bank: ${bank?.bank_name || PLACEHOLDER}`,
                `Account name: ${bank?.account_name || PLACEHOLDER}`,
                `Account number: ${bank?.account_number || PLACEHOLDER}`,
                `Branch: ${bank?.branch || PLACEHOLDER}`,
            ],
        },
        {
            title: 'Pay via Cheque',
            steps: [details?.cheque || PLACEHOLDER],
        },
        {
            title: 'Swift Code & EFT',
            steps: [
                `Swift code: ${details?.swift_code || PLACEHOLDER}`,
                `EFT: ${details?.eft || PLACEHOLDER}`,
            ],
        },
        {
            title: 'Office Location',
            steps: [details?.office_location || PLACEHOLDER],
        },
    ]

    return options
}

const PaymentOptionSection = ({
    index,
    title,
    steps,
}: {
    index: number
    title: string
    steps: string[]
}) => (
    <div className="w-full rounded-lg border border-dashed border-black/30 bg-white p-4">
        <span className="font-bold text-black/80 text-sm sm:text-base block mb-4 underline decoration-[#BF162E] underline-offset-4">
            Option {index + 1}: {title}
        </span>
        <ol className="list-decimal list-inside space-y-3 font-poppins text-xs sm:text-sm text-black/80">
            {steps.map((step, stepIndex) => (
                <li key={stepIndex} className="pl-2">
                    {step}
                </li>
            ))}
        </ol>
    </div>
)

export const CashTabPage: React.FC = () => {
    const { control } = useFormContext<PaymentFormInput>()

    const [purchaseSessionId, setPurchaseSessionId] = React.useState<string | null>(null)

    React.useEffect(() => {
        const stored = sessionStorage.getItem(INVOICE_SESSION_STORAGE_KEY)
        setPurchaseSessionId(stored ? String(stored) : null)
    }, [])

    const bankDetailsQuery = UseApiQuery<BankPaymentDetailsResponse>({
        url: BANK_PAYMENT_DETAILS_URL,
        params: purchaseSessionId ? { purchase_session_id: purchaseSessionId } : undefined,
        queryOptions: {
            enabled: BANK_PAYMENT_DETAILS_API_ENABLED && !!purchaseSessionId,
            retry: 1,
        },
    })

    const details = bankDetailsQuery.data?.data ?? bankDetailsQuery.data
    const showApiUnavailable = BANK_PAYMENT_DETAILS_API_ENABLED && (bankDetailsQuery.isError || (!bankDetailsQuery.isLoading && !details))
    const paymentOptions = buildPaymentOptions(BANK_PAYMENT_DETAILS_API_ENABLED ? details : undefined)

    return (
        <div className="w-full">
            <div className="mx-auto">
                <FieldGroup>
                    <PaymentAmountSummary label="Amount:" />

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {BANK_PAYMENT_DETAILS_API_ENABLED && bankDetailsQuery.isLoading ? (
                            <p className="text-sm text-black/70">Loading payment details…</p>
                        ) : showApiUnavailable ? (
                            <p className="text-sm text-black/70">Payment details unavailable.</p>
                        ) : (
                            paymentOptions.map((option, index) => (
                                <PaymentOptionSection
                                    key={`${option.title}-${index}`}
                                    index={index}
                                    title={option.title}
                                    steps={option.steps}
                                />
                            ))
                        )}
                    </div>

                    <div className="mt-4 w-full rounded-lg border border-black/20 bg-white shadow-sm p-3">
                        <ReuseableInput
                            className="w-full rounded-sm border border-black/30 bg-white text-black"
                            control={control}
                            name="payment_proof_receipt"
                            label="Upload Receipt / Proof of Payment"
                            type="file"
                            accept={ACCEPTED_FILE_TYPES.join(',')}
                            required
                        />
                    </div>
                </FieldGroup>
            </div>
        </div>
    )
}
