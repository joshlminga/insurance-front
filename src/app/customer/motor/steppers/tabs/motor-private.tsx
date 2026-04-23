import { FieldGroup } from '@/components/ui/field'
import {
    ReusableSingleSelectApiInput,
} from '@/dev/core'
import React, { useEffect } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'

export const MotorPrivatePage: React.FC = () => {
    const { control, setValue } = useFormContext()
    const selectedVehicleClassId = useWatch({ control, name: "vehicle_class_id" })
    const selectedCoveringId = useWatch({ control, name: "covering_id" })
    const canFetchVehicleUse = Boolean(selectedVehicleClassId && selectedCoveringId)

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
                    </div>
                </FieldGroup>
            </div>
        </div>
    )
}
