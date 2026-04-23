
import {
    Card,
    CardFooter
} from '@/components/ui/card'
import {
    Button
} from '@/dev/core'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import type {
    CustomerVerificationDetailsProps,
    SubmitResponse
} from '@/types/types'
import { EMETHODS, INVOICE_SESSION_STORAGE_KEY } from '@/utils/constatnts'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import {
    ArrowLeftCircle,
    ArrowRightCircle,
    CircleCheckBig,
    FileText,
    ReceiptText,
    TrendingUp
} from 'lucide-react'
import React from 'react'

export const SuccessPurchase: React.FC<CustomerVerificationDetailsProps> = ({
    goToNextStep,
    goToPrevStep
}) => {
    const [purchaseSessionId, setPurchaseSessionId] = React.useState<string | null>(null)

    React.useEffect(() => {
        const storedPurchaseKey = String(sessionStorage.getItem(INVOICE_SESSION_STORAGE_KEY))
        if (storedPurchaseKey) {
            setPurchaseSessionId(storedPurchaseKey)
        } else {
            setPurchaseSessionId(null)
        }
    }, [])
    const { data: SummaryData } = UseApiQuery<SubmitResponse>({
        url: `purchase/motor/${purchaseSessionId}/summary`,
        queryOptions: {
            enabled: !!purchaseSessionId,
            retry: 1,
        },
    })

    const firstItem = SummaryData?.data?.invoice_breakdown?.items?.[0]
    const invoiceId = firstItem?.id

    const downloadDocument = (type: 'receipt' | 'certificate') => {
        if (!invoiceId) {
            ShowToast.error("No invoice found.")
            return
        }
        if (type === 'receipt') {
            receiptMutation.mutate(String(invoiceId))
        } else {
            certificateMutation.mutate(String(invoiceId))
        }
    }

    const createDownloadMutation = (docType: string) =>
        UseApiMutation<Blob, string>({
            url: (id) => `document/motor/${docType}/${id}`,
            method: EMETHODS.GET,
            config: {
                responseType: 'blob',
            },
            mutationOptions: {
                onSuccess: (data) => {
                    const blob = new Blob([data], { type: 'application/pdf' })
                    const url = window.URL.createObjectURL(blob)
                    const link = document.createElement('a')
                    link.href = url
                    link.download = `${docType}-${invoiceId}.pdf`
                    document.body.appendChild(link)
                    link.click()
                    link.remove()
                    window.URL.revokeObjectURL(url)
                    ShowToast.success(`${docType.charAt(0).toUpperCase() + docType.slice(1)} downloaded`)
                },
                onError: (error: unknown) => {
                    const message = extractErrorMessage(error)
                    ShowToast.error(message || "Download failed!")
                },
            },
        })

    const receiptMutation = createDownloadMutation('receipt')
    const certificateMutation = createDownloadMutation('certificate')
    return (
        <section className='w-full flex flex-col items-center justify-center p-4'>
            <div className='w-full max-w-4xl mx-auto space-y-6'>
                <Card className='flex flex-col items-center justify-center py-8 px-4 bg-[#0CC2581F] text-[#22C55E] border-0 shadow-none'>
                    <CircleCheckBig className='h-16 w-16 mb-3' />
                    <h1 className='text-xl sm:text-2xl font-bold text-center'>Payment Completed Successfully</h1>
                </Card>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
                    <Card className='flex flex-col items-center justify-center py-6 px-4 border-primary/20 shadow-none'>
                        <FileText className='h-8 w-8 mb-2 text-primary' />
                        <h2 className='text-lg font-bold'>Certificate</h2>
                        <span className='text-sm text-muted-foreground mb-3'>Ready to download</span>
                        <Button
                            className='bg-[#43A047]/80 hover:bg-[#43A047] rounded-full text-white'
                            onClick={() => downloadDocument('certificate')}
                            loading={certificateMutation.isPending}
                        >
                            Download Certificate
                        </Button>
                    </Card>
                    <Card className='flex flex-col items-center justify-center py-6 px-4 border-primary/20 shadow-none'>
                        <ReceiptText className='h-8 w-8 mb-2 text-primary' />
                        <h2 className='text-lg font-bold'>Receipt</h2>
                        <span className='text-sm text-muted-foreground mb-3'>Ready to download</span>
                        <Button
                            className='bg-[#43A047]/80 hover:bg-[#43A047] rounded-full text-white'
                            onClick={() => downloadDocument('receipt')}
                            loading={receiptMutation.isPending}
                        >
                            Download Receipt
                        </Button>
                    </Card>
                </div>
                <Card className='flex flex-col items-center justify-center border-0 bg-[#C20C0C1A] p-4 sm:p-6 lg:p-8'>
                    <div className='w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                        <Card className='flex flex-col items-center justify-center py-5 px-4 border-primary/20 shadow-none'>
                            <TrendingUp className='h-8 w-8 mb-2' />
                            <h3 className='text-sm font-bold'>Track Policy</h3>
                            <span className='text-xs text-muted-foreground mb-3 text-center'>View policy status</span>
                            <Button className='bg-[#43A047]/80 hover:bg-[#43A047] rounded-full text-white text-sm'>
                                View Status
                            </Button>
                        </Card>
                        <Card className='flex flex-col items-center justify-center py-5 px-4 border-primary/20 shadow-none'>
                            <TrendingUp className='h-8 w-8 mb-2' />
                            <h3 className='text-sm font-bold'>Claims</h3>
                            <span className='text-xs text-muted-foreground mb-3 text-center'>File a claim</span>
                            <Button className='bg-[#43A047]/80 hover:bg-[#43A047] rounded-full text-white text-sm'>
                                Start Claim
                            </Button>
                        </Card>
                        <Card className='flex flex-col items-center justify-center py-5 px-4 border-primary/20 shadow-none sm:col-span-2 lg:col-span-1'>
                            <TrendingUp className='h-8 w-8 mb-2' />
                            <h3 className='text-sm font-bold'>Support</h3>
                            <span className='text-xs text-muted-foreground mb-3 text-center'>Get help</span>
                            <Button className='bg-[#43A047]/80 hover:bg-[#43A047] rounded-full text-white text-sm'>
                                Contact Us
                            </Button>
                        </Card>
                    </div>
                </Card>
            </div>
            <CardFooter className="w-full flex flex-col sm:flex-row justify-between gap-3 mt-4 px-0">
                <Button
                    type="button"
                    className="w-full sm:w-auto rounded-full border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
                    leftIcon={<ArrowLeftCircle />}
                    onClick={() => goToPrevStep?.()}>
                    Previous
                </Button>
                <Button
                    type="button"
                    disabled
                    className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-full hover:bg-[#C20C0C] text-white hidden"
                    rightIcon={<ArrowRightCircle />}
                    onClick={() => goToNextStep?.()}>
                    Go to Dashboard
                </Button>
            </CardFooter>
        </section>
    )
}
