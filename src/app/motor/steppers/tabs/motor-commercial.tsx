import { FieldGroup } from '@/components/ui/field'
import { ReusableSelect, ReuseableInput } from '@/dev/core'
import React from 'react'
import { useFormContext } from 'react-hook-form'

export const MotorCommercialPage: React.FC = () => {
    const { control } = useFormContext()

    return (
        <div className='justify-center items-center'>
            <div className="justify-between">
                <FieldGroup>
                    <div className="grid grid-cols-2 gap-x-5 gap-2">
                        <ReuseableInput
                            className="w-full h-[51px] rounded-[5px] border border-[#ADABAB]"
                            control={control}
                            name="registration_number"
                            label="Registration Number"
                        />
                        <ReuseableInput
                            className="w-full  h-[51px] rounded-[5px] border border-[#ADABAB]"
                            control={control}
                            name="vehicle_model"
                            label="Model for the vehicle"
                        />
                        <ReuseableInput
                            className="w-full  h-[51px] rounded-[5px] border border-[#ADABAB]"
                            control={control}
                            name="vehicle_make"
                            label="Make of the Vehicle"
                        />
                        <ReuseableInput
                            className="w-full  h-[51px] rounded-[5px] border border-[#ADABAB]"
                            control={control}
                            name="yom"
                            label="Year of Manufacture"
                            type="text"
                            placeholder="e.g. 2020"
                        />
                        <ReusableSelect
                            className="w-full rounded-[5px]"
                            control={control}
                            name="insurance_type"
                            label="Type of Insurance"
                            placeholder="Select type of Insurance"
                            // disabled
                            options={[
                                { label: "Commercial", value: "commercial" },
                                { label: "Third Party", value: "third_party" },
                            ]}
                        />
                    </div>
                </FieldGroup>
            </div>
        </div>
    )
}
