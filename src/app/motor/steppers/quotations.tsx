import { CardFooter } from '@/components/ui/card'
import { Button, ReuseableInput } from '@/dev/core'
import type { CustomerVerificationDetailsProps } from '@/types/types'
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'

export const QuotationsPage: React.FC<CustomerVerificationDetailsProps> = ({ goToNextStep, goToPrevStep }) => {
    const form = useForm();
    return (
        <div className="max-w-full mx-auto border-0 bg-transparent">

            <div className="w-full border rounded-2xl px-6 py-6">
                <h1 className="text-2xl font-bold mb-4">
                    Additional Benefits:
                </h1>
                <hr className="mb-6" />
                 <div className="grid grid-cols-2 gap-8">
                    
                 </div>
                <form>
                    <div className="grid grid-cols-2 gap-8">
                        <ReuseableInput
                            className="h-[51px] rounded-[5px] border border-[#ADABAB] justify-self-start"
                            control={form.control}
                            name="courtesy_car"
                            label="Courtesy Car"
                        />
                        <ReuseableInput
                            className="h-[51px] rounded-[5px] border border-[#ADABAB] justify-self-end"
                            control={form.control}
                            name="road_rescue"
                            label="Road Rescue"
                        />
                    </div>
                </form>

            </div>



            <CardFooter className="md:col-span-2 flex justify-between mt-1">
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
                    // loading={submitMutation.isPending}
                    onClick={() => (goToNextStep?.())}
                >
                    Next
                </Button>
            </CardFooter>
        </div>
    )
}
