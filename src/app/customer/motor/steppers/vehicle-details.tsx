/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ReusableTabs } from '@/dev/core'
import React, { useEffect, useMemo, useState } from 'react'
import type {
    CustomerVerificationDetailsProps,
    SubmitResponse,
    TTabItem,
    VehicleClassItem
} from '@/types/types'
import { CardFooter } from '@/components/ui/card'
import {
    ArrowLeftCircle,
    ArrowRightCircle,
    Loader2
} from 'lucide-react'
import { useForm, FormProvider } from 'react-hook-form'
import type { VehicleFormValues } from '@/types/schema'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import { zodResolver } from '@hookform/resolvers/zod'
import { VehicleDetailsSchema } from '@/types/form-schema'
import { EMETHODS, MOTOR_QUOTE_SESSION_STORAGE_KEY } from '@/utils/constatnts'
import { ShowToast } from '@/utils/utils'
import { UseAuth } from '@/stores/auth-store'
import { extractErrorMessage } from '@/utils/helpers'
import { MotorCommercialPage } from './tabs/motor-commercial'
import { MotorPrivatePage } from './tabs/motor-private'
import { MotorPsvPage } from './tabs/motor-psv'
import { MotorSpecialVehicle } from './tabs/motor-special-vehicle'

export const VehicleDetailsPage: React.FC<CustomerVerificationDetailsProps> = ({ goToNextStep, goToPrevStep }) => {
    const [selectedTabValue, setSelectedTabValue] = useState<string>("");

    const { user } = UseAuth();
    const { data, isLoading } = UseApiQuery<SubmitResponse>({
        url: 'motor/general-tools/vehicle_classes',
        queryOptions: {
            enabled: true,
        },
    })
    const vehicleClasses = (data?.data ?? []) as VehicleClassItem[];

    const activeVehicleClasses = useMemo(
        () => vehicleClasses.filter((item) => item.is_active),
        [vehicleClasses]
    )

    const motoTabs = useMemo<TTabItem[]>(() => {
        const componentBySlug = {
            private: MotorPrivatePage,
            commercial: MotorCommercialPage,
            psv: MotorPsvPage,
            specialvehicle: MotorSpecialVehicle,
        }
        const normalizeSlug = (slug: string | null | undefined) =>
            (slug ?? "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase()
        return activeVehicleClasses.map((item) => {
            const cleanedSlug = normalizeSlug(item.slug)

            return {
                value: String(item.id),
                label: item.name,
                component:
                    componentBySlug[cleanedSlug as keyof typeof componentBySlug] ??
                    MotorPrivatePage,
            }
        })
    }, [activeVehicleClasses])
    const isClassTabsLoading = isLoading

    const form = useForm<VehicleFormValues>({
        resolver: zodResolver(VehicleDetailsSchema),
        defaultValues: {
            user_id: user?.id ?? "",
            country_id: "",
            covertype_id: "",
            covering_id: "",
            ownership: "",
            vehicle_make_id: "",
            vehicle_model_id: "",
            vehicle_class_id: "",
            used_for_id: "",
            bodytype_id: "",
            registration_number: "",
            vehicle_registration_number: "",
            vehicle_model: "",
            year: "",
            valued_by_professional: false
        },
    })
    
    useEffect(() => {
        if (motoTabs.length === 0) return
        const firstTab = motoTabs[0]
        setSelectedTabValue((prev) => prev || firstTab.value)
        form.setValue("vehicle_class_id", form.getValues("vehicle_class_id") || firstTab.value, { shouldValidate: true })
    }, [motoTabs, form])

    const submitMutation = UseApiMutation<SubmitResponse, Record<string, any>>({
        url: "quotation/motor",
        method: EMETHODS.POST,
        mutationOptions: {
            onSuccess: (data) => {
                const quoteSessionId = Number(data?.data?.id)
                if (!Number.isFinite(quoteSessionId) || quoteSessionId <= 0) {
                    ShowToast.error("Quote session could not be initialized. Please try again.")
                    return
                }
                sessionStorage.setItem(MOTOR_QUOTE_SESSION_STORAGE_KEY, String(quoteSessionId))
                goToNextStep?.()
                ShowToast.success(data.message || "Submitted successfully!")
            },
            onError: (error: any) => {
                const message = extractErrorMessage(error);
                ShowToast.error(message || "Submission failed!")
            },
        },
    })
    const onSubmit = (data: VehicleFormValues) => {
        const valuedByProfessional =
            data.valued_by_professional === true ||
            String(data.valued_by_professional).toLowerCase() === "true"

        submitMutation.mutate({
            ...data,
            coverfor_id: data.vehicle_class_id,
            valued_by_professional: valuedByProfessional,
        })
    }

    const handleTabChange = (value: string) => {
        setSelectedTabValue(value)
        form.setValue("vehicle_class_id", value, { shouldValidate: true, shouldDirty: true })
    }

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full mx-auto bg-transparent">
                <div className='items-center justify-center border p-3 sm:p-4'>
                    <div className="w-full py-3">
                        <h1 className="text-xl sm:text-2xl font-bold leading-none mb-2 sm:mb-4">
                            Proceed to add your <span className='text-[#C20C0C]'>Vehicle Details</span>
                        </h1>
                        <h6 className='text-base sm:text-lg font-bold'>Select type of cover</h6>
                    </div>
                    <div className="w-full overflow-x-auto">
                        {isClassTabsLoading ? (
                            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading vehicle classes...
                            </div>
                        ) : motoTabs.length === 0 ? (
                            <div className="py-4 text-sm text-muted-foreground">
                                No active vehicle classes found.
                            </div>
                        ) : (
                            <ReusableTabs
                                tabs={motoTabs}
                                value={selectedTabValue}
                                onValueChange={handleTabChange}
                                form={form}
                            />
                        )}
                    </div>
                </div>
                <CardFooter className="w-full flex flex-col sm:flex-row justify-between gap-3 mt-3 px-0">
                    <Button
                        type="button"
                        className="w-full sm:w-auto rounded-full border border-[#C20C0C] text-[#C20C0C] bg-transparent hover:bg-[#C20C0C]/10"
                        leftIcon={<ArrowLeftCircle />}
                        onClick={() => goToPrevStep?.()}>
                        Previous
                    </Button>
                    <Button
                        type="submit"
                        className="w-full sm:w-auto bg-[#C20C0C]/80 rounded-full hover:bg-[#C20C0C]"
                        rightIcon={<ArrowRightCircle />}
                        loading={submitMutation.isPending}
                        disabled={isClassTabsLoading || motoTabs.length === 0}>
                        Next
                    </Button>
                </CardFooter>
            </form>
        </FormProvider>
    )
}
