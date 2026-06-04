/* eslint-disable react-hooks/exhaustive-deps */
import { PageHeader } from '@/components/shared'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button, ReuseableInput } from '@/dev/core'
import { FieldGroup } from '@/components/ui/field'
import { CustomerDetailsSchema, VehicleDetailsSchema } from '@/types/form-schema'
import type { CustomerFormValues, VehicleFormValues } from '@/types/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { UseApiQuery } from '@/hooks/hooks'
import type { SubmitResponse, VehicleClassItem } from '@/types/types'
import { Loader2 } from 'lucide-react'

const MotorQuotationSchema = CustomerDetailsSchema.omit({ country: true }).merge(VehicleDetailsSchema)
type MotorQuotationFormValues = Omit<CustomerFormValues, 'country'> & VehicleFormValues

type VehicleClassTab = {
    value: string
    label: string
    disabled?: boolean
}

export const MotorQuotationPage = () => {

    const [selectedTabValue, setSelectedTabValue] = useState<string>('')

    const { data: vehicleClassesData, isLoading } = UseApiQuery<SubmitResponse>({
        url: 'motor/general-tools/vehicle_classes',
        queryOptions: { enabled: true },
    })
    
    const vehicleClasses = (vehicleClassesData?.data ?? []) as VehicleClassItem[]
    const activeVehicleClasses = useMemo(
        () => vehicleClasses.filter((item) => item.is_active),
        [vehicleClasses]
    )

    const motoTabs = useMemo<VehicleClassTab[]>(() => {
        return activeVehicleClasses.map((item) => ({
            value: String(item.id),
            label: item.name,
        }))
    }, [activeVehicleClasses])

    const form = useForm<MotorQuotationFormValues>({
        resolver: zodResolver(MotorQuotationSchema),
        defaultValues: {
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            user_id: '',
            country_id: '',
            covertype_id: '',
            covering_id: '',
            ownership: '',
            vehicle_class_id: '',
            used_for_id: '',
            registration_number: '',
            vehicle_registration_number: '',
            vehicle_value: '',
            valued_by_professional: false,
        },
    })

    useEffect(() => {
        if (motoTabs.length === 0) return
        const firstTab = motoTabs[0]
        setSelectedTabValue((prev) => prev || firstTab.value)
        form.setValue('vehicle_class_id', firstTab.value, {
            shouldValidate: true,
        })
    }, [motoTabs, form])

    const handleTabChange = (value: string) => {
        setSelectedTabValue(value)
        form.setValue('vehicle_class_id', value, {
            shouldValidate: true,
            shouldDirty: true,
        })
    }

    const onSubmit = (data: MotorQuotationFormValues) => {
        console.log('Form data:', data)
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Motor Quotations"
                description="Manage motor Quotations for comprehensive or 3rd party"
            />

            <FormProvider {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    {/* Card 1: Customer Verification Details */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold">
                                Customer Verification Details
                            </h2>
                        </CardHeader>
                        <CardContent>
                            <FieldGroup>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <ReuseableInput
                                        className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                                        control={form.control}
                                        name="email"
                                        label="Email"
                                        type="email"
                                    />
                                    <ReuseableInput
                                        className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                                        control={form.control}
                                        name="phone"
                                        label="Mobile Number"
                                        type="tel"
                                    />
                                    <ReuseableInput
                                        className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                                        control={form.control}
                                        name="first_name"
                                        label="First Name"
                                    />
                                    <ReuseableInput
                                        className="w-full h-12.75 rounded-[5px] border border-[#ADABAB]"
                                        control={form.control}
                                        name="last_name"
                                        label="Last Name"
                                    />
                                </div>
                            </FieldGroup>
                        </CardContent>
                    </Card>

                    {isLoading ? (
                        <Card>
                            <CardContent className="py-8">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Loading vehicle classes...
                                </div>
                            </CardContent>
                        </Card>
                    ) : motoTabs.length === 0 ? (
                        <Card>
                            <CardContent className="py-8">
                                <div className="text-sm text-muted-foreground">
                                    No active vehicle classes found.
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Tabs
                            value={selectedTabValue}
                            onValueChange={handleTabChange}
                            className="w-full"
                        >
                            <Card>
                                <CardHeader>
                                    <h2 className="text-lg font-semibold">
                                        Cover Type
                                    </h2>
                                </CardHeader>
                                <CardContent>
                                    <h6 className="text-base font-bold mb-4">
                                        Select type of cover
                                    </h6>
                                    <TabsList className="h-auto min-h-10 sm:min-h-10 w-full max-w-full lg:max-w-130 rounded-[12px] sm:rounded-[20px] border border-[#ADABAB] bg-white p-0 flex flex-wrap sm:flex-nowrap">
                                        {motoTabs.map((tab) => (
                                            <TabsTrigger
                                                key={tab.value}
                                                value={tab.value}
                                                disabled={tab.disabled}
                                                className="flex-1 h-6 sm:h-full min-w-0 rounded-none 
                                                first:rounded-tl-[12px] first:rounded-bl-[12px] sm:first:rounded-l-[20px] last:rounded-tr-[12px] last:rounded-br-[12px] 
                                                sm:last:rounded-r-[20px] data-[state=active]:bg-[#C20C0C] data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-black 
                                                flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm lg:text-lg font-medium px-2 sm:px-4">
                                                {tab.label}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </CardContent>
                            </Card>
                        </Tabs>
                    )}

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            className="bg-[#C20C0C]/80 rounded-full hover:bg-[#C20C0C]"
                            disabled={isLoading || motoTabs.length === 0}
                        >
                            Save
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    )
}
