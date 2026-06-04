import { ReusableSingleSelectApiInput } from '@/dev/core'
import React, { useEffect } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import type { VehicleFormValues } from '@/types/schema'

export const VehicleUseInput: React.FC = () => {
    const { control, setValue } = useFormContext<VehicleFormValues>()
    const selectedVehicleClassId = useWatch({ control, name: 'vehicle_class_id' })
    const selectedCoveringId = useWatch({ control, name: 'covering_id' })
    const canFetchVehicleUse = Boolean(selectedVehicleClassId && selectedCoveringId)

    useEffect(() => {
        setValue('used_for_id', '')
    }, [selectedVehicleClassId, selectedCoveringId, setValue])

    return (
        <Controller
            control={control}
            name="used_for_id"
            render={({ field }) => (
                <ReusableSingleSelectApiInput
                    url={canFetchVehicleUse ? 'motor/general-tools/vehicleuse' : ''}
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
                            ? 'Select vehicle use...'
                            : 'Select cover covering and vehicle class first'
                    }
                />
            )}
        />
    )
}
