/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardFooter, } from '@/components/ui/card'
import { Button, CustomDialogComponent, ReusableCard, ReusableCheckboxGrid, ReusablePagination, ReuseableInput } from '@/dev/core'
import { useCustomDialogContextFactory, } from '@/hooks'
import type { CustomerVerificationDetailsProps } from '@/types/types'
import { EQUOTATIONSAMPLEDATA, QUOTATIONCHECKBOX } from '@/utils/enums'
import { ArrowLeftCircle, ArrowRightCircle, Plus } from 'lucide-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

export const QuotationsPage: React.FC<CustomerVerificationDetailsProps> = ({ goToNextStep, goToPrevStep }) => {
    const [page, setPage] = useState(1)
    const form = useForm();
    
    const { handleDialogContextSwitch, dialogContent, dialogOpen } =
		useCustomDialogContextFactory<{
			refetch?: () => Promise<any>;
			data?: any;
		}>();


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
                    type='button'
                    className="ml-auto mt-4 flex items-center font-bold bg-[#C20C0C]/80 hover:bg-[#C20C0C]"
                    onClick={() =>
                        handleDialogContextSwitch({
                            // Component: console.log('wewe') ,
                            // componentProps: ,
                        })
                    }>
                    Generate Comparison
                </Button>
            </form>
            <div className='w-full m-3'>
                <h1 className="text-2xl font-bold mb-4">
                    Quote Comparison
                </h1>
                <div className='grid grid-cols-4 gap-8'>
                    {EQUOTATIONSAMPLEDATA.map((item) => (
                        <ReusableCard
                            key={item.id}
                            header={item.header as any}
                            footerClassName="flex justify-between w-full"
                            footer={
                                <>
                                    {item.footer.map((btn, idx) => (
                                        <Button key={idx} type="button" className={btn.className}>
                                            {btn.label}
                                        </Button>
                                    ))}
                                </>
                            }
                            children={
                                <>
                                    {item.content.map((row, idx) => (
                                        <div key={idx}>
                                            <div className="flex justify-between">
                                                <span>{row.label}</span>
                                                <span>{row.value}</span>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            } />
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

            <CustomDialogComponent
				{...{ handleDialogContextSwitch, dialogOpen }}
				className='sm:max-w-[425px]'>
				{dialogContent?.Component && (
					<dialogContent.Component
						{...{
							componentProps: dialogContent.componentProps,
							handleDialogContextSwitch,
						}}
					/>
				)}
			</CustomDialogComponent>
        </div>
    )
}
