
import { CardFooter } from '@/components/ui/card'
import { Button } from '@/dev/core'
import { UseApiQuery } from '@/hooks/hooks'
import type {
    CustomerVerificationDetailsProps,
    SubmitResponse
} from '@/types/types'
import { INVOICE_SESSION_STORAGE_KEY } from '@/utils/constatnts'
import { useMotorDocumentDownload } from '@/utils/motor-document-download'
import { ShowToast } from '@/utils/utils'
import {
    ArrowLeftCircle,
    ArrowRightCircle,
    CircleCheckBig,
    FileText,
    Headphones,
    ReceiptText,
    Shield,
    TrendingUp
} from 'lucide-react'
import React from 'react'

type BoxHeaderProps = {
    title: string
    description?: string
}

const BoxHeader = ({ title, description }: BoxHeaderProps) => (
    <div className="flex flex-col gap-0.5 pb-3">
        <h2 className="text-base font-semibold sm:text-lg">{title}</h2>
        {description ? (
            <p className="text-xs text-muted-foreground sm:text-sm">
                {description}
            </p>
        ) : null}
    </div>
)

const primaryButtonClassName =
    'w-full rounded-full bg-[#C20C0C]/90 text-white hover:bg-[#C20C0C] sm:w-auto'

const secondaryButtonClassName =
    'w-full rounded-full border border-neutral-900 bg-neutral-900 text-white hover:bg-black sm:w-auto'

const readInvoiceSessionId = () => {
    if (typeof window === 'undefined') return null

    const storedPurchaseKey = sessionStorage.getItem(INVOICE_SESSION_STORAGE_KEY)
    return storedPurchaseKey || null
}

