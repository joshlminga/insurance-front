/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardFooter } from '@/components/ui/card'
import { Button, CustomDialogComponent, ReusableCard } from '@/dev/core'
import { useCustomDialogContextFactory } from '@/hooks'
import { ECOMPARISONSAMPLEDATA } from '@/utils/enums'
import { ArrowDown, MoveLeft } from 'lucide-react'
// import React, { useEffect, useState } from 'react'
import { PostComparisonPage } from './[id]/page'
// import { MOTOR_QUOTE_SESSION_STORAGE_KEY } from '@/utils/constatnts'
// import { UseApiQuery } from '@/hooks/hooks'
// import { SubmitResponse } from '@/types/types'

export const ComparisonPage = ({
    componentProps,
}: {
    handleDialogContextSwitch: (context?: any) => void
    componentProps?: any
}) => {

    console.log(componentProps?.data?.data);
    // const [quoteSessionId, setQuoteSessionId] = useState<number | null>(null)

    const { handleDialogContextSwitch, dialogContent, dialogOpen } =
        useCustomDialogContextFactory<{
            refetch?: () => Promise<any>;
            data?: any;
        }>();

    // useEffect(() => {
    //     const storedSessionId = Number(sessionStorage.getItem(MOTOR_QUOTE_SESSION_STORAGE_KEY))
    //     if (Number.isFinite(storedSessionId) && storedSessionId > 0) {
    //         setQuoteSessionId(storedSessionId)
    //     } else {
    //         setQuoteSessionId(null)
    //     }
    // }, [])

    // const { data, isLoading } = UseApiQuery<SubmitResponse>({
    //         url: `document/motor/comparison/${quoteSessionId}`,
    //         queryOptions: {
    //             enabled: true,
    //         },
    //     })


    return (
        <div className=''>
            <h1 className="flex items-center justify-between px-3 text-2xl font-bold mb-4">
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        className="flex items-center justify-center rounded-md p-1 bg-transparent hover:bg-muted"
                        leftIcon={<MoveLeft className="h-8 w-8 text-primary" />}
                    />
                    <span>Click preferred Insurers to Compare</span>
                </div>
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {ECOMPARISONSAMPLEDATA.map((item) => (
                    <ReusableCard
                        onClick={() => {
                            handleDialogContextSwitch({
                                Component: PostComparisonPage,
                            })
                        }}
                        key={item.id}
                        header={item.header as any}
                        rootClassName='aspect-square p-2'
                        contentClassName='items-center text-center'
                        children={
                            <>
                                {item.content.map((row, idx) => (
                                    <div key={idx}>
                                        <div className="">
                                            <div>{row.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        } />
                ))}
            </div>
            <CardFooter className="md:col-span-2 flex justify-end mt-6">
                <Button
                    type="button"
                    className="rounded-0 bg-[#C20C0C] hover:bg-[#C20C0C]/70"
                    leftIcon={<ArrowDown />}>
                    Download Copmarison
                </Button>
            </CardFooter>

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
        </div>
    )
}
