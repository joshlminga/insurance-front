import { FieldGroup } from '@/components/ui/field'
import { ReusableSelect, ReuseableInput } from '@/dev/core'
import React from 'react'

export const MotorPrivatePage: React.FC = (form) => {
   
    return (
        <div className='justify-center items-center'>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="justify-between">
                    <FieldGroup>
                        <div className="grid grid-cols-2 gap-2">
                            <ReuseableInput
                                className="w-full max-w-[320px] h-[51px] rounded-[5px] border border-[#ADABAB]"
                                control={form.control}
                                name="registration_number"
                                label="Registration Number"
                            />
                            <ReuseableInput
                                className="w-full max-w-[320px] h-[51px] rounded-[5px] border border-[#ADABAB]"
                                control={form.control}
                                name="vehicle_model"
                                label="Model for the vehicle"
                            />
                            <ReuseableInput
                                className="w-full max-w-[320px] h-[51px] rounded-[5px] border border-[#ADABAB]"
                                control={form.control}
                                name="vehicle_make"
                                label="Make of the Vehicle"
                            />
                            <ReuseableInput
                                className="w-full max-w-[320px] h-[51px] rounded-[5px] border border-[#ADABAB]"
                                control={form.control}
                                name="yom"
                                label="Year of Manufacture"
                                type="date"
                            />
                            <ReusableSelect
                                className="w-full rounded-[5px]"
                                control={form.control}
                                name="insurance_type"
                                label="Type of Insurance"
                                placeholder="Select type of Insurance"
                                options={[
                                    { label: "Commercial", value: "commercial" },
                                    { label: "Third Party", value: "third_party" },
                                ]}
                            />
                        </div>
                    </FieldGroup>
                </div>
            </form>
        </div>
    )
}