export const SuccessPurchase: React.FC<CustomerVerificationDetailsProps> = ({
    goToNextStep,
    goToPrevStep
}) => {
    const [purchaseSessionId] = React.useState(readInvoiceSessionId)

    const { data: SummaryData } = UseApiQuery<SubmitResponse>({
        url: `purchase/motor/${purchaseSessionId}/summary`,
        queryOptions: {
            enabled: !!purchaseSessionId,
            retry: 1,
        },
    })

    const firstItem = SummaryData?.data?.invoice_breakdown?.items?.[0]
    const invoiceId = firstItem?.id

    const receiptMutation = useMotorDocumentDownload(
        (id) => `document/motor/receipt/${id}`,
        'Receipt'
    )
    // Certificate lives under DMVIC, not document/motor/certificate.
    const certificateMutation = useMotorDocumentDownload(
        (id) => `dmvic/motor/certificates/${id}`,
        'Certificate'
    )

    const downloadDocument = (type: 'receipt' | 'certificate') => {
        if (!invoiceId) {
            ShowToast.error('No invoice found.')
            return
        }
        if (type === 'receipt') {
            receiptMutation.mutate(String(invoiceId))
        } else {
            certificateMutation.mutate(String(invoiceId))
        }
    }

    return (
        <section className="w-full mx-auto bg-transparent">
            <div className="rounded-2xl border border-[#ADABAB]/50 bg-linear-to-b from-white to-neutral-50/90 p-4 shadow-sm sm:p-6">
                <div className="w-full pb-2">
                    <h1 className="text-xl font-bold leading-tight tracking-tight sm:text-2xl">
                        Payment <span className="text-[#C20C0C]">Success</span>
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                        Your motor cover payment is complete. Download your documents below or explore what you can do next.
                    </p>
                </div>

                <div className="mt-5 space-y-5">
                    <div className="rounded-2xl border border-[#ADABAB]/35 bg-white/95 p-6 text-center sm:p-8">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#C20C0C]/10">
                            <CircleCheckBig className="h-10 w-10 text-[#C20C0C]" strokeWidth={1.75} />
                        </div>
                        <h2 className="text-lg font-semibold sm:text-xl">
                            Payment Completed Successfully
                        </h2>
                        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                            Thank you for your purchase. Your policy documents are ready when you are.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-[#ADABAB]/35 bg-white/95 p-3 sm:p-5">
                        <BoxHeader
                            title="Your Documents"
                            description="Download your certificate and receipt for your records."
                        />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                            <div className="flex flex-col items-center rounded-xl border border-[#ADABAB]/40 bg-neutral-50/80 px-4 py-6 text-center">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#ADABAB]/50 bg-white">
                                    <Shield className="h-6 w-6 text-[#C20C0C]" />
                                </div>
                                <h3 className="text-base font-semibold">Certificate</h3>
                                <p className="mb-4 text-xs text-muted-foreground sm:text-sm">
                                    It takes about 5 minutes for AKI to issue the certificate
                                </p>
                                <Button
                                    className={primaryButtonClassName}
                                    onClick={() => downloadDocument('certificate')}
                                    loading={certificateMutation.isPending}
                                >
                                    Download Certificate
                                </Button>
                            </div>
                            <div className="flex flex-col items-center rounded-xl border border-[#ADABAB]/40 bg-neutral-50/80 px-4 py-6 text-center">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#ADABAB]/50 bg-white">
                                    <ReceiptText className="h-6 w-6 text-[#C20C0C]" />
                                </div>
                                <h3 className="text-base font-semibold">Receipt</h3>
                                <p className="mb-4 text-xs text-muted-foreground sm:text-sm">
                                    Ready to download
                                </p>
                                <Button
                                    className={primaryButtonClassName}
                                    onClick={() => downloadDocument('receipt')}
                                    loading={receiptMutation.isPending}
                                >
                                    Download Receipt
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#ADABAB]/35 bg-white/95 p-3 sm:p-5">
                        <BoxHeader
                            title="What's Next?"
                            description="Manage your policy, file a claim, or reach out to our support team."
                        />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
                            <div className="flex flex-col items-center rounded-xl border border-[#ADABAB]/40 bg-neutral-50/80 px-4 py-5 text-center">
                                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full border border-[#ADABAB]/50 bg-white">
                                    <TrendingUp className="h-5 w-5 text-neutral-800" />
                                </div>
                                <h3 className="text-sm font-semibold">Track Policy</h3>
                                <p className="mb-3 text-xs text-muted-foreground">
                                    View policy status
                                </p>
                                <Button className={`${secondaryButtonClassName} text-sm`}>
                                    View Status
                                </Button>
                            </div>
                            <div className="flex flex-col items-center rounded-xl border border-[#ADABAB]/40 bg-neutral-50/80 px-4 py-5 text-center">
                                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full border border-[#ADABAB]/50 bg-white">
                                    <Shield className="h-5 w-5 text-neutral-800" />
                                </div>
                                <h3 className="text-sm font-semibold">Claims</h3>
                                <p className="mb-3 text-xs text-muted-foreground">
                                    File a claim
                                </p>
                                <Button className={`${secondaryButtonClassName} text-sm`}>
                                    Start Claim
                                </Button>
                            </div>
                            <div className="flex flex-col items-center rounded-xl border border-[#ADABAB]/40 bg-neutral-50/80 px-4 py-5 text-center sm:col-span-2 lg:col-span-1">
                                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full border border-[#ADABAB]/50 bg-white">
                                    <Headphones className="h-5 w-5 text-neutral-800" />
                                </div>
                                <h3 className="text-sm font-semibold">Support</h3>
                                <p className="mb-3 text-xs text-muted-foreground">
                                    Get help
                                </p>
                                <Button className={`${secondaryButtonClassName} text-sm`}>
                                    Contact Us
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <CardFooter className="mt-4 w-full flex flex-col gap-3 px-0 sm:flex-row sm:justify-between">
                <Button
                    type="button"
                    className="w-full rounded-full border border-[#C20C0C] bg-transparent text-[#C20C0C] hover:bg-[#C20C0C]/10 sm:w-auto"
                    leftIcon={<ArrowLeftCircle />}
                    onClick={() => goToPrevStep?.()}
                >
                    Previous
                </Button>
                <Button
                    type="button"
                    disabled
                    className="hidden w-full rounded-full bg-neutral-900 text-white hover:bg-black sm:w-auto"
                    rightIcon={<ArrowRightCircle />}
                    onClick={() => goToNextStep?.()}
                >
                    Go to Dashboard
                </Button>
            </CardFooter>
        </section>
    )
}
