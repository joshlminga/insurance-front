import { CardFooter } from '@/components/ui/card'
import { Button, ReusableCard } from '@/dev/core'
import { ECOMPARISONSAMPLEDATA } from '@/utils/enums'
import { ArrowDown, MoveLeft } from 'lucide-react'
import React from 'react'

export const ComparisonPage: React.FC = () => {
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
            <div className='grid grid-cols-4 gap-6'>
                {ECOMPARISONSAMPLEDATA.map((item) => (
                    <ReusableCard
                        key={item.id}
                        header={item.header as any}
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
        </div>
    )
}
