import { CardFooter } from '@/components/ui/card'
import { Button } from '@/dev/core'
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react'
import React from 'react'

export const KycInfo = () => {
  return (
    <form className="w-full mx-auto bg-transparent">
                <div className='items-center justify-center border p-4'>
                    <div className="w-full py-3">
                        <h1 className="text-2xl font-bold leading-none mb-4">Proceed to add your <span className='text-[#C20C0C]'>Vehicle Details</span></h1>
                        <h6 className='text-lg font-bold'>Select type of cover</h6>
                    </div>
                    {/* <ReusableTabs
                        tabs={EMOTORTABS}
                        form={form}
                        onTabChange={setCurrent_Tab}
                    /> */}
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
                        className="bg-[#C20C0C]/80 rounded-full hover:bg-[#C20C0C]"
                        rightIcon={<ArrowRightCircle />}
                        onClick={() => goToNextStep?.()}
                    // loading={submitMutation.isPending}
                    >
                        Next
                    </Button>
                </CardFooter>
            </form>
  )
}
