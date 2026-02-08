import { FieldGroup } from '@/components/ui/field'
import { ReuseableInput } from '@/dev/core'
import React from 'react'

export const MpesaPageTab: React.FC = () => {
    return (
        <div className='justify-center items-center '>
            <div className="justify-between">
                <FieldGroup>
                    <div className="w-full p-4 h-[74px] rounded-[20px] border border-[#ADABAB]/70 bg-white">
                        <span>You will Pay:</span>
                        <h1 className='text-[#0CC258] font-bold text-xl'>Kshs 904,090</h1>
                    </div>
                    <ReuseableInput
                        className="w-full  h-[51px] rounded-full border border-[#ADABAB]"
                        name="phone_number"
                        label="Please Enter Your Mobile Number Below to Pay :"
                        type='tel'
                    />
                    <span>You will shortly recieve an M-pesa prompt on your phone requesting you to enter your M-PESA PIN to complete your payment</span>
                    <div>
                        <span>You can also pay using Lipa na Mpesa by using the following Instructions:</span>
                        <ol className="list-decimal list-inside space-y-2 font-poppins text-sm text-black">
                            <li>Go to the M-PESA menu</li>
                            <li>Select Lipa na M-PESA.</li>
                            <li>Select the Paybill option.</li>
                            <li>Enter business number ******</li>
                            <li>Enter account number *******</li>
                            <li>Enter the amount Ksh. 904,090.</li>
                            <li>Enter your PIN and press OK to send.</li>
                            <li>You will receive a confirmation SMS with your payment reference number.</li>
                        </ol>

                    </div>
                </FieldGroup>
            </div>
        </div>
    )
}
