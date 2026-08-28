/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button, ReusableDropdown } from "@/dev/core";
import { ArrowLeft, Download, Forward, Mail, Share2 } from "lucide-react";


import type { TDialogComponentProps } from "@/types/types";

export const QuotePreviewPage = ({
  componentProps,
}: TDialogComponentProps<{ data?: any }>) => {

    return (
        <div className="mx-auto max-w-3xl px-4 space-y-6">
            <h1 className="text-2xl font-bold">
                Quote Preview
            </h1>
            <Card className="flex items-center justify-center py-6">
                <img
                    src={componentProps?.data?.header?.src}
                    alt={componentProps?.data?.header?.alt ?? ''}
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
                        <span className="font-medium text-right">Kes 130,000</span>
                        <span className="text-muted-foreground">Excess Protector</span>
                        <Badge className="justify-self-end bg-[#209BFF]">Optional</Badge>
                        <span className="text-muted-foreground">Political Violence & Terrorism</span>
                        <Badge className="justify-self-end bg-[#0CC258]">Inclusive</Badge>
                        <span className="text-muted-foreground">Personal Accident (Insured)</span>
                        <Badge className="justify-self-end bg-[#0CC258]">Covered</Badge>
                        <span className="text-muted-foreground">Courtesy Car (10 days)</span>
                        <Badge className="justify-self-end bg-[#0CC258]">Covered</Badge>
                        <span className="text-muted-foreground">Road Rescue – AA</span>
                        <Badge className="justify-self-end bg-[#0CC258]">Covered</Badge>
                        <span className="text-muted-foreground">PHCF, TL & Stamp Duty</span>
                        <span className="font-medium text-right">Kes 625</span>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 text-sm font-semibold">
                        <span>Total Premium</span>
                        <span className="text-right">Kes 130,625</span>
                    </div>
                </CardContent>
            </Card>
            <CardFooter className="w-full flex flex-col gap-3 sm:flex-row sm:justify-between">
                <Button
                    variant="outline"
                    leftIcon={<ArrowLeft />}
                    className="w-full sm:w-auto">
                    Go Back
                </Button>
                <Button
                    variant="outline"
                    leftIcon={<Download />}
                    className="w-full sm:w-auto">
                    Download
                </Button>
                <ReusableDropdown
                    trigger={
                        <Button
                            className="w-full sm:w-auto bg-[#0CC258] hover:bg-[#0CC258]/80"
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
            </CardFooter>
        </div>
    );
};
