/* eslint-disable @typescript-eslint/no-explicit-any */
import { UseAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button, ReusableDropdown } from "@/dev/core";
import { useStepperContext } from "@/hooks/stepper-context";
import { formatCurrency } from "@/lib/format";
import { EPREFIX, EROUTES } from "@/utils/enums";
import { Download, Forward, Mail, Share2, ShoppingCart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import React from "react";
import { premiumPreview } from "@/types/types";

export const QuotePreviewPage: React.FC<premiumPreview> = ({ componentProps, goToNextStep: goToNextStepProp, handleDialogContextSwitch }) => {
    const { currentStep } = useStepperContext()
    const location = useLocation()
    const { isAuthenticated } = UseAuth()
    const item = componentProps?.data
    const goToNextStep = goToNextStepProp ?? componentProps?.goToNextStep
    const org = item?.product?.organization;
    const premium = item?.calculated_premium;
    const benefits = item?.benefits;
    const getBadge = (type: 'inclusive' | 'compulsory' | 'optional') => {
        const map = {
            inclusive: { label: 'Inclusive', color: 'bg-[#0CC258]' },
            compulsory: { label: 'Compulsory', color: 'bg-[#C20C0C]' },
            optional: { label: 'Optional', color: 'bg-[#209BFF]' },
        }
        return map[type];
    }
    const allBenefits = [
        ...(benefits?.inclusive ?? []).map((b: any) => ({ ...b, type: 'inclusive' as const })),
        ...(benefits?.compulsory ?? []).map((b: any) => ({ ...b, type: 'compulsory' as const })),
        ...(benefits?.optional ?? []).map((b: any) => ({ ...b, type: 'optional' as const })),
    ];
    return (
        <div className="mx-auto max-w-125 min-w-125 px-4 space-y-6">
            <h1 className="text-2xl font-bold">
                Quote Preview
            </h1>
            <Card className="flex items-center justify-center py-6">
                <img
                    src={`${import.meta.env.VITE_BASE_URL}/${org?.logo}`}
                    // alt={componentProps?.data?.product?.organization?.logo ?? ''}
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
                        <span className="font-medium text-right">{formatCurrency(premium?.basic_premium)}</span>
                        <Separator className="col-span-2 my-1" />
                        {allBenefits.map((benefit: any) => {
                            const badge = getBadge(benefit?.type);
                            return (
                                <React.Fragment key={benefit?.id}>
                                    <span className="text-muted-foreground">{benefit?.name}</span>
                                    <div className="flex items-center justify-end gap-2">
                                        {benefit.premium != null && (
                                            <span className="text-xs text-muted-foreground">
                                                {formatCurrency(benefit?.premium)}
                                            </span>
                                        )}
                                        <Badge className={`${badge.color} text-white`}>
                                            {badge?.label}
                                        </Badge>
                                    </div>
                                </React.Fragment>
                            )
                        })}
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 text-sm font-semibold">
                        <span>Total Premium</span>
                        <span className="text-right">{formatCurrency(premium?.total_premium)}</span>
                    </div>
                </CardContent>
            </Card>
            <CardFooter className="w-full flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-0">
                <div className="flex flex-col px-3 gap-2 sm:flex-row sm:items-center w-full sm:w-auto">
                    <Button
                        variant="outline"
                        leftIcon={<Download />}
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
                            {
                                label: "Email",
                                icon: <Mail className="w-4 h-4" />,
                                onClick: () => console.log("Email"),
                            },
                            {
                                label: "WhatsApp",
                                icon: <Share2 className="w-4 h-4" />,
                                onClick: () => console.log("WhatsApp"),
                            },
                        ]} />
                </div>
                {isAuthenticated ? (
                    <Button
                        variant="outline"
                        leftIcon={<ShoppingCart />}
                        onClick={() => {
                            handleDialogContextSwitch?.({})
                            goToNextStep?.()
                        }}
                        className="w-full sm:w-auto text-white hover:text-white bg-[#0CC258] hover:bg-[#0CC258]/80">
                        Purchase Cover
                    </Button>
                ) : (
                    <>
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
                    </>
                )}
            </CardFooter>
        </div>
    );
};
