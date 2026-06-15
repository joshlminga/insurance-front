/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import {
    Button,
    CustomDialogComponent,
    ReusableDropdown,
    SendDocumentsViaEmail
} from "@/dev/core";
import { formatCurrency } from "@/lib/format";
import {
    Download,
    Forward,
    Mail,
    Share2,
    ShoppingCart
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
    BenefitType,
    premiumPreview,
    SubmitResponse,
} from "@/types/types";
import {
    BENEFIT_SECTIONS,
    BENEFIT_TYPE_CONFIG,
    EMETHODS,
    MOTOR_QUOTE_SESSION_STORAGE_KEY,
    PURCHASE_SESSION_STORAGE_KEY,
    VEHICLE_DETAILS_SESSION_STORAGE_KEY,
    VEHICLE_OWNERSHIP_SESSION_STORAGE_KEY,
} from "@/utils/constatnts";
import { ShowToast } from "@/utils/utils";
import { UseApiMutation } from "@/hooks/hooks";
import { extractErrorMessage } from "@/utils/helpers";
import { useCustomDialogContextFactory } from "@/hooks";

export const AdminMotorQuotePreviewPage: React.FC<premiumPreview> = ({
    componentProps,
    goToNextStep: goToNextStepProp,
}) => {
    const [quoteSessionId, setQuoteSessionId] = useState<number | null>(null)
    const item = componentProps?.data;

    const goToNextStep = goToNextStepProp ?? componentProps?.goToNextStep;
    const org = item?.product?.organization;
    const premium = item?.calculated_premium;
    const benefits = item?.benefits;

    const allBenefits = BENEFIT_SECTIONS.flatMap(({ type, key }) =>
        (benefits?.[key] ?? []).map((b: any) => ({ ...b, type }))
    );

    useEffect(() => {
        const storedSessionId = Number(sessionStorage.getItem(MOTOR_QUOTE_SESSION_STORAGE_KEY))
        if (Number.isFinite(storedSessionId) && storedSessionId > 0) {
            setQuoteSessionId(storedSessionId)
        } else {
            setQuoteSessionId(null)
        }
    }, [])

    const data = {
        'product_id': componentProps?.data?.product_id,
        'rate_id': componentProps?.data?.rate_id,
    };

    const submitMutation = UseApiMutation<Blob, void>({
        url: `document/motor/single-quote/${quoteSessionId}`,
        method: EMETHODS.POST,
        config: {
            responseType: 'blob',
        },
        mutationOptions: {
            onSuccess: (data) => {
                const blob = new Blob([data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const width = 1000;
                const height = 900;
                const left = (window.screen.width / 2) - (width / 2);
                const top = (window.screen.height / 2) - (height / 2);
                const popup = window.open(
                    url,
                    'PDF Preview',
                    `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
                );
                if (!popup) {
                    ShowToast.error("Popup blocked!");
                }
            },
            onError: (error: unknown) => {
                const message = extractErrorMessage(error);
                ShowToast.error(message || "Failed to generate preview!");
            },
        },
    });

    const onSubmit = (data: any) => {
        if (!quoteSessionId) {
            ShowToast.error("No active quote session found.")
            return
        }
        submitMutation.mutate(data)
    }

    const submitPurchaseMutation = UseApiMutation<SubmitResponse, any>({
        url: `purchase/motor/${quoteSessionId}`,
        method: EMETHODS.POST,
        mutationOptions: {
            onSuccess: (data) => {
                const purchaseId = data?.data?.purchase_id
                if (purchaseId === undefined) {
                    ShowToast.error("Purchase session could not be initialized. Please try again.")
                    return
                }
                const vehicleInfo = data?.data?.vehicle_info
                sessionStorage.setItem(PURCHASE_SESSION_STORAGE_KEY, String(purchaseId))
                sessionStorage.setItem(VEHICLE_DETAILS_SESSION_STORAGE_KEY, vehicleInfo ? JSON.stringify(vehicleInfo) : "")
                sessionStorage.setItem(VEHICLE_OWNERSHIP_SESSION_STORAGE_KEY, String(data?.data?.ownership))
                goToNextStep?.();
                ShowToast.success(data?.message ?? "Purchase started");
            },
            onError: (error: unknown) => {
                const message = extractErrorMessage(error);
                ShowToast.error(message || "Purchase failed!");
            },
        },
    });

    const onPurchase = (data: any) => {
        if (!quoteSessionId) {
            ShowToast.error("No active quote session found.")
            return
        }
        submitPurchaseMutation.mutate(data)
    }

    const { handleDialogContextSwitch, dialogContent, dialogOpen } =
        useCustomDialogContextFactory<{
            refetch?: () => Promise<any>
            data?: any
        }>()

    return (
        <>
            <div className="w-full mx-auto lg:max-w-100 lg:min-w-100 px-4 space-y-4">
                <h1 className="text-2xl font-bold">Quote Preview</h1>
                <Card className="flex items-center justify-center py-6 shadow-none border border-[#ADABAB]">
                    <div className="w-27.25 h-15 flex">
                        <img
                            src={org?.logo}
                            className='max-w-full max-h-full object-contain'
                        />
                    </div>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-y-3 text-md">
                            <span className="">Premium</span>
                            <span className="font-medium text-right">
                                {formatCurrency(premium?.vehicle_premium)}
                            </span>
                            {allBenefits.map((benefit: any) => {
                                const { bg, color } = BENEFIT_TYPE_CONFIG[benefit.type as BenefitType];
                                const displayName = benefit.name ?? benefit.label;
                                return (
                                    <React.Fragment key={benefit?.id}>
                                        <div className={`flex flex-col gap-0.5 ${color}`}>
                                            <span className="">{displayName}</span>
                                        </div>
                                        <div className={`flex items-center justify-end gap-2 ${color}`}>
                                            <span className={` p-0.5 rounded-lg ${bg}`}>
                                                {benefit?.premium === 0 ? "Included" : formatCurrency(benefit?.premium)}
                                            </span>
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                        <div className="grid grid-cols-2 text-sm font-semibold">
                            <span className="text-xs text-muted-foreground">PHCF, TL & Stamp Duty</span>
                            <span className="text-right text-xs">{formatCurrency(premium?.total_duty)}</span>
                        </div>
                        <div className="grid grid-cols-2 text-sm font-semibold">
                            <span>Total Premium</span>
                            <span className="text-right">{formatCurrency(premium?.total_premium)}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <CardFooter className="flex flex-col gap-2 px-0 mt-2 2xl:flex-row 2xl:items-center 2xl:justify-between">
                <div className="flex gap-2 w-full 2xl:w-auto">
                    <Button
                        variant="outline"
                        leftIcon={<Download />}
                        onClick={() => { onSubmit(data) }}
                        loading={submitMutation.isPending}
                        className="flex-1 2xl:flex-none border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 hover:bg-neutral-100 hover:text-neutral-900">
                        Download
                    </Button>
                    <ReusableDropdown
                        trigger={
                            <Button
                                className="flex-1 2xl:flex-none bg-[#C20C0C] text-white hover:bg-[#A30A0A] focus-visible:ring-[#C20C0C]/30"
                                leftIcon={<Forward />}>
                                Share
                            </Button>
                        }
                        items={[
                            {
                                label: "Email",
                                icon: <Mail className="w-4 h-4" />,
                                onClick: () => {
                                    handleDialogContextSwitch({
                                        componentProps: {
                                            data,
                                            requireRecipientEmail: componentProps?.requireRecipientEmail,
                                            defaultEmail: componentProps?.defaultEmail ?? componentProps?.defaultCustomerContact?.email,
                                        },
                                        Component: SendDocumentsViaEmail,
                                    })
                                }
                            },
                            {
                                label: "WhatsApp",
                                icon: <Share2 className="w-4 h-4" />,
                                onClick: () => console.log("WhatsApp")
                            },
                        ]}
                    />
                </div>
                <Button
                    variant="outline"
                    leftIcon={<ShoppingCart />}
                    onClick={() => {
                        handleDialogContextSwitch?.({});
                        onPurchase(data);
                    }}
                    loading={submitPurchaseMutation.isPending}
                    className="w-full 2xl:w-auto border-[#C20C0C] bg-[#FFF5F5] text-[#C20C0C] hover:bg-[#C20C0C] hover:text-white focus-visible:ring-[#C20C0C]/30">
                    Purchase Cover
                </Button>
            </CardFooter>
            <CustomDialogComponent
                {...{ handleDialogContextSwitch, dialogOpen }}
                className='sm:max-w-fit w-[95vw] sm:w-auto p-4 sm:p-6'>
                {dialogContent?.Component && (
                    <dialogContent.Component
                        {...{
                            componentProps: dialogContent.componentProps,
                            handleDialogContextSwitch,
                        }}
                    />
                )}
            </CustomDialogComponent>
        </>
    );
};