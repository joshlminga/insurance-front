/* eslint-disable @typescript-eslint/no-explicit-any */
import { UseAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button, ReusableDropdown } from "@/dev/core";
import { useStepperContext } from "@/hooks/stepper-context";
import { formatCurrency } from "@/lib/format";
import { EPREFIX, EROUTES } from "@/utils/enums";
import {
    Download,
    Forward,
    Mail,
    Share2,
    ShoppingCart
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
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
    MOTOR_QUOTE_SESSION_STORAGE_KEY
} from "@/utils/constatnts";
import { ShowToast } from "@/utils/utils";
import { UseApiMutation } from "@/hooks/hooks";
import { extractErrorMessage } from "@/utils/helpers";

export const QuotePreviewPage: React.FC<premiumPreview> = ({
    componentProps,
    goToNextStep: goToNextStepProp,
    handleDialogContextSwitch,
}) => {

    const { currentStep } = useStepperContext();
    const [quoteSessionId, setQuoteSessionId] = useState<number | null>(null)
    const location = useLocation();
    const { isAuthenticated } = UseAuth();
    const item = componentProps?.data;

    const goToNextStep = goToNextStepProp ?? componentProps?.goToNextStep;
    const org = item?.product?.organization;
    const premium = item?.calculated_premium;
    const benefits = item?.benefits;

    const allBenefits = BENEFIT_SECTIONS.flatMap(({ type, key }) =>
        (benefits?.[key] ?? []).map((b: any) => ({ ...b, type }))
    );

    useEffect(() => {
        const storedSessionId = Number(localStorage.getItem(MOTOR_QUOTE_SESSION_STORAGE_KEY))
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
                const link = document.createElement('a');

                link.href = url;
                link.download = `quote-${quoteSessionId}.pdf`;
                document.body.appendChild(link);
                link.click();

                link.remove();
                window.URL.revokeObjectURL(url);

                ShowToast.success("Download started");
            },
            onError: (error: unknown) => {
                const message = extractErrorMessage(error);
                ShowToast.error(message || "Download failed!");
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

    return (
        <>
            <div className="mx-auto max-w-125 min-w-125 px-4 space-y-6">
                <h1 className="text-2xl font-bold">Quote Preview</h1>
                <Card className="flex items-center justify-center py-6">
                    <img
                        src={`${import.meta.env.VITE_BASE_URL}/${org?.logo}`}
                        className="w-36 h-16 object-contain"
                    />
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <h3 className="text-lg font-semibold">Coverage Details</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-y-3 text-sm">

                            <span className="text-muted-foreground">Basic Premium</span>
                            <span className="font-medium text-right">
                                {formatCurrency(premium?.basic_premium)}
                            </span>
                            <Separator className="col-span-2 my-1" />
                            {allBenefits.map((benefit: any) => {
                                const { label, color } = BENEFIT_TYPE_CONFIG[benefit.type as BenefitType];
                                const displayName = benefit.name ?? benefit.label;
                                const hasRate = benefit?.rate != null;
                                const hasMinimum = benefit?.minimum != null;
                                return (
                                    <React.Fragment key={benefit?.id}>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-muted-foreground">{displayName}</span>
                                            {(hasRate || hasMinimum) && (
                                                <span className="text-xs text-muted-foreground/70">
                                                    {hasRate && `Rate: ${(parseFloat(benefit?.rate) * 100).toFixed(3)}%`}
                                                    {hasRate && hasMinimum && " · "}
                                                    {hasMinimum && `Min: ${formatCurrency(parseFloat(benefit?.minimum))}`}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="text-xs text-muted-foreground">
                                                {benefit?.premium === 0 ? "Included" : formatCurrency(benefit?.premium)}
                                            </span>
                                            <Badge className={`${color} text-white`}>{label}</Badge>
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 text-sm font-semibold">
                            <span>Total Premium</span>
                            <span className="text-right">{formatCurrency(premium?.total_premium)}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <CardFooter className="w-full flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-0 mt-2">
                <div className="flex flex-col px-3 gap-2 sm:flex-row sm:items-center w-full sm:w-auto">
                    <Button
                        variant="outline"
                        leftIcon={<Download />}
                        onClick={() => {onSubmit(data)}}
                         loading={submitMutation.isPending}
                        className="w-full sm:w-auto">
                        Download
                    </Button>
                    <ReusableDropdown
                        trigger={
                            <Button
                                className="w-full sm:w-auto bg-[#209BFF] hover:bg-[#209BFF]/80"
                                leftIcon={<Forward />}>
                                Share
                            </Button>
                        }
                        items={[
                            { label: "Email", icon: <Mail className="w-4 h-4" />, onClick: () => console.log("Email") },
                            { label: "WhatsApp", icon: <Share2 className="w-4 h-4" />, onClick: () => console.log("WhatsApp") },
                        ]}
                    />
                </div>
                {isAuthenticated ? (
                    <Button
                        variant="outline"
                        leftIcon={<ShoppingCart />}
                        onClick={() => {
                            handleDialogContextSwitch?.({});
                            onPurchase(data);
                        }}
                        loading={submitPurchaseMutation.isPending}
                        className="w-full sm:w-auto text-white hover:text-white bg-[#0CC258] hover:bg-[#0CC258]/80">
                        Purchase Cover
                    </Button>
                ) : (
                    <Link
                        to={`/${EPREFIX.AUTH}${EROUTES.SIGNUP}`}
                        state={{ returnTo: location.pathname, stepperStep: currentStep }}
                        className="w-full lg:w-auto">
                        <Button
                            type="button"
                            className="w-full lg:w-auto rounded-md border border-[#D9D9D9] bg-[#0CC258] hover:bg-[#0CC258]/90 font-medium text-white">
                            Purchase Cover
                        </Button>
                    </Link>
                )}
            </CardFooter>
        </>
    );
};