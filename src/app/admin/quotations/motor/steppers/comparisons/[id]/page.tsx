/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Button,
    CustomDialogComponent,
    EmptyState,
    ReusableDropdown,
    SendDocumentsViaEmail
} from "@/dev/core";
import { useCustomDialogContextFactory } from "@/hooks";
import { ArrowDown, Forward, Mail, Share2, ShoppingCart } from "lucide-react";
import React, { useEffect, useState } from "react";
import { ShowToast } from "@/utils/utils";
import { UseApiMutation } from "@/hooks/hooks";
import { premiumPreview, SubmitResponse } from "@/types/types";
import {
    EMETHODS,
    MOTOR_QUOTE_SESSION_STORAGE_KEY,
} from "@/utils/constatnts";
import { persistAdminMotorPurchaseStart } from "../../../admin-motor-session";
import { extractErrorMessage } from "@/utils/helpers";
import { cn } from "@/lib/utils";
import { PREMIUM_KEYS } from "@/utils/enums";

function getBadgeClass(status: string): string {
    const lower = status.toLowerCase()
    if (lower === "inclusive" || lower === "covered") return "bg-green-100 text-green-700"
    if (lower === "optional") return "bg-[#209BFF]/80 text-[#209BFF]"
    if (lower === "compulsory") return "bg-blue-100 text-blue-700"
    return "bg-gray-100 text-gray-600"
}

