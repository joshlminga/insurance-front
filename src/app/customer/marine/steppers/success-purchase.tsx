
import { Card, CardFooter } from '@/components/ui/card'
import { Button } from '@/dev/core'
import type { CustomerVerificationDetailsProps } from '@/types/types'
import { ArrowLeftCircle, ArrowRightCircle, CircleCheckBig, FileText, ReceiptText, TrendingUp } from 'lucide-react'
import React from 'react'

export const SuccessPurchase: React.FC<CustomerVerificationDetailsProps> = ({ goToNextStep, goToPrevStep }) => {
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
                        <Button className='bg-[#43A047]/80 hover:bg-[#43A047] rounded-full text-white'>
                            Download Certificate
                        </Button>
                    </Card>
                    <Card className='flex flex-col items-center justify-center py-6 px-4 border-primary/20 shadow-none'>
                        <ReceiptText className='h-8 w-8 mb-2 text-primary' />
                        <h2 className='text-lg font-bold'>Receipt</h2>
                        <span className='text-sm text-muted-foreground mb-3'>Ready to download</span>
                        <Button className='bg-[#43A047]/80 hover:bg-[#43A047] rounded-full text-white'>
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
