/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button, CustomDialogComponent, EmptyState, ReusableDropdown, SendDocumentsViaEmail } from "@/dev/core";
import { useCustomDialogContextFactory } from "@/hooks";
import { ArrowDown, Forward, Mail, MoveLeft, Share2 } from "lucide-react";
import React from "react";
import { ShowToast } from "@/utils/utils";

const PREMIUM_KEYS = new Set(["Basic Premium", "Gross Premium", "Levies"])

function getBadgeClass(status: string): string {
    const lower = status.toLowerCase()
    if (lower === "inclusive" || lower === "covered") return "bg-[#0CC258]"
    if (lower === "optional") return "bg-[#209BFF]"
    if (lower === "compulsory") return "bg-[#C20C0C]"
    return "bg-[#9CA3AF]"
}

export const PostComparisonPage = ({
    componentProps,
}: {
    handleDialogContextSwitch: (context?: any) => void
    componentProps?: any
}) => {
    const comparisons: any[] = componentProps?.data?.data?.comparison ?? []

    const { handleDialogContextSwitch, dialogContent, dialogOpen } =
        useCustomDialogContextFactory<{
            refetch?: () => Promise<any>
            data?: any
        }>()

    const emailComponentData = {
        quote_type: "comparison" as const,
        products: componentProps?.products ?? [],
    }

    return (
        <div className="space-y-6">
            <h1 className="flex items-center gap-2 px-3 text-2xl font-bold">
                <Button
                    type="button"
                    className="rounded-md p-1 bg-transparent hover:bg-muted"
                    leftIcon={<MoveLeft className="h-7 w-7 text-primary" />}
                    onClick={() => handleDialogContextSwitch({ state: false })}
                />
                Insurer Comparison
            </h1>

            {comparisons.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {comparisons.map((item, idx) => {
                        const breakdown = item.breakdown ?? {}
                        const coverages = Object.entries(breakdown).filter(
                            ([key]) => !PREMIUM_KEYS.has(key)
                        )

                        return (
                            <div key={`${item.rate_id}-${idx}`} className="space-y-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <h3 className="text-lg font-semibold">{item.insurer_name}</h3>
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
                                                        <Badge className={`${getBadgeClass(status as string)} text-white`}>
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
                                </Card>
                            </div>
                        )
                    })}
                </div>
            )}

            <CardFooter className="flex gap-4 justify-end px-0">
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
                            onClick: () => {
                                const list = emailComponentData.products
                                if (!Array.isArray(list) || list.length < 2) {
                                    ShowToast.error("Comparison products are missing. Generate the comparison again.")
                                    return
                                }
                                handleDialogContextSwitch({
                                    componentProps: { data: emailComponentData },
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
                    className="bg-[#C20C0C] hover:bg-[#C20C0C]/70"
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