export const AdminMotorPostComparisonPage: React.FC<premiumPreview> = ({
    componentProps,
    goToNextStep: goToNextStepProp,
}) => {

    const comparisonCount = componentProps?.data?.data?.comparison?.length ?? 0;
    const gridCols =
        comparisonCount === 1
            ? "grid-cols-1"
            : comparisonCount === 2
                ? "grid-cols-1 md:grid-cols-2"
                : comparisonCount === 3
                    ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

    const comparisons: any[] = componentProps?.data?.data?.comparison ?? [];
    const [quoteSessionId, setQuoteSessionId] = useState<number | null>(null);
    const [purchasingRateId, setPurchasingRateId] = useState<string | number | null>(null);

    const goToNextStep = goToNextStepProp ?? componentProps?.goToNextStep;

    useEffect(() => {
        const storedSessionId = Number(sessionStorage.getItem(MOTOR_QUOTE_SESSION_STORAGE_KEY))
        if (Number.isFinite(storedSessionId) && storedSessionId > 0) {
            setQuoteSessionId(storedSessionId)
        } else {
            setQuoteSessionId(null)
        }
    }, [])

    const { handleDialogContextSwitch, dialogContent, dialogOpen } =
        useCustomDialogContextFactory<{
            refetch?: () => Promise<any>
            data?: any
            
        }>()

    const emailComponentData = {
        quote_type: "comparison" as const,
        products: componentProps?.products ?? [],
    }

    const submitPurchaseMutation = UseApiMutation<SubmitResponse, any>({
        url: `purchase/motor/${quoteSessionId}`,
        method: EMETHODS.POST,
        mutationOptions: {
            onSuccess: (data) => {
                setPurchasingRateId(null)
                const purchaseId = data?.data?.purchase_id
                if (purchaseId === undefined) {
                    ShowToast.error("Purchase session could not be initialized. Please try again.")
                    return
                }
                persistAdminMotorPurchaseStart({
                    purchaseId,
                    vehicleInfo: data?.data?.vehicle_info,
                    ownership: data?.data?.ownership,
                })
                goToNextStep?.();
                ShowToast.success(data?.message ?? "Purchase started");
            },
            onError: (error: unknown) => {
                setPurchasingRateId(null)
                const message = extractErrorMessage(error);
                ShowToast.error(message || "Purchase failed!");
            },
        },
    });

    const onPurchase = (productId: number | string, rateId: number | string) => {
        if (!quoteSessionId) {
            ShowToast.error("No active quote session found.")
            return
        }
        setPurchasingRateId(rateId)
        submitPurchaseMutation.mutate({
            'product_id': productId,
            'rate_id': rateId,
        })
    }

    return (
        <div className="space-y-6">
            <h1 className="flex items-center gap-2 px-3 text-2xl font-bold">
                Quotation Comparisons
            </h1>

            {comparisons.length === 0 ? (
                <EmptyState />
            ) : (
                <div className={cn("grid gap-6", gridCols)}>
                    {comparisons.map((item, idx) => {
                        const breakdown = item.breakdown ?? {}
                        const coverages = Object.entries(breakdown).filter(
                            ([key]) => !PREMIUM_KEYS.has(key)
                        )
                        return (
                            <div key={`${item.rate_id}-${idx}`} className="space-y-4">
                                <Card className="shadow-none border border-[#ADABAB]">
                                    <CardHeader className="pb-2 items-center justify-center">
                                        <div className="w-27.25 h-15 flex">
                                            <img
                                                src={item.insuerer_logo}
                                                alt={item.insurer_name ?? ''}
                                                className={cn(
                                                    'max-w-full max-h-full object-contain',
                                                    // header.className
                                                )}
                                            />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-y-3 text-sm">
                                            <span className="text-muted-foreground">Basic Premium</span>
                                            <span className="font-medium text-right">
                                                {breakdown["Basic Premium"] ?? "—"}
                                            </span>
                                            <Separator className="col-span-2 my-1" />
                                            {coverages.map(([label, status], covIdx) => (
                                                <React.Fragment key={covIdx}>
                                                    <span className="text-muted-foreground">{label}</span>
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Badge className={`${getBadgeClass(status as string)}`}>
                                                            {status as string}
                                                        </Badge>
                                                    </div>
                                                </React.Fragment>
                                            ))}

                                            <Separator className="col-span-2 my-1" />

                                            <span className="text-muted-foreground">Levies</span>
                                            <span className="font-medium text-right">
                                                {breakdown["Levies"] ?? "—"}
                                            </span>
                                        </div>
                                        <Separator />
                                        <div className="grid grid-cols-2 text-sm font-semibold">
                                            <span>Total Premium</span>
                                            <span className="text-right">
                                                {breakdown["Gross Premium"] ?? "—"}
                                            </span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="w-full">
                                        <Button
                                            variant="outline"
                                            type="button"
                                            leftIcon={<ShoppingCart />}
                                            onClick={() => onPurchase(item?.product_id, item?.rate_id)}
                                            loading={submitPurchaseMutation.isPending && purchasingRateId === item?.rate_id}
                                            disabled={submitPurchaseMutation.isPending && purchasingRateId !== item?.rate_id}
                                            className=" w-full border-[#C20C0C] bg-[#FFF5F5] text-[#C20C0C] hover:bg-[#C20C0C] hover:text-white focus-visible:ring-[#C20C0C]/30">
                                            Purchase Cover
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        )
                    })}
                </div>
            )}

            <CardFooter className="flex flex-col gap-3 px-0 sm:flex-row sm:justify-end">
                <ReusableDropdown
                    trigger={
                        <Button
                            variant="outline"
                            className="w-full sm:w-auto border-[#C20C0C] bg-[#FFF] hover:bg-[#C20C0C] hover:text-white focus-visible:ring-[#C20C0C]/30"
                            leftIcon={<Forward />}>
                            Share
                        </Button>
                    }
                    items={[
                        {
                            label: "Email",
                            icon: <Mail className="w-4 h-4" />,
                            onClick: () => {
                                const list = emailComponentData.products
                                if (!Array.isArray(list) || list.length < 2) {
                                    ShowToast.error("Comparison products are missing. Generate the comparison again.")
                                    return
                                }
                                handleDialogContextSwitch({
                                    componentProps: {
                                        data: emailComponentData,
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
                <Button
                    type="button"
                    className="w-full sm:w-auto bg-[#C20C0C] hover:bg-[#C20C0C]/70"
                    leftIcon={<ArrowDown />}
                    onClick={() => componentProps?.onDownload?.()}>
                    Download Comparison
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
        </div>
    );
};
