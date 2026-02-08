
import { Card, CardFooter } from '@/components/ui/card'
import { Button } from '@/dev/core'
import type { CustomerVerificationDetailsProps } from '@/types/types'
import { ArrowLeftCircle, ArrowRightCircle, CircleCheckBig, FileText, ReceiptText, TrendingUp } from 'lucide-react'
import React from 'react'

export const SuccessPurchase: React.FC<CustomerVerificationDetailsProps> = ({ goToNextStep, goToPrevStep }) => {
    return (
        <>
            <div className='w-full justify-center items-center p-4'>
                <Card className='items-center justify-center bg-[#0CC2581F] text-[#22C55E] border-0 shadow-0'>
                    <CircleCheckBig className='h-16 w-16' />
                    <h1 className='text-2xl font-bold'>Payment Competed Successfully </h1>
                </Card>
                <div className='grid grid-cols-2 gap-6 m-4'>
                    <Card className='items-center justify-center border-primary/20 shadow-0'>
                        <FileText className='h-8 w-8' />
                        <h1 className='text-lg font-bold'>Certificate </h1>
                        <span>Ready to dowload</span>
                        <Button className='bg-[#43A047]/80 hover:bg-[#43A047]/80 rounded-full'>
                            Download Certificate
                        </Button>
                    </Card>
                    <Card className='items-center justify-center border-primary/20 shadow-0'>
                        <ReceiptText className='h-8 w-8' />
                        <h1 className='text-lg font-bold'>Receipt </h1>
                        <span>Ready to dowload</span>
                        <Button className='bg-[#43A047]/80 hover:bg-[#43A047]/80 rounded-full'>
                            Download Receipt
                        </Button>
                    </Card>
                </div>

                <Card className='items-center justify-center border-0 border-[#C20C0C] bg-[#C20C0C1A]'>
                    <div className='w-full grid grid-cols-3 gap-4 p-3'>
                        <Card className='items-center justify-center border-primary/20 shadow-0'>
                            <TrendingUp className='h-8 w-8' />
                            <h1 className='text-sm font-bold'>Certificate </h1>
                            <span>Ready to dowload</span>
                            <Button className='bg-[#43A047]/80 hover:bg-[#43A047]/80 rounded-full'>
                                Download Receipt
                            </Button>
                        </Card>
                        <Card className='items-center justify-center border-primary/20 shadow-0'>
                            <TrendingUp className='h-8 w-8' />
                            <h1 className='text-sm font-bold'>Certificate </h1>
                            <span>Ready to dowload</span>
                            <Button className='bg-[#43A047]/80 hover:bg-[#43A047]/80 rounded-full'>
                                Download Receipt
                            </Button>
                        </Card>
                        <Card className='items-center justify-center border-primary/20 shadow-0'>
                            <TrendingUp className='h-8 w-8' />
                            <h1 className='text-sm font-bold'>Certificate </h1>
                            <span>Ready to dowload</span>
                            <Button className='bg-[#43A047]/80 hover:bg-[#43A047]/80 rounded-full'>
                                Download Receipt
                            </Button>
                        </Card>
                    </div>

                </Card>

            </div>
            <CardFooter className="w-full md:col-span-2 flex justify-between mt-3 px-0">
                <Button
                    type="button"
                    className="rounded-full border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
                    leftIcon={<ArrowLeftCircle />}
                    onClick={() => goToPrevStep?.()}>
                    Previous
                </Button>
                <Button
                    type="button"
                    disabled
                    className="bg-[#C20C0C]/80 rounded-full hover:bg-[#C20C0C]"
                    rightIcon={<ArrowRightCircle />}
                    onClick={() => goToNextStep?.()}>
                    Proceed To Payment
                </Button>
            </CardFooter>
        </>
    )
}
