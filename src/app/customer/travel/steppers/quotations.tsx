/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    CardFooter
} from '@/components/ui/card'
import {
    Button,
    CustomDialogComponent,
    ReusableCard,
    ReusableCheckboxGrid,
    ReusablePagination,
    ReusableSelect,
    ReuseableInput
} from '@/dev/core'
import {
    useCustomDialogContextFactory
} from '@/hooks'
import {
    CustomerVerificationDetailsProps,
    QuotationFiltersPanelProps,
} from '@/types/types'
import {
    EPREFIX,
    EQUOTATIONSAMPLEDATA,
    EROUTES,
    QUOTATIONCHECKBOX
} from '@/utils/enums'
import {
    ArrowLeftCircle,
    ArrowRightCircle,
    Plus
} from 'lucide-react'
import React, { useState } from 'react'
import { FieldValues, Path, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { TravelQuotePreviewPage } from './quotation-pages/qoute-preview/page'
import { TravelComparisonPage } from './quotation-pages/comparisons/page'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { SIDEBAR_LAYOUT_QUERY } from '@/utils/utils'
import { BENEFIT_SELECT_NONE } from '@/utils/constatnts'
import { 
    benefitGroupFormKey, benefitOptionLabel } from '@/utils/helpers'


export function QuotationFiltersPanel({
    idPrefix = 'quotation',
    quoteSessionId,
    isPending,
    isFetching,
    data,
    benefitGroups,
    benefitFormControl,
    priceRange,
    onPriceRangeChange,
    className,
}: QuotationFiltersPanelProps) {
    const searchId = `${idPrefix}-insurer-search`
    const sliderId = `${idPrefix}-price-slider`

    return (
        <div className={className}>
            <div className="mb-5 grid gap-2">
                <Label htmlFor={searchId}>Search by Insurer</Label>
                <Input
                    id={searchId}
                    name="search"
                    type="text"
                    placeholder="Enter insurer name..."
                    className="h-11 w-full rounded-[5px] border border-[#ADABAB] sm:h-10"
                />
            </div>

            <h2 className="mb-1 text-base font-semibold text-gray-900 sm:text-lg">
                Additional benefits
            </h2>
            <hr className="mb-5" />

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                {!quoteSessionId ? null : isPending && !data && benefitGroups.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Loading benefit options…</p>
                ) : benefitGroups.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No optional benefits are available for this quote yet.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {benefitGroups.map(({ group, items }) => {
                            const fieldName = benefitGroupFormKey(group)
                            const options = [
                                { value: BENEFIT_SELECT_NONE, label: '-- none --' },
                                ...items.map((item) => ({
                                    value: String(item.id),
                                    label: benefitOptionLabel(item),
                                })),
                            ]
                            return (
                                <ReusableSelect
                                    key={group}
                                    control={benefitFormControl}
                                    name={fieldName as Path<FieldValues>}
                                    label={group}
                                    placeholder={`Choose in ${group}`}
                                    options={options}
                                    disabled={isFetching}
                                    triggerClassName="border-[#ADABAB]"
                                />
                            )
                        })}
                    </div>
                )}
            </form>
            <hr className="my-5" />
            <h2 className="mb-1 text-base font-semibold text-gray-900 sm:text-lg">
                Price Range
            </h2>
            <div className="grid w-full gap-3">
                <div className="flex items-center justify-between gap-2">
                    <Label htmlFor={sliderId}>Price</Label>
                    <span className="text-sm text-muted-foreground">
                        {/* {priceRange.join(', ')} */}
                    </span>
                </div>
                <Slider
                    id={sliderId}
                    value={priceRange}
                    onValueChange={onPriceRangeChange}
                    min={0}
                    max={100}
                    step={0.1}
                />
            </div>
        </div>
    )
}

export const TravelQuotationsPage: React.FC<CustomerVerificationDetailsProps> = ({ goToNextStep, goToPrevStep, }) => {
    const [page, setPage] = useState(1)
    const form = useForm();
    const [filterSheetOpen, setFilterSheetOpen] = useState(false)

    const [isSidebarLayout, setIsSidebarLayout] = useState(() =>
        typeof window !== 'undefined'
            ? window.matchMedia(SIDEBAR_LAYOUT_QUERY).matches
            : true
    )

    const { handleDialogContextSwitch, dialogContent, dialogOpen } =
        useCustomDialogContextFactory<{
            refetch?: () => Promise<any>;
            data?: any;
        }>();
        
   const filterPanelProps = {}

    return (
        <>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:gap-5 min-[1600px]:gap-6">
                {isSidebarLayout ? (
                    <aside className="w-full shrink-0 xl:flex xl:w-64 min-[1600px]:w-72">
                        <QuotationFiltersPanel
                            {...filterPanelProps}
                            className="sticky top-24 w-full rounded-lg border border-gray-200 bg-white px-4 py-5 xl:px-5 xl:py-6"
                        />
                    </aside>
                ) : (
                    <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
                        <SheetContent
                            side="left"
                            className="w-[min(100vw-2rem,20rem)] overflow-y-auto p-0"
                        >
                            <SheetHeader className="border-b px-4 py-4 text-left">
                                <SheetTitle>Filters</SheetTitle>
                            </SheetHeader>
                            <QuotationFiltersPanel
                                // {...filterPanelProps}
                                idPrefix="mobile-quotation"
                                className="px-4 py-5"
                            />
                        </SheetContent>
                    </Sheet>
                )}

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
                                    className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                                    control={form.control}
                                    name="courtesy_car"
                                    label="Courtesy Car"
                                />
                                <ReuseableInput
                                    className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
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
                                    Component: TravelComparisonPage,
                                })
                            }>
                            Generate Comparison
                        </Button>
                    </form>

                    <div className='w-full py-3'>
                        <h1 className="text-xl sm:text-2xl font-bold mb-4">
                            Quote Comparison
                        </h1>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
                            {EQUOTATIONSAMPLEDATA.map((item) => (
                                <ReusableCard
                                  selected={!!item.id}
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
                                                        componentProps: { data: item },
                                                        Component: TravelQuotePreviewPage,
                                                    })
                                                } 
                                                 className="w-full rounded-md border border-[#D9D9D9] bg-[#C20C0C] px-3 py-2 text-sm font-medium text-white hover:bg-[#C20C0C]/90 min-[1600px]:w-auto min-[1600px]:px-4">
                                                Get Quote
                                            </Button>
                                            <Link
                                                to={`/${EPREFIX?.AUTH}${EROUTES.SIGNUP}`}
                                                className="w-full lg:w-auto">
                                                <Button 
                                                type="button" 
                                                 variant="outline"
                                                  className="w-full border-[#C20C0C] bg-[#FFF5F5] text-[#C20C0C] hover:bg-[#C20C0C] hover:text-white focus-visible:ring-[#C20C0C]/30 min-[1600px]:w-auto">
                                                    Purchase Cover
                                                </Button>
                                            </Link>
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
