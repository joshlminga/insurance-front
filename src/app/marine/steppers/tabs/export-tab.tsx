import { FieldGroup } from '@/components/ui/field'
import { ReusableSelect, ReuseableInput } from '@/dev/core'
import React from 'react'
import { useFormContext } from 'react-hook-form'

export const MarineExportPage: React.FC = () => {
    const { control } = useFormContext()

    return (
        <div className='justify-center items-center'>
            <div className="justify-between">
                <FieldGroup>
                    <div className="grid grid-cols-2 gap-x-5 gap-2">
                        <ReusableSelect
                            className="w-fullrounded-[5px]"
                            control={control}
                            name="country_origin"
                            label="Country of Origin"
                            placeholder="Select Country of Origin"
                            options={[
                                { label: "Kenya", value: "KEN" },
                                { label: "China", value: "CNA" },
                            ]}
                        />
                        <ReusableSelect
                            className="w-fullrounded-[5px]"
                            control={control}
                            name="country_destination"
                            label="Destination Country"
                            placeholder="Select Destination Country"
                            options={[
                                { label: "Kenya", value: "KEN" },
                                { label: "China", value: "CNA" },
                            ]}
                        />
                        <ReuseableInput
                            className="w-full  h-[51px] rounded-[5px] border border-[#ADABAB]"
                            control={control}
                            name="shipping_mode"
                            label="Shipping Mode"
                        />
                        <ReuseableInput
                            className="w-full  h-[51px] rounded-[5px] border border-[#ADABAB]"
                            control={control}
                            name="shipping_date"
                            label="Shipping Date"
                            type="date"
                            placeholder="e.g. 2020"
                        />
                        <ReuseableInput
                            className="w-full  h-[51px] rounded-[5px] border border-[#ADABAB]"
                            control={control}
                            name="sum_insured"
                            label="Sum Insured"
                            type='text'
                        />
                        <ReuseableInput
                            className="w-full  h-[51px] rounded-[5px] border border-[#ADABAB]"
                            control={control}
                            name="package_type"
                            label="Package Type"
                            type='text'
                        />
                        <ReuseableInput
                            className="w-full  h-[51px] rounded-[5px] border border-[#ADABAB]"
                            control={control}
                            name="origin_port"
                            label="Port of Origin"
                            type='text'
                        />

                        <ReuseableInput
                            className="w-full  h-[51px] rounded-[5px] border border-[#ADABAB]"
                            control={control}
                            name="origin_destination"
                            label="Port of Destination"
                            type='text'
                        />
                        <ReusableSelect
                            className="w-full rounded-[5px]"
                            control={control}
                            name="cargo_type"
                            label="Cargo Type"
                            placeholder="Select type of Cargo"
                            options={[
                                { label: "Fragile", value: "Fragile" },
                                { label: "Metalic", value: "Metalic" },
                            ]}
                        />
                    </div>
                </FieldGroup>
            </div>
        </div>
    )
}
