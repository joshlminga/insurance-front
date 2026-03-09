import { FieldGroup } from '@/components/ui/field'
import { ReusableSelect, ReusableSingleSelectApiInput, ReuseableInput, ReuseableSingleSelectCountriesInput } from '@/dev/core'
import { OWNERSHIPOPTIONS } from '@/utils/constatnts'
import React, { useEffect } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'

export const MotorPsvPage: React.FC = () => {
    const { control, setValue } = useFormContext()
    const selectedMakeId = useWatch({ control, name: "vehicle_make_id" })
    const selectedVehicleClassId = useWatch({ control, name: "vehicle_class_id" })
    const selectedCoveringId = useWatch({ control, name: "covering_id" })
    const canFetchModels = Boolean(selectedMakeId)
    const canFetchVehicleUse = Boolean(selectedVehicleClassId && selectedCoveringId)

    useEffect(() => {
        setValue("vehicle_model_id", "")
    }, [selectedMakeId, setValue])

    useEffect(() => {
        setValue("used_for_id", "")
    }, [selectedVehicleClassId, selectedCoveringId, setValue])

    return (
        <div className='justify-center items-center'>
            <div className="justify-between p-2">
                <FieldGroup>
                    <div className="grid grid-cols-2 gap-x-5 gap-2">
                        <Controller
                            control={control}
                            name="covertype_id"
                            render={({ field }) => (
                                <div>
                                    <ReusableSingleSelectApiInput
                                        url="motor/general-tools/covertype"
                                        value={field.value}
                                        onChange={field.onChange}
                                        label="Type of Cover"
                                        required
                                        placeholder="Select type of Cover..."

                                    />

                                </div>
                            )}
                        />
                        <Controller
                            control={control}
                            name="covering_id"
                            render={({ field }) => (
                                <div>
                                    <ReusableSingleSelectApiInput
                                        url="motor/general-tools/covercovering"
                                        value={field.value}
                                        onChange={field.onChange}
                                        label="Cover covering Options"
                                        required
                                        placeholder="Select Cover covering..."
                                    />
                                </div>
                            )}
                        />

                        <Controller
                            control={control}
                            name="vehicle_make_id"
                            render={({ field }) => (
                                <div>
                                    <ReusableSingleSelectApiInput
                                        url="taxonomies/vehicle/makes"
                                        value={field.value}
                                        onChange={field.onChange}
                                        label="Make of the Vehicle"
                                        required
                                        placeholder="Select Make of the Vehicle..."
                                    />
                                </div>
                            )}
                        />
                        <Controller
                            control={control}
                            name="vehicle_model_id"
                            render={({ field }) => (
                                <div>
                                    <ReusableSingleSelectApiInput
                                        url={canFetchModels ? "taxonomies/vehicle/models" : ""}
                                        queryParams={
                                            canFetchModels
                                                ? {
                                                    make_id: selectedMakeId,
                                                }
                                                : {}
                                        }
                                        value={field.value}
                                        onChange={field.onChange}
                                        label="Model for the vehicle"
                                        required
                                        disabled={!canFetchModels}
                                        placeholder={
                                            canFetchModels
                                                ? "Select Model for the vehicle..."
                                                : "Select make first"
                                        }
                                    />
                                </div>
                            )}
                        />
                        <ReusableSelect
                            control={control}
                            name="ownership"
                            label="ownership"
                            placeholder="Select ownership"
                            options={OWNERSHIPOPTIONS}
                        />
                        <ReuseableInput
                            className="w-full  h-12.75 rounded-[5px] border border-[#ADABAB]"
                            control={control}
                            name="year"
                            label="Year of Manufacture"
                            type="number"
                            placeholder="e.g. 2020"
                        />
                        <ReuseableInput
                            className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                            control={control}
                            name="vehicle_value"
                            label="Vehicle Value"
                            type="number"
                            placeholder="vehicle value"
                        />
                        <Controller
                            control={control}
                            name="used_for_id"
                            render={({ field }) => (
                                <div>
                                    <ReusableSingleSelectApiInput
                                        url={canFetchVehicleUse ? "motor/general-tools/vehicleuse" : ""}
                                        queryParams={
                                            canFetchVehicleUse
                                                ? {
                                                    vehicle_class_id: selectedVehicleClassId,
                                                    cover_covering_id: selectedCoveringId,
                                                }
                                                : {}
                                        }
                                        value={field.value}
                                        onChange={field.onChange}
                                        label="Vehicle use"
                                        required
                                        disabled={!canFetchVehicleUse}
                                        placeholder={
                                            canFetchVehicleUse
                                                ? "Select vehicle use..."
                                                : "Select cover covering and vehicle class first"
                                        }
                                    />
                                </div>
                            )}
                        />
                         {/* <Controller
                            control={control}
                            name="bodytype_id"
                            render={({ field }) => (
                                <div>
                                    <ReusableSingleSelectApiInput
                                        url={`taxonomies/vehicle/body-types`}
                                        value={field.value}
                                        onChange={field.onChange}
                                        label="Vehicle Body Type"
                                        required
                                        placeholder="Select vehicle body type..."
                                    />
                                </div>
                            )}
                        /> */}
                         <ReuseableInput
                            className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                            control={control}
                            name="number_of_passengers"
                            label="Vehicle number of passengers"
                            type="number"
                            placeholder="vehicle number of passengers"
                        />
                        <ReuseableInput
                            className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                            control={control}
                            name="tonnage"
                            label="Vehicle tonnage"
                            type="number"
                            placeholder="vehicle tonnage"
                        />
                        <Controller
                            control={control}
                            name="country_id"
                            render={({ field }) => (
                                <div>
                                    <ReuseableSingleSelectCountriesInput
                                        value={field.value}
                                        onChange={field.onChange}
                                        label="Country"
                                        required
                                        placeholder="Select Country..."
                                    />
                                </div>
                            )}
                        />
                    </div>
                </FieldGroup>
            </div>
        </div>
    )
}
