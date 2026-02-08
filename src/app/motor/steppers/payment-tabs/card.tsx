import { FieldGroup } from '@/components/ui/field'
import { ReuseableInput } from '@/dev/core'
import React from 'react'

export const CardsTabPage: React.FC = () => {
  return (
   <div className='justify-center items-center '>
            <div className="justify-between">
                <FieldGroup>
                    <div className="w-full p-4 h-[74px] rounded-[20px] border border-[#ADABAB]/70 bg-white">
                        <span>You will Pay:</span>
                        <h1 className='text-[#0CC258] font-bold text-xl'>Kshs 904,090</h1>
                    </div>
                    <div className='grid grid-cols-3 gap-4'>
                    <ReuseableInput
                        className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                        name="card_number"
                        label="Enter Card Number"
                        type='number'
                    />
                     <ReuseableInput
                        className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                        name="expiry_date"
                        label="Expiry Date"
                        type='date'
                    />
                    <ReuseableInput
                        className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                        name="cvv"
                        label="CVV"
                        type='number'
                    />
                    </div>
                </FieldGroup>
            </div>
        </div>
  )
}
