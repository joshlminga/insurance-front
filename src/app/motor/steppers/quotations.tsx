import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button, ReusableCheckboxGrid, ReusablePagination, ReuseableInput } from '@/dev/core'
import type { CustomerVerificationDetailsProps } from '@/types/types'
import { QUOTATIONCHECKBOX } from '@/utils/enums'
import { ArrowLeftCircle, ArrowRightCircle, Plus } from 'lucide-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

export const QuotationsPage: React.FC<CustomerVerificationDetailsProps> = ({ goToNextStep, goToPrevStep }) => {
    const [page, setPage] = useState(1)
    const form = useForm();
    return (
        <div className="max-w-full mx-auto border-0 bg-transparent">
            <form className='w-full py-4'>
                <div className="w-full border rounded-0 px-6 py-6">
                    <h1 className="text-2xl font-bold mb-4">
                        Additional Benefits:
                    </h1>
                    <hr className="mb-6" />
                    <ReusableCheckboxGrid
                        options={QUOTATIONCHECKBOX}
                        columns={3}
                    />
                    <hr className="mb-6" />
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
                    <Button
                        type='button'
                        className="ml-auto mt-4 flex items-center rounded-[3px] border border-[#0CC2581F] bg-[#C7EED5] hover:bg-[#C7EED5]/90 text-[#43A047]"
                        leftIcon={<Plus className='h-8 w-8' />}>
                        Add
                    </Button>
                </div>
                <Button
                    type='submit'
                    className="ml-auto mt-4 flex items-center font-bold bg-[#C20C0C]/80 hover:bg-[#C20C0C]">
                    Generate Comparison
                </Button>
            </form>
            <div className='w-full m-3'>
                <h1 className="text-2xl font-bold mb-4">
                    Quote Comparison
                </h1>

                <div className='grid grid-cols-4 gap-6'>
                    {Array.from({ length: 20 }).map((_, index) => (
                        <Card
                            key={index}
                            className="max-h-fit rounded-[10px] border border-[#ADABAB] bg-white shadow-[0px_4px_4px_0px_#00000040] flex flex-col">
                            <CardHeader className="flex items-center justify-center p-3">
                                <img
                                    src="/britam.png"
                                    alt="Britam"
                                    className="w-[109px] h-[41px] object-contain"
                                />
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2 px-4 py-2">
                                <div className="flex justify-between">
                                    <span className="text-[10px] font-medium leading-2.5 text-black">
                                        Basic Premium
                                    </span>
                                    <span className="text-[10px] font-medium leading-2.5 text-black">
                                        Kes. 1,200,000
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-[10px] font-medium leading-2.5 text-black">
                                        Total Premium
                                    </span>
                                    <span className="text-[10px] font-medium leading-2.5 text-black">
                                        Kes. 1,205,440
                                    </span>
                                </div>
                            </CardContent>
                            <CardFooter className="mt-auto flex justify-between px-4 pb-3">
                                <Button
                                    type="button"
                                    className="h-[17px] rounded-[3px] border border-[#D9D9D9] bg-[#C20C0C] hover:bg-[#C20C0C]/90 text-[8px] font-medium leading-2 text-white px-1">
                                    Get Quote
                                </Button>
                                <Button
                                    type="button"
                                    className="h-[17px] rounded-[3px] border border-[#D9D9D9] bg-[#C20C0C] hover:bg-[#C20C0C]/90 text-[8px] font-medium leading-2 text-white px-1">
                                    Purchase Cover
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>


            <CardFooter className="md:col-span-2 flex justify-between mt-1">
                <Button
                    type="button"
                    className="rounded-full border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
                    leftIcon={<ArrowLeftCircle />}
                    onClick={() => goToPrevStep?.()}>
                    Previous
                </Button>
                <ReusablePagination
                    currentPage={page}
                    totalPages={10}
                    onPageChange={setPage}
                />
                <Button
                    type="button"
                    className="bg-[#C20C0C]/80 rounded-full hover:bg-[#C20C0C]"
                    rightIcon={<ArrowRightCircle />}
                    // loading={submitMutation.isPending}
                    onClick={() => (goToNextStep?.())}>
                    Next
                </Button>
            </CardFooter>
        </div>
    )
}
