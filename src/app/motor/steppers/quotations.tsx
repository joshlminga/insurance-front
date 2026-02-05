/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardFooter, } from '@/components/ui/card'
import { Button, CustomDialogComponent, ReusableCard, ReusableCheckboxGrid, ReusablePagination, ReuseableInput } from '@/dev/core'
import { useCustomDialogContextFactory, } from '@/hooks'
import type { CustomerVerificationDetailsProps } from '@/types/types'
import { EQUOTATIONSAMPLEDATA, QUOTATIONCHECKBOX } from '@/utils/enums'
import { ArrowLeftCircle, ArrowRightCircle, Plus } from 'lucide-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ComparisonPage } from './comparisons/page'
import { QoutePreviewPage } from './qoute-preview/page'

export const QuotationsPage: React.FC<CustomerVerificationDetailsProps> = ({ goToNextStep, goToPrevStep }) => {
    const [page, setPage] = useState(1)
    const form = useForm();

    const { handleDialogContextSwitch, dialogContent, dialogOpen } =
        useCustomDialogContextFactory<{
            refetch?: () => Promise<any>;
            data?: any;
        }>();


    return (
        <>
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
                                Component: ComparisonPage,
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
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                        {EQUOTATIONSAMPLEDATA.map((item) => (
                            <ReusableCard
                                key={item.id}
                                header={item.header as any}
                                rootClassName=""
                                footerClassName="flex flex-col gap-2 sm:flex-row sm:justify-between w-full"
                                footer={
                                    <>
                                        <Button
                                            type="button"
                                            onClick={() =>
                                                handleDialogContextSwitch({
                                                    componentProps: { item },
                                                    Component: QoutePreviewPage,
                                                })
                                            }
                                            className='rounded-md border border-[#D9D9D9] bg-[#C20C0C] hover:bg-[#C20C0C]/90 font-medium text-white px-6'>
                                            Get Quote
                                        </Button>
                                        <Button
                                            type="button"
                                            className='rounded-md border border-[#D9D9D9] bg-[#0CC258] hover:bg-[#0CC258]/90 font-medium text-white px-6'>
                                            Purchase Cover
                                        </Button>
                                    </>
                                }
                                children={
                                    <>
                                        {item.content.map((row, idx) => (
                                            <div key={idx}>
                                                <div  className="flex flex-wrap justify-between gap-1 min-w-0">
                                                    <span className="text-xs sm:text-sm wrap-break-word max-w-[65%]">{row.label}</span>
                                                    <span className="text-xs sm:text-sm wrap-break-word max-w-[65%]">{row.value}</span>
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
            </div>
            <CustomDialogComponent
                {...{ handleDialogContextSwitch, dialogOpen }}
                className='sm:max-w-fit w-auto p-6'>
                {dialogContent?.Component && (
                    <dialogContent.Component
                        {...{
                            componentProps: dialogContent.componentProps,
                            handleDialogContextSwitch,
                        }}
                    />
                )}
            </CustomDialogComponent>
        </>
    )
}
