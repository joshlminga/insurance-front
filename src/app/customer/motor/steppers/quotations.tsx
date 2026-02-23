/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardFooter, } from '@/components/ui/card'
import { Button, CustomDialogComponent, ReusableCard, ReusableCheckboxGrid, ReusablePagination, ReuseableInput } from '@/dev/core'
import { useCustomDialogContextFactory, } from '@/hooks'
import type { CustomerVerificationDetailsProps } from '@/types/types'
import { EPREFIX, EQUOTATIONSAMPLEDATA, EROUTES, QUOTATIONCHECKBOX } from '@/utils/enums'
import { ArrowLeftCircle, ArrowRightCircle, Plus } from 'lucide-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ComparisonPage } from './comparisons/page'
import { Link } from 'react-router-dom'
import { QuotePreviewPage } from './qoute-preview/page'
import { UseAuth } from '@/components/auth-provider'

export const QuotationsPage: React.FC<CustomerVerificationDetailsProps> = ({ goToNextStep, goToPrevStep }) => {
    const [page, setPage] = useState(1)
    const form = useForm();
    const { isAuthenticated } = UseAuth()

    const { handleDialogContextSwitch, dialogContent, dialogOpen } =
        useCustomDialogContextFactory<{
            refetch?: () => Promise<any>;
            data?: any;
        }>();

    return (
        <>
            <div className="max-w-full mx-auto border-0 bg-transparent">
                <form className='w-full py-2 sm:py-4'>
                    <div className="w-full border rounded-0 px-3 sm:px-6 py-4 sm:py-6">
                        <h1 className="text-xl sm:text-2xl font-bold mb-4">
                            Additional Benefits:
                        </h1>
                        <hr className="mb-4 sm:mb-6" />
                        <div className="overflow-x-auto">
                            <ReusableCheckboxGrid
                                options={QUOTATIONCHECKBOX}
                                columns={3}
                            />
                        </div>

                        <hr className="my-4 sm:mb-6" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                            <ReuseableInput
                                className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                                control={form.control}
                                name="courtesy_car"
                                label="Courtesy Car"
                            />
                            <ReuseableInput
                                className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                                control={form.control}
                                name="road_rescue"
                                label="Road Rescue"
                            />
                        </div>
                        <Button
                            type='button'
                            className="ml-auto mt-4 flex items-center rounded-[3px] border border-[#0CC2581F] bg-[#C7EED5] hover:bg-[#C7EED5]/90 text-[#43A047]"
                            leftIcon={<Plus className='h-6 w-6 sm:h-8 sm:w-8' />}>
                            Add
                        </Button>
                    </div>

                    <Button
                        type='button'
                        className="w-full sm:w-auto sm:ml-auto mt-4 flex items-center justify-center font-bold bg-[#C20C0C]/80 hover:bg-[#C20C0C]"
                        onClick={() =>
                            handleDialogContextSwitch({
                                Component: ComparisonPage,
                            })
                        }>
                        Generate Comparison
                    </Button>
                </form>
                <div className='w-full py-3'>
                    <h1 className="text-xl sm:text-2xl font-bold mb-4">
                        Quote Comparison
                    </h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {EQUOTATIONSAMPLEDATA.map((item) => (
                            <ReusableCard
                                key={item.id}
                                header={item.header as any}
                                rootClassName=""
                                footerClassName="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between"
                                footer={
                                    <>
                                        <Button
                                            type="button"
                                            onClick={() =>
                                                handleDialogContextSwitch({
                                                    componentProps: {
                                                        data: item
                                                    },
                                                    Component: QuotePreviewPage,
                                                })
                                            }
                                            className="w-full lg:w-auto rounded-md border border-[#D9D9D9] bg-[#C20C0C] hover:bg-[#C20C0C]/90 font-medium text-white">
                                            Get Quote
                                        </Button>

                                        {isAuthenticated ? (
                                            <Button
                                                type="button"
                                                onClick={goToNextStep}
                                                className="w-full lg:w-auto rounded-md border border-[#D9D9D9] bg-[#0CC258] hover:bg-[#0CC258]/90 font-medium text-white">
                                                Purchase Cover
                                            </Button>
                                        ) : (
                                            <Link
                                                to={`/${EPREFIX.AUTH}${EROUTES.SIGNUP}`}
                                                className="w-full lg:w-auto">
                                                <Button
                                                    type="button"
                                                    className="w-full lg:w-auto rounded-md border border-[#D9D9D9] bg-[#0CC258] hover:bg-[#0CC258]/90 font-medium text-white">
                                                    Purchase Cover
                                                </Button>
                                            </Link>
                                        )}
                                    </>
                                }

                                children={
                                    <>
                                        {item.content.map((row, idx) => (
                                            <div key={idx}>
                                                <div className="flex flex-wrap justify-between gap-1 min-w-0">
                                                    <span className="text-xs sm:text-sm wrap-break-word max-w-[60%]">{row.label}</span>
                                                    <span className="text-xs sm:text-sm wrap-break-word max-w-[35%] text-right">{row.value}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                } />
                        ))}
                    </div>
                </div>
                <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-0">
                    <Button
                        type="button"
                        className="w-full sm:w-auto rounded-full border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
                        leftIcon={<ArrowLeftCircle />}
                        onClick={() => goToPrevStep?.()}>
                        Previous
                    </Button>

                    <div className="order-first sm:order-0">
                        <ReusablePagination
                            currentPage={page}
                            totalPages={10}
                            onPageChange={setPage}
                        />
                    </div>

                    <Button
                        type="button"
                        className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-full hover:bg-[#C20C0C]"
                        rightIcon={<ArrowRightCircle />}
                        onClick={() => (goToNextStep?.())}>
                        Next
                    </Button>
                </CardFooter>
            </div>

            <CustomDialogComponent
                {...{ handleDialogContextSwitch, dialogOpen }}
                className='sm:max-w-fit w-[95vw] sm:w-auto p-4 sm:p-6'>
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
